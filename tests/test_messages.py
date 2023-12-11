# this file is part of mkchromecast.

import unittest
from unittest import mock

import mkchromecast
from mkchromecast import messages

class BasicMessagesTest(unittest.TestCase):
    def setUp(self):
        self.mock_print = self.enterContext(mock.patch("builtins.print", autospec=True))
        self.mock_mkcc = mock.create_autospec(mkchromecast.Mkchromecast)

    def testNormalSampleRate(self):
        self.mock_mkcc.source_url = None
        codec_name = "aac"
        messages.print_samplerate_warning(self.mock_mkcc, codec_name)

        self.mock_print.assert_called_once()
        print_str = self.mock_print.call_args.args[0]
        self.assertIn(codec_name, print_str)
        self.assertIn("22050Hz", print_str)
        self.assertIn("48000Hz", print_str)
        self.assertIn("192000Hz", print_str)

    def testNo96kSampleRate(self):
        self.mock_mkcc.source_url = None
        codec_name = "mp3"
        messages.print_samplerate_warning(self.mock_mkcc, codec_name)

        self.mock_print.assert_called_once()
        print_str = self.mock_print.call_args.args[0]
        self.assertIn(codec_name, print_str)
        self.assertIn("22050Hz", print_str)
        self.assertIn("48000Hz", print_str)
        self.assertNotIn("192000Hz", print_str)


if __name__ == "__main__":
    unittest.main(verbosity=2)
