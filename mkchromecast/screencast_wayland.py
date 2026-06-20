# This file is part of mkchromecast.

"""Wayland desktop capture via xdg-desktop-portal + PipeWire.

Used by the --screencast path when running under a Wayland session. Isolates
all D-Bus / portal logic so the rest of the codebase stays synchronous and
X11-focused.
"""

import os
import subprocess

import gi

gi.require_version("Gio", "2.0")
gi.require_version("GLib", "2.0")
from gi.repository import Gio, GLib  # noqa: E402

_PORTAL_BUS = "org.freedesktop.portal.Desktop"
_PORTAL_PATH = "/org/freedesktop/portal/desktop"
_SCREENCAST_IFACE = "org.freedesktop.portal.ScreenCast"
_REQUEST_IFACE = "org.freedesktop.portal.Request"

# org.freedesktop.portal.ScreenCast source types / cursor modes.
_SOURCE_TYPE_MONITOR = 1
_CURSOR_MODE_EMBEDDED = 2


class PortalError(Exception):
    """Raised when the xdg-desktop-portal ScreenCast handshake fails."""


def is_wayland_session() -> bool:
    """Returns True if we appear to be running under a Wayland session."""
    if os.environ.get("XDG_SESSION_TYPE") == "wayland":
        return True
    return bool(os.environ.get("WAYLAND_DISPLAY"))


def ffmpeg_has_pipewiregrab() -> bool:
    """Returns True if the local ffmpeg exposes the pipewiregrab filter.

    The pipewiregrab lavfi source was added in ffmpeg 7.1; this is how we
    detect a new-enough ffmpeg for the Wayland capture path.
    """
    try:
        completed = subprocess.run(
            ["ffmpeg", "-hide_banner", "-filters"],
            capture_output=True,
            text=True,
            check=False,
        )
    except FileNotFoundError:
        return False
    return "pipewiregrab" in (completed.stdout or "")


