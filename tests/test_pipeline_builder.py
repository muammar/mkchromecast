# this file is part of mkchromecast.

import unittest
from unittest import mock

from mkchromecast import pipeline_builder
from mkchromecast import stream_infra

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

if __name__ == "__main__":
    unittest.main(verbosity=2)
