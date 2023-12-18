# this file is part of mkchromecast.

import unittest
from unittest import mock

from mkchromecast import utils

class ClampBitrateTests(unittest.TestCase):
    def setUp(self):
        self.mock_print = self.enterContext(mock.patch("builtins.print", autospec=True))

    def testMissingBitrate(self):
        utils.clamp_bitrate("codec", None)

        self.mock_print.assert_called_once()
        print_str = self.mock_print.call_args.args[0]
        self.assertNotIn("invalid", print_str)
        self.assertIn("default", print_str)

    def testInvalidBitrate(self):
        for bitrate in -192, -1, 0:
            with self.subTest(bitrate=bitrate):
                self.mock_print.reset_mock()
                utils.clamp_bitrate("codec", bitrate)

                self.mock_print.assert_called_once()
                print_str = self.mock_print.call_args.args[0]
                self.assertIn("invalid", print_str)
                self.assertIn("192", print_str)

    def testNoClamp(self):
        # Codecs other than mp3, ogg, or aac shouldn't have an upper bound.
        cases = {"mp3": 320, "ogg": 500, "aac": 500, "opus": 1048576}
        for codec, bitrate in cases.items():
            with self.subTest(codec=codec):
                self.mock_print.reset_mock()
                self.assertEqual(bitrate, utils.clamp_bitrate(codec, bitrate))
                self.mock_print.assert_not_called()

    def testClamp(self):
        cases = {"mp3": 321, "ogg": 501, "aac": 501}
        for codec, bitrate in cases.items():
            with self.subTest(codec=codec):
                self.mock_print.reset_mock()
                self.assertEqual(bitrate - 1,
                                 utils.clamp_bitrate(codec, bitrate))

                self.mock_print.assert_called_once()
                print_str = self.mock_print.call_args.args[0]
                self.assertIn(codec, print_str)
                self.assertIn(str(bitrate), print_str)
                self.assertIn(str(bitrate - 1), print_str)


if __name__ == "__main__":
    unittest.main(verbosity=2)
