# this file is part of mkchromecast.

import unittest
from unittest import mock

from mkchromecast import pipeline_builder
from mkchromecast import stream_infra
from mkchromecast import utils

class AudioBuilderTests(unittest.TestCase):

    def create_builder(self,
                       backend_name: str,
                       platform: str,
                       **special_encoder_kwargs):
        encoder_kwargs: dict[str, Any] = {
            "codec": "mp3",
            "adevice": None,
            "bitrate": "160",
            "frame_size": 32 * 128,
            "samplerate": "22050",
            "segment_time": None
        }

        encoder_kwargs |= special_encoder_kwargs
        backend = stream_infra.BackendInfo(backend_name, backend_name)
        settings = pipeline_builder.EncodeSettings(**encoder_kwargs)

        return pipeline_builder.Audio(backend, platform, settings)

    def testDarwinInputCommand(self):
        builder = self.create_builder("ffmpeg", "Darwin")

        input_cmd = builder._input_command()
        self.assertIn("avfoundation", input_cmd)
        self.assertIn(":BlackHole 16ch", input_cmd)
        self.assertNotIn("alsa", input_cmd)
        self.assertNotIn("pulse", input_cmd)
        self.assertNotIn("-frame_size", input_cmd)

    def testLinuxPulseInputCommand(self):
        builder = self.create_builder("ffmpeg", "Linux", adevice=None)

        input_cmd = builder._input_command()
        self.assertIn("pulse", input_cmd)
        self.assertIn("Mkchromecast.monitor", input_cmd)
        self.assertNotIn("avfoundation", input_cmd)
        self.assertNotIn("alsa", input_cmd)
        self.assertIn("-frame_size", input_cmd)

    def testLinuxAlsaInputCommand(self):
        adevice="hw:2,1"
        builder = self.create_builder("ffmpeg", "Linux", adevice=adevice)

        input_cmd = builder._input_command()
        self.assertIn("alsa", input_cmd)
        self.assertIn(adevice, input_cmd)
        self.assertNotIn("avfoundation", input_cmd)
        self.assertNotIn("pulse", input_cmd)
        self.assertIn("-frame_size", input_cmd)

    def testDebugSpecialCase(self):
        self.assertIn(
            "-loglevel",
            self.create_builder("ffmpeg", "Darwin", ffmpeg_debug=True).command)
        self.assertNotIn(
            "-loglevel",
            self.create_builder("ffmpeg", "Darwin", ffmpeg_debug=False).command)

    def testBitrateSpecialCase(self):
        # wav doesn't emit bitrate.
        self.assertIn(
            "-b:a",
            self.create_builder("ffmpeg", "Darwin", codec="mp3").command)
        self.assertNotIn(
            "-b:a",
            self.create_builder("ffmpeg", "Darwin", codec="wav").command)

        # ffmpeg should use "k" suffix.
        self.assertIn(
            "160k",
            self.create_builder("ffmpeg", "Linux", bitrate=160).command)
        self.assertNotIn(
            "160",
            self.create_builder("ffmpeg", "Linux", bitrate=160).command)

        # non-ffmpeg (parec in this case) should omit "k" suffix.
        self.assertIn(
            "160",
            self.create_builder("parec", "Linux", bitrate=160).command)
        self.assertNotIn(
            "160k",
            self.create_builder("parec", "Linux", bitrate=160).command)

    def testSegmentTimeSpecialCase(self):
        self.assertIn(
            "-segment_time",
            self.create_builder("ffmpeg", "Darwin", codec="mp3", segment_time=2).command)
        self.assertIn(
            "-segment_time",
            self.create_builder("ffmpeg", "Darwin", codec="aac", segment_time=2).command)
        self.assertIn(
            "-segment_time",
            self.create_builder("ffmpeg", "Linux", codec="ogg", segment_time=2).command)

        self.assertNotIn(
            "-segment_time",
            self.create_builder("ffmpeg", "Darwin", codec="ogg", segment_time=2).command)
        self.assertNotIn(
            "-segment_time",
            self.create_builder("ffmpeg", "Linux", codec="aac", segment_time=2).command)

    def testCutoffSpecialCase(self):
        # We should emit cutoff IFF codec == "aac" and segment_time is not None.
        self.assertIn(
            "-cutoff",
            self.create_builder("ffmpeg", "Darwin", codec="aac", segment_time=2).command)
        self.assertIn(
            "-cutoff",
            self.create_builder("ffmpeg", "Linux", codec="aac", segment_time=2).command)

        # Not aac -> no cutoff.
        self.assertNotIn(
            "-cutoff",
            self.create_builder("ffmpeg", "Darwin", codec="mp3", segment_time=2).command)
        self.assertNotIn(
            "-cutoff",
            self.create_builder("ffmpeg", "Linux", codec="mp3", segment_time=2).command)

        # Empty segment time -> no cutoff.
        self.assertNotIn(
            "-cutoff",
            self.create_builder("ffmpeg", "Darwin", codec="aac", segment_time=None).command)
        self.assertNotIn(
            "-cutoff",
            self.create_builder("ffmpeg", "Linux", codec="aac", segment_time=None).command)

    def testFullLinux(self):
        exp_command = [
            "ffmpeg",
            "-ac", "2",
            "-ar", "44100",
            "-frame_size", str(32*128),
            "-fragment_size", str(32*128),
            "-f", "pulse",
            "-i", "Mkchromecast.monitor",
            "-f", "mp3",
            "-acodec", "libmp3lame",
            "-ac", "2",
            "-ar", "22050",
            "-b:a", "160k",
            "pipe:",
        ]

        self.assertEqual(
            exp_command,
            self.create_builder("ffmpeg", "Linux").command)

    def testFullDarwin(self):
        exp_command = [
            "ffmpeg",
            "-f", "avfoundation",
            "-i", ":BlackHole 16ch",
            "-f", "segment",
            "-segment_time", "2",
            "-f", "adts",
            "-acodec", "aac",
            "-ac", "2",
            "-ar", "22050",
            "-b:a", "160k",
            "-cutoff", "18000",
            "pipe:",
        ]

        self.assertEqual(
            exp_command,
            self.create_builder("ffmpeg", "Darwin", codec="aac", segment_time=2).command)

    # TODO(xsdg): Use pyparameterized for this.
    def testLinuxOther(self):
        binary_for_codecs: dict[str, str] = {
            "mp3": "lame",
            "ogg": "oggenc",
            "aac": "faac",
            "opus": "opusenc",
            "wav": "sox",
            "flac": "flac",
        }

        for codec, binary in binary_for_codecs.items():
            command = self.create_builder("parec", "Linux", codec=codec).command
            self.assertEqual(
                binary, command[0], f"Unexpected binary for codec {codec}")

        with self.assertRaisesRegex(Exception, "unexpected codec.*noexist"):
            _ = self.create_builder("parec", "Linux", codec="noexist").command


