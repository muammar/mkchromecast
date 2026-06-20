import unittest
from unittest import mock

from mkchromecast import screencast_wayland


class WaylandDetectionTests(unittest.TestCase):
    def test_detects_wayland_via_session_type(self):
        with mock.patch.dict("os.environ",
                             {"XDG_SESSION_TYPE": "wayland"}, clear=True):
            self.assertTrue(screencast_wayland.is_wayland_session())

    def test_detects_wayland_via_wayland_display(self):
        with mock.patch.dict("os.environ",
                             {"WAYLAND_DISPLAY": "wayland-0"}, clear=True):
            self.assertTrue(screencast_wayland.is_wayland_session())

    def test_x11_is_not_wayland(self):
        with mock.patch.dict("os.environ",
                             {"XDG_SESSION_TYPE": "x11"}, clear=True):
            self.assertFalse(screencast_wayland.is_wayland_session())

    def test_empty_env_is_not_wayland(self):
        with mock.patch.dict("os.environ", {}, clear=True):
            self.assertFalse(screencast_wayland.is_wayland_session())


class FfmpegProbeTests(unittest.TestCase):
    def test_probe_true_when_filter_listed(self):
        completed = mock.Mock(stdout="... pipewiregrab     V->V ...\n")
        with mock.patch("subprocess.run", return_value=completed) as run:
            self.assertTrue(screencast_wayland.ffmpeg_has_pipewiregrab())
        run.assert_called_once()

    def test_probe_false_when_filter_absent(self):
        completed = mock.Mock(stdout="... scale     V->V ...\n")
        with mock.patch("subprocess.run", return_value=completed):
            self.assertFalse(screencast_wayland.ffmpeg_has_pipewiregrab())

    def test_probe_false_when_ffmpeg_missing(self):
        with mock.patch("subprocess.run", side_effect=FileNotFoundError()):
            self.assertFalse(screencast_wayland.ffmpeg_has_pipewiregrab())


if __name__ == "__main__":
    unittest.main()