class PortalScreenCastSession:
    """Drives the xdg-desktop-portal ScreenCast handshake.

    The portal uses an async Request/Response pattern: each method call returns
    a Request object path, and the actual result arrives later on that object's
    Response signal. We predict the request path (from a handle_token), subscribe
    to its Response signal before invoking the method, and run a GLib main loop
    until the response arrives.

    The instance keeps the session (and thus the PipeWire stream) alive for as
    long as it exists; call close() to tear it down.
    """

    def __init__(self, timeout_seconds: int = 300) -> None:
        try:
            self._bus = Gio.bus_get_sync(Gio.BusType.SESSION, None)
        except GLib.Error as exc:
            raise PortalError(f"Could not connect to the session bus: {exc}")

        # Unique bus name like ":1.42" -> "1_42", used to predict request paths.
        unique = self._bus.get_unique_name()
        self._sender = unique[1:].replace(".", "_")
        self._loop = GLib.MainLoop()
        self._token_counter = 0
        self._session_handle = None
        self._timeout_seconds = timeout_seconds

        # Per-call response state.
        self._response_code = None
        self._response_results = None

    def _next_token(self, prefix: str) -> str:
        self._token_counter += 1
        return f"{prefix}{self._token_counter}"

    def _request_path(self, token: str) -> str:
        return (f"/org/freedesktop/portal/desktop/request/"
                f"{self._sender}/{token}")

    def _on_response(self, _conn, _sender, _path, _iface, _signal, params):
        self._response_code, self._response_results = params.unpack()
        self._loop.quit()

    def _call_with_request(self, method: str, build_variant) -> dict:
        """Invokes a portal method that follows the Request/Response pattern.

        build_variant receives the handle_token and returns the full input
        GVariant for the method. Returns the Response results vardict, or raises
        PortalError if the user cancelled or the portal reported an error.
        """
        token = self._next_token("req")
        request_path = self._request_path(token)

        subscription = self._bus.signal_subscribe(
            _PORTAL_BUS, _REQUEST_IFACE, "Response", request_path, None,
            Gio.DBusSignalFlags.NONE, self._on_response)

        self._response_code = None
        self._response_results = None
        self._timed_out = False

        def _on_timeout():
            self._timed_out = True
            self._loop.quit()
            return GLib.SOURCE_REMOVE

        timeout_id = GLib.timeout_add_seconds(self._timeout_seconds, _on_timeout)
        try:
            self._bus.call_sync(
                _PORTAL_BUS, _PORTAL_PATH, _SCREENCAST_IFACE, method,
                build_variant(token), GLib.VariantType("(o)"),
                Gio.DBusCallFlags.NONE, -1, None)
            self._loop.run()
        except GLib.Error as exc:
            raise PortalError(f"Portal call {method} failed: {exc}")
        finally:
            if not self._timed_out:
                GLib.source_remove(timeout_id)
            self._bus.signal_unsubscribe(subscription)

        if self._timed_out:
            raise PortalError(
                f"Timed out waiting for portal response during {method}.")
        if self._response_code != 0:
            raise PortalError(
                f"Screencast was cancelled or denied (response "
                f"{self._response_code}) during {method}.")
        return self._response_results

    def open(self) -> tuple[int, int]:
        """Runs the full handshake and returns (pipewire_fd, node_id)."""
        # 1. CreateSession.
        session_token = self._next_token("sess")

        def create_session_args(handle_token):
            options = GLib.Variant("a{sv}", {
                "handle_token": GLib.Variant("s", handle_token),
                "session_handle_token": GLib.Variant("s", session_token),
            })
            return GLib.Variant("(a{sv})", (options,))

        results = self._call_with_request("CreateSession", create_session_args)
        self._session_handle = results["session_handle"]

        # 2. SelectSources (monitor only, embedded cursor).
        def select_sources_args(handle_token):
            options = GLib.Variant("a{sv}", {
                "handle_token": GLib.Variant("s", handle_token),
                "types": GLib.Variant("u", _SOURCE_TYPE_MONITOR),
                "multiple": GLib.Variant("b", False),
                "cursor_mode": GLib.Variant("u", _CURSOR_MODE_EMBEDDED),
            })
            return GLib.Variant("(oa{sv})", (self._session_handle, options))

        self._call_with_request("SelectSources", select_sources_args)

        # 3. Start (shows the picker; returns the streams).
        def start_args(handle_token):
            options = GLib.Variant("a{sv}", {
                "handle_token": GLib.Variant("s", handle_token),
            })
            return GLib.Variant("(osa{sv})",
                                (self._session_handle, "", options))

        results = self._call_with_request("Start", start_args)
        streams = results.get("streams")
        if not streams:
            raise PortalError("Portal returned no screencast streams.")
        node_id = streams[0][0]

        # 4. OpenPipeWireRemote (returns the fd directly, not via Request).
        fd = self._open_pipewire_remote()
        return fd, node_id

    def _open_pipewire_remote(self) -> int:
        options = GLib.Variant("a{sv}", {})
        args = GLib.Variant("(oa{sv})", (self._session_handle, options))
        try:
            result, out_fd_list = self._bus.call_with_unix_fd_list_sync(
                _PORTAL_BUS, _PORTAL_PATH, _SCREENCAST_IFACE,
                "OpenPipeWireRemote", args, GLib.VariantType("(h)"),
                Gio.DBusCallFlags.NONE, -1, None, None)
        except GLib.Error as exc:
            raise PortalError(f"OpenPipeWireRemote failed: {exc}")

        fd_index = result.unpack()[0]
        return out_fd_list.get(fd_index)

    def close(self) -> None:
        """Closes the portal session, tearing down the PipeWire stream."""
        if self._session_handle is None:
            return
        try:
            self._bus.call_sync(
                _PORTAL_BUS, self._session_handle,
                "org.freedesktop.portal.Session", "Close",
                None, None, Gio.DBusCallFlags.NONE, -1, None)
        except GLib.Error:
            pass
        finally:
            self._session_handle = None
