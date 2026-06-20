# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import getpass
import os
import pickle
import subprocess

import mkchromecast
from mkchromecast import colors
from mkchromecast import pipeline_builder
from mkchromecast import screencast_wayland
from mkchromecast import stream_infra
from mkchromecast import utils
from mkchromecast.constants import OpMode

# Holds the live portal session for Wayland screencast so it is not garbage
# collected before ffmpeg (spawned lazily by the Flask server) inherits its fd.
# In v1, PortalScreenCastSession.close() is intentionally never called
# explicitly — cleanup happens when the forked streaming child process exits on
# teardown (the kernel closes all fds and the portal session is dropped).
_active_wayland_session = None


def wayland_screencast_preflight(mkcc):
    """Main-process precondition check for Wayland screencast.

    Runs in the *main* process before any cast is attempted. If we're about to
    do a Wayland screencast but GStreamer (or a required element) is missing,
    print an actionable message and terminate cleanly here — rather than letting
    the forked streaming child fail later while the main process casts to a dead
    stream. The portal handshake itself must stay in the child (the PipeWire fd
    is only valid there), so only this pure capability check pre-flights early.
    """
    if not (mkcc.operation == OpMode.SCREENCAST
            and screencast_wayland.is_wayland_session()):
        return

    available, missing = screencast_wayland.gstreamer_screencast_available()
    if not available:
        print(colors.error(
            "Wayland screencast needs GStreamer, but these are missing: "
            + ", ".join(missing) + "."))
        print(colors.warning(
            "Install the GStreamer pieces (on Arch: gst-plugins-base, "
            "gst-plugins-good, gst-plugins-bad, gst-plugins-ugly, gst-libav, "
            "and the PipeWire GStreamer plugin)."))
        utils.terminate()


def _flask_init():
    global _active_wayland_session
    mkcc = mkchromecast.Mkchromecast()

    wayland_capture = None
    pass_fds = None
    if (mkcc.operation == OpMode.SCREENCAST
            and screencast_wayland.is_wayland_session()):
        try:
            _active_wayland_session = (
                screencast_wayland.PortalScreenCastSession())
            fd, node = _active_wayland_session.open()
        except screencast_wayland.PortalError as exc:
            print(colors.error(f"Wayland screencast failed: {exc}"))
            print(colors.warning(
                "Ensure xdg-desktop-portal (with a backend such as "
                "xdg-desktop-portal-gnome, -kde, or -wlr) and PipeWire are "
                "installed and running."))
            utils.terminate()
            return

        os.set_inheritable(fd, True)
        wayland_capture = (fd, node)
        pass_fds = [fd]

    # TODO(xsdg): Passing args in one-by-one to facilitate refactoring
    # the Mkchromecast object so that it has argument groups instead of just a
    # giant set of uncoordinated and conflicting arguments.
    encode_settings = pipeline_builder.VideoSettings(
        display=mkcc.display,
        fps=mkcc.fps,
        input_file=mkcc.input_file,
        loop=mkcc.loop,
        operation=mkcc.operation,
        resolution=mkcc.resolution,
        screencast=mkcc.screencast,
        seek=mkcc.seek,
        subtitles=mkcc.subtitles,
        user_command=mkcc.command,
        vcodec=mkcc.vcodec,
        youtube_url=mkcc.youtube_url,
        wayland_capture=wayland_capture,
    )
    builder = pipeline_builder.Video(encode_settings)
    if mkcc.debug is True:
        print(f":::ffmpeg::: pipeline_builder command: {builder.command}")

    stream_infra.FlaskServer.init_video(
        chunk_size=mkcc.chunk_size,
        command=builder.command,
        media_type=(mkcc.mtype or "video/mp4"),
        pass_fds=pass_fds,
    )


def main():
    mkcc = mkchromecast.Mkchromecast()
    ip = utils.get_effective_ip(
        mkcc.platform, host_override=mkcc.host, fallback_ip="0.0.0.0")

    if mkcc.backend != "node":
        pipeline = stream_infra.PipelineProcess(_flask_init, ip, mkcc.port, mkcc.platform)
        pipeline.start()
    else:
        print("Starting Node")

        # TODO(xsdg): This implies that the `node` backend is only compatible
        # with INPUT_FILE OpMode, for video.  Double-check what's happening here
        # and then implement that constraint directly in the Mkchromecast class.
        if mkcc.operation != OpMode.INPUT_FILE:
            print(colors.warning(
                "The node video backend requires and only supports the input "
                "file operation (-i argument)."))
            utils.terminate()

        if mkcc.platform == "Darwin":
            PATH = (
                "./bin:./nodejs/bin:/Users/"
                + str(getpass.getuser())
                + "/bin:/usr/local/bin:/usr/local/sbin:"
                + "/usr/bin:/bin:/usr/sbin:"
                + "/sbin:/opt/X11/bin:/usr/X11/bin:/usr/games:"
                + os.environ["PATH"]
            )
        else:
            PATH = os.environ["PATH"]

        if mkcc.debug is True:
            print("PATH = %s." % PATH)

        node_names = ["node"]
        nodejs_dir = ["./nodejs/"]

        # TODO(xsdg): This is not necessarily where mkchromecast is installed,
        # and may point to an unrelated mkchromecast install.
        if mkcc.platform == "Linux":
            node_names.append("nodejs")
            nodejs_dir.append("/usr/share/mkchromecast/nodejs/")

        for name in node_names:
            if utils.is_installed(name, PATH, mkcc.debug):
                for path in nodejs_dir:
                    if os.path.isdir(path):
                        path = path + "html5-video-streamer.js"
                        webcast = [name, path, mkcc.input_file]
                        break

        try:
            subprocess.Popen(webcast)
        except:
            # TODO(xsdg): Capture a specific exception here.
            print(
                colors.warning(
                    "Nodejs is not installed in your system. "
                    "Please, install it to use this backend."
                )
            )
            print(colors.warning("Closing the application..."))
            utils.terminate()
