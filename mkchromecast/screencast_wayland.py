# This file is part of mkchromecast.

"""Wayland desktop capture via xdg-desktop-portal + PipeWire.

Used by the --screencast path when running under a Wayland session. Isolates
all D-Bus / portal logic so the rest of the codebase stays synchronous and
X11-focused.
"""

import os
import shutil
import subprocess

# gi / PyGObject is only needed for the actual portal handshake
# (PortalScreenCastSession). It is imported lazily via _ensure_gi() so that
# merely importing this module — which video.py does for every video cast to
# reach is_wayland_session() / gstreamer_screencast_available() — does not
# require PyGObject on non-Wayland-screencast paths (macOS, input-file, X11).
Gio = None
GLib = None


def _ensure_gi() -> None:
    """Imports gi and binds Gio/GLib as module globals; raises PortalError.

    Called from PortalScreenCastSession before any Gio/GLib use. Raising
    PortalError (rather than ImportError) lets the existing screencast error
    handling print an actionable install message instead of crashing.
    """
    global Gio, GLib
    if Gio is not None:
        return
    try:
        import gi
        gi.require_version("Gio", "2.0")
        gi.require_version("GLib", "2.0")
        from gi.repository import Gio as _Gio, GLib as _GLib
    except (ImportError, ValueError) as exc:
        raise PortalError(
            "Wayland screencast needs PyGObject (the 'gi' module) with the "
            "Gio and GLib typelibs. Install it (on Arch: python-gobject and "
            f"the gobject-introspection runtime). Underlying error: {exc}")
    Gio = _Gio
    GLib = _GLib


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


_GST_LAUNCH = "gst-launch-1.0"
_GST_INSPECT = "gst-inspect-1.0"

# Elements used by the Wayland screencast gst-launch pipeline. These come from
# optional GStreamer plugin packages and are the ones likely to be missing if a
# package is not installed; if they're present, the core/base elements are too.
_REQUIRED_GST_ELEMENTS = (
    "pipewiresrc",   # PipeWire GStreamer plugin
    "videoconvert",  # gst-plugins-base
    "x264enc",       # gst-plugins-ugly
    "h264parse",     # gst-plugins-bad
    "mp4mux",        # gst-plugins-good
    "fdsink",        # gst core
    "pulsesrc",      # gst-plugins-good
    "audioconvert",  # gst-plugins-base
    "avenc_aac",     # gst-libav
    "aacparse",      # gst-plugins-good
)


def gstreamer_screencast_available() -> tuple[bool, list[str]]:
    """Checks for gst-launch-1.0 and the elements the Wayland pipeline needs.

    Returns (available, missing): `missing` lists the gst-launch binary and/or
    any absent elements, so the caller can print an actionable message naming
    exactly what to install.
    """
    missing: list[str] = []
    if shutil.which(_GST_LAUNCH) is None:
        missing.append(_GST_LAUNCH)
        return False, missing

    for element in _REQUIRED_GST_ELEMENTS:
        if not _gst_has_element(element):
            missing.append(element)

    return (not missing), missing


def _gst_has_element(name: str) -> bool:
    try:
        result = subprocess.run(
            [_GST_INSPECT, name],
            capture_output=True,
            check=False,
        )
    except FileNotFoundError:
        return False
    return result.returncode == 0


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
        # Bind Gio/GLib lazily — PyGObject is only required once we actually
        # drive the portal handshake, not merely to import this module.
        _ensure_gi()

        # Acquire the bus connection here, AFTER the fork.  This class is
        # instantiated inside the forked pipeline child; inheriting a parent's
        # GDBus connection across fork would be unsafe.
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

    # NOTE on GVariant construction (the `*_args` builders below): the options
    # value must be a **native dict** (with Variant values); the outer tuple
    # format string builds the `a{sv}`. Passing a pre-built `GLib.Variant("a{sv}",
    # …)` there makes PyGObject try to iterate the Variant as a dict and raise
    # KeyError. These builders are extracted (rather than inlined closures) so
    # they can be unit-tested without a live D-Bus session.

    def _create_session_args(self, handle_token: str,
                             session_token: str) -> "GLib.Variant":
        options = {
            "handle_token": GLib.Variant("s", handle_token),
            "session_handle_token": GLib.Variant("s", session_token),
        }
        return GLib.Variant("(a{sv})", (options,))

    def _select_sources_args(self, handle_token: str) -> "GLib.Variant":
        options = {
            "handle_token": GLib.Variant("s", handle_token),
            "types": GLib.Variant("u", _SOURCE_TYPE_MONITOR),
            "multiple": GLib.Variant("b", False),
            "cursor_mode": GLib.Variant("u", _CURSOR_MODE_EMBEDDED),
        }
        return GLib.Variant("(oa{sv})", (self._session_handle, options))

    def _start_args(self, handle_token: str) -> "GLib.Variant":
        options = {
            "handle_token": GLib.Variant("s", handle_token),
        }
        return GLib.Variant("(osa{sv})", (self._session_handle, "", options))

    def open(self) -> tuple[int, int]:
        """Runs the full handshake and returns (pipewire_fd, node_id)."""
        # 1. CreateSession.
        session_token = self._next_token("sess")
        results = self._call_with_request(
            "CreateSession",
            lambda token: self._create_session_args(token, session_token))
        self._session_handle = results["session_handle"]

        # 2. SelectSources (monitor only, embedded cursor).
        self._call_with_request("SelectSources", self._select_sources_args)

        # 3. Start (shows the picker; returns the streams).
        results = self._call_with_request("Start", self._start_args)
        streams = results.get("streams")
        if not streams:
            raise PortalError("Portal returned no screencast streams.")
        node_id = streams[0][0]

        # 4. OpenPipeWireRemote (returns the fd directly, not via Request).
        fd = self._open_pipewire_remote()
        return fd, node_id

    def _open_pipewire_remote(self) -> int:
        args = GLib.Variant("(oa{sv})", (self._session_handle, {}))
        try:
            result, out_fd_list = self._bus.call_with_unix_fd_list_sync(
                _PORTAL_BUS, _PORTAL_PATH, _SCREENCAST_IFACE,
                "OpenPipeWireRemote", args, GLib.VariantType("(h)"),
                Gio.DBusCallFlags.NONE, -1, None, None)
        except GLib.Error as exc:
            raise PortalError(f"OpenPipeWireRemote failed: {exc}")

        fd_index = result.unpack()[0]
        fd = out_fd_list.get(fd_index)
        if fd < 0:
            raise PortalError("Portal returned an invalid PipeWire file descriptor.")
        return fd

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