class VideoBuilderTests(unittest.TestCase):

    def create_builder(self,
                       **special_encoder_kwargs):
        encoder_kwargs: dict[str, Any] = {
            "display": ":0",
            "fps": "25",
            "input_file": "/path/to/file.mp4",
            "loop": False,
            "resolution": None,
            "screencast": False,
            "seek": None,
            "subtitles": None,
            "user_command": None,
            "vcodec": "libx264",
            "youtube_url": None,
        }

        encoder_kwargs |= special_encoder_kwargs
        settings = pipeline_builder.VideoSettings(**encoder_kwargs)

        return pipeline_builder.Video(settings)

    def testEmptySubtitleCommands(self):
        empty_sub = ([], [],)
        self.assertEqual(
            empty_sub,
            pipeline_builder.Video._input_file_subtitle(None, is_mkv=False)
        )
        self.assertEqual(
            empty_sub,
            pipeline_builder.Video._input_file_subtitle(None, is_mkv=True)
        )

    def testMkvSubtitleCommands(self):
        sub_file = "subtitles.srt"
        input_args, output_args = pipeline_builder.Video._input_file_subtitle(
            sub_file, is_mkv=True
        )

        self.assertIn("-i", input_args)
        i_index = input_args.index("-i")
        self.assertEqual(sub_file, input_args[i_index + 1])

        self.assertIn("-max_muxing_queue_size", output_args)
        self.assertNotIn("-vf", output_args)

    def testNonMkvSubtitleCommands(self):
        sub_file = "subtitles.srt"
        input_args, output_args = pipeline_builder.Video._input_file_subtitle(
            sub_file, is_mkv=False
        )

        self.assertEqual([], input_args)

        self.assertIn("-vf", output_args)
        o_index = output_args.index("-vf")
        self.assertEqual(f"subtitles={sub_file}", output_args[o_index + 1])

    def testAudioEncodeCommands(self):
        # Shorthand for convenience.
        aencode_fxn = pipeline_builder.Video._input_file_aencode

        self.assertEqual([], aencode_fxn(True, False))
        self.assertEqual([], aencode_fxn(False, False))

        self.assertIn("copy", aencode_fxn(True, True))
        self.assertNotIn("libmp3lame", aencode_fxn(True, True))

        self.assertNotIn("copy", aencode_fxn(False, True))
        self.assertIn("libmp3lame", aencode_fxn(False, True))

    def testVideoEncodeCommands(self):
        self.enterContext(mock.patch.object(utils, "check_file_info", autospec=True))
        utils.check_file_info.side_effect = Exception("Should not be called")

        # Shorthand for convenience.
        vencode_fxn = pipeline_builder.Video._input_file_vencode

        # Whenever resolution is specified, we should see the reencode strategy.
        self.assertIn("libx264", vencode_fxn("input.mp4", res="1080p"))
        self.assertIn("libx264", vencode_fxn("input.mkv", res="1080p"))
        self.assertNotIn("copy", vencode_fxn("input.mkv", res="1080p"))

        # We should always copy for non-mkv without resolution specified.
        self.assertIn("copy", vencode_fxn("input.mp4", res=None))
        self.assertNotIn("libx264", vencode_fxn("input.mp4", res=None))

        # For mkv without resolution, we should only reencode yuv420p10le.
        utils.check_file_info.side_effect = None
        utils.check_file_info.return_value = "yuv420p"
        self.assertIn("copy", vencode_fxn("input.mkv", res=None))
        utils.check_file_info.assert_called_once()

        utils.check_file_info.reset_mock()
        utils.check_file_info.return_value = "yuv420p10le"
        self.assertIn("libx264", vencode_fxn("input.mkv", res=None))
        utils.check_file_info.assert_called_once()

    def testSpotCheckReencodeFullCommand(self):
        exp_command = [
            "ffmpeg",
            "-re",
            "-i", "input_file.mp4",
            "-map_chapters", "-1",
            "-vcodec", "libx264",
            "-preset", "veryfast",
            "-tune", "zerolatency",
            "-maxrate", "10000k",
            "-bufsize", "20000k",
            "-pix_fmt", "yuv420p",
            "-g", "60",
            "-f", "mp4",
            "-movflags", "frag_keyframe+empty_moov",
            "-vf", "scale=1920x1080",
            "pipe:1",
        ]

        builder = self.create_builder(input_file="input_file.mp4",
                                      resolution="1080p")
        self.assertEqual(exp_command, builder.command)

    def testSpotCheckCopyFullCommand(self):
        exp_command = [
            "ffmpeg",
            "-stream_loop", "-1",
            "-ss", "hh:mm:ss",
            "-re",
            "-i", "input_file.mp4",
            "-map_chapters", "-1",
            "-vcodec", "copy",
            "-f", "mp4",
            "-movflags", "frag_keyframe+empty_moov",
            "pipe:1",
        ]

        builder = self.create_builder(input_file="input_file.mp4",
                                      resolution=None,
                                      loop=True,
                                      seek="hh:mm:ss")
        self.assertEqual(exp_command, builder.command)


if __name__ == "__main__":
    unittest.main(verbosity=2)
