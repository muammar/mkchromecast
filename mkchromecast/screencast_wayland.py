# This file is part of mkchromecast.

"""Wayland desktop capture via xdg-desktop-portal + PipeWire.

Used by the --screencast path when running under a Wayland session. Isolates
all D-Bus / portal logic so the rest of the codebase stays synchronous and
X11-focused.
"""

import os
import subprocess


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
