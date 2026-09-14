"""Unit tests for mkchromecast.video Wayland failure branches.

These cover the Wayland error paths that terminate early, requiring no live
compositor, portal, or PipeWire daemon.
"""

import types
import unittest
from unittest import mock

from mkchromecast import screencast_wayland
from mkchromecast.constants import OpMode


def _make_stub_mkcc():
    """A SimpleNamespace mimicking the Mkchromecast attributes the video code
    reads. Tests override what they need.
    """
    return types.SimpleNamespace(
        operation=OpMode.SCREENCAST,
        display=":0",
        fps=30,
        input_file=None,
        loop=False,
        resolution="1920x1080",
        screencast=True,
        seek=None,
        subtitles=None,
        command=None,
        vcodec="h264",
        youtube_url=None,
        debug=False,
        mtype=None,
        chunk_size=8192,
    )


class WaylandPreflightTest(unittest.TestCase):
    """wayland_screencast_preflight: main-process capability gate."""

    def test_terminates_when_gstreamer_missing(self):
        stub = _make_stub_mkcc()
        with (
            mock.patch(
                "mkchromecast.video.screencast_wayland.is_wayland_session",
                return_value=True,
            ),
            mock.patch(
                "mkchromecast.video.screencast_wayland."
                "gstreamer_screencast_available",
                return_value=(False, ["mp4mux"]),
            ),
            mock.patch("mkchromecast.video.utils.terminate") as mock_terminate,
        ):
            import mkchromecast.video
            mkchromecast.video.wayland_screencast_preflight(stub)

        mock_terminate.assert_called_once()

    def test_no_terminate_when_gstreamer_available(self):
        stub = _make_stub_mkcc()
        with (
            mock.patch(
                "mkchromecast.video.screencast_wayland.is_wayland_session",
                return_value=True,
            ),
            mock.patch(
                "mkchromecast.video.screencast_wayland."
                "gstreamer_screencast_available",
                return_value=(True, []),
            ),
            mock.patch("mkchromecast.video.utils.terminate") as mock_terminate,
        ):
            import mkchromecast.video
            mkchromecast.video.wayland_screencast_preflight(stub)

        mock_terminate.assert_not_called()

    def test_no_check_when_not_wayland(self):
        stub = _make_stub_mkcc()
        with (
            mock.patch(
                "mkchromecast.video.screencast_wayland.is_wayland_session",
                return_value=False,
            ),
            mock.patch(
                "mkchromecast.video.screencast_wayland."
                "gstreamer_screencast_available",
            ) as mock_probe,
            mock.patch("mkchromecast.video.utils.terminate") as mock_terminate,
        ):
            import mkchromecast.video
            mkchromecast.video.wayland_screencast_preflight(stub)

        mock_probe.assert_not_called()
        mock_terminate.assert_not_called()


class FlaskInitWaylandPortalErrorTest(unittest.TestCase):
    """_flask_init: Wayland + portal handshake raises → terminate + return."""

    def test_terminate_called_and_init_video_not_called(self):
        stub = _make_stub_mkcc()

        portal_error_session = mock.MagicMock()
        portal_error_session.open.side_effect = screencast_wayland.PortalError(
            "boom")

        with (
            mock.patch(
                "mkchromecast.video.mkchromecast.Mkchromecast",
                return_value=stub,
            ),
            mock.patch(
                "mkchromecast.video.screencast_wayland.is_wayland_session",
                return_value=True,
            ),
            mock.patch(
                "mkchromecast.video.screencast_wayland.PortalScreenCastSession",
                return_value=portal_error_session,
            ),
            mock.patch(
                "mkchromecast.video.utils.terminate",
            ) as mock_terminate,
            mock.patch(
                "mkchromecast.video.stream_infra.FlaskServer.init_video",
            ) as mock_init_video,
        ):
            import mkchromecast.video
            mkchromecast.video._flask_init()

        mock_terminate.assert_called_once()
        mock_init_video.assert_not_called()


class FlaskInitWaylandSuccessTest(unittest.TestCase):
    """_flask_init: Wayland success → command_factory minting a fresh fd."""

    def test_command_factory_mints_fresh_fd_per_request(self):
        stub = _make_stub_mkcc()
        stub.resolution = None  # use the pipeline's 1080p default

        session = mock.MagicMock()
        session.open.return_value = 42  # node id
        session.open_pipewire_fd.side_effect = [7, 8, 9]

        captured = {}

        def fake_init_video(**kwargs):
            captured.update(kwargs)

        with (
            mock.patch(
                "mkchromecast.video.mkchromecast.Mkchromecast",
                return_value=stub,
            ),
            mock.patch(
                "mkchromecast.video.screencast_wayland.is_wayland_session",
                return_value=True,
            ),
            mock.patch(
                "mkchromecast.video.screencast_wayland.PortalScreenCastSession",
                return_value=session,
            ),
            mock.patch("mkchromecast.video.os.set_inheritable"),
            mock.patch(
                "mkchromecast.video.stream_infra.FlaskServer.init_video",
                side_effect=fake_init_video,
            ),
        ):
            import mkchromecast.video
            mkchromecast.video._flask_init()

            # Handshake runs once; serving is wired through a factory, not a
            # static command + pass_fds. (Invoke the factory inside the patched
            # context so os.set_inheritable stays stubbed.)
            session.open.assert_called_once()
            self.assertIsNotNone(captured.get("command_factory"))
            self.assertNotIn("command", captured)
            self.assertNotIn("pass_fds", captured)

            factory = captured["command_factory"]
            cmd1, fds1 = factory()
            cmd2, fds2 = factory()

        # Each request mints a distinct fresh fd, baked into that request's
        # pipewiresrc command and returned for the child to inherit.
        self.assertEqual(fds1, [7])
        self.assertEqual(fds2, [8])
        self.assertIn("fd=7", cmd1)
        self.assertIn("fd=8", cmd2)
        self.assertIn("path=42", cmd1)
        self.assertEqual(session.open_pipewire_fd.call_count, 2)


if __name__ == "__main__":
    unittest.main()
