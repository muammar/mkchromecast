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


class GstProbeTests(unittest.TestCase):
    def test_available_when_binary_and_all_elements_present(self):
        with mock.patch("shutil.which", return_value="/usr/bin/gst-launch-1.0"), \
             mock.patch("subprocess.run",
                        return_value=mock.Mock(returncode=0)):
            available, missing = (
                screencast_wayland.gstreamer_screencast_available())
        self.assertTrue(available)
        self.assertEqual([], missing)

    def test_unavailable_when_gst_launch_missing(self):
        with mock.patch("shutil.which", return_value=None):
            available, missing = (
                screencast_wayland.gstreamer_screencast_available())
        self.assertFalse(available)
        self.assertIn("gst-launch-1.0", missing)

    def test_unavailable_lists_missing_elements(self):
        def fake_run(cmd, **kwargs):
            # cmd is ["gst-inspect-1.0", <element>]; mp4mux is "missing".
            element = cmd[1]
            return mock.Mock(returncode=1 if element == "mp4mux" else 0)

        with mock.patch("shutil.which", return_value="/usr/bin/gst-launch-1.0"), \
             mock.patch("subprocess.run", side_effect=fake_run):
            available, missing = (
                screencast_wayland.gstreamer_screencast_available())
        self.assertFalse(available)
        self.assertEqual(["mp4mux"], missing)

    def test_unavailable_when_gst_inspect_missing(self):
        with mock.patch("shutil.which", return_value="/usr/bin/gst-launch-1.0"), \
             mock.patch("subprocess.run", side_effect=FileNotFoundError()):
            available, missing = (
                screencast_wayland.gstreamer_screencast_available())
        self.assertFalse(available)
        self.assertTrue(missing)


if __name__ == "__main__":
    unittest.main()
