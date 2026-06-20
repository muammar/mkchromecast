import unittest
from unittest import mock

from mkchromecast import stream_infra


class PassFdsTests(unittest.TestCase):
    def setUp(self):
        # FlaskServer is a singleton-by-class-state; reset between tests.
        stream_infra.FlaskServer._app = None
        stream_infra.FlaskServer._video_mode = None
        stream_infra.FlaskServer._pass_fds = None

    def test_init_video_stores_pass_fds(self):
        stream_infra.FlaskServer.init_video(
            chunk_size=64 * 1024,
            command=["ffmpeg", "pipe:1"],
            media_type="video/mp4",
            pass_fds=[7],
        )
        self.assertEqual([7], stream_infra.FlaskServer._pass_fds)

    def test_stream_video_forwards_pass_fds_to_popen(self):
        stream_infra.FlaskServer.init_video(
            chunk_size=64 * 1024,
            command=["ffmpeg", "pipe:1"],
            media_type="video/mp4",
            pass_fds=[7],
        )

        fake_proc = mock.Mock()
        fake_proc.stdout.fileno.return_value = 99
        with mock.patch("mkchromecast.stream_infra.Popen",
                        return_value=fake_proc) as popen, \
             mock.patch("mkchromecast.stream_infra.os.read", return_value=b""), \
             mock.patch("mkchromecast.stream_infra.flask.Response",
                        autospec=True):
            stream_infra.FlaskServer._stream_video()

        _, kwargs = popen.call_args
        self.assertEqual([7], kwargs.get("pass_fds"))

    def test_stream_video_defaults_to_empty_pass_fds(self):
        stream_infra.FlaskServer.init_video(
            chunk_size=64 * 1024,
            command=["ffmpeg", "pipe:1"],
            media_type="video/mp4",
        )

        fake_proc = mock.Mock()
        fake_proc.stdout.fileno.return_value = 99
        with mock.patch("mkchromecast.stream_infra.Popen",
                        return_value=fake_proc) as popen, \
             mock.patch("mkchromecast.stream_infra.os.read", return_value=b""), \
             mock.patch("mkchromecast.stream_infra.flask.Response",
                        autospec=True):
            stream_infra.FlaskServer._stream_video()

        _, kwargs = popen.call_args
        self.assertEqual((), kwargs.get("pass_fds"))


if __name__ == "__main__":
    unittest.main()
