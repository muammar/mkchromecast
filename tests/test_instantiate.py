# this file is part of mkchromecast.

import unittest
from unittest import mock

import mkchromecast
from mkchromecast import _arg_parsing
from mkchromecast import config
from mkchromecast import constants

class BasicInstantiationTest(unittest.TestCase):
    def testInstantiate(self):
        # TODO(xsdg): Do a better job of mocking the args parser.

        mock_args = mock.Mock()
        # Here we set the minimal required args for __init__ to not sys.exit.
        mock_args.encoder_backend = None
        mock_args.bitrate = constants.DEFAULT_BITRATE
        mock_args.codec = 'mp3'
        mock_args.command = None
        mock_args.resolution = None
        mock_args.chunk_size = 64
        mock_args.sample_rate = 44100
        mock_args.youtube = None
        mock_args.input_file = None
        mkcc = mkchromecast.Mkchromecast(mock_args)

    def testTrayModeInstantiation(self):
        mock_config = mock.create_autospec(config.Config, spec_set=True)
        self.enterContext(mock.patch.object(config, "Config", return_value=mock_config))

        mock_args = mock.Mock()
        # Here we set the minimal required args for __init__ to not sys.exit.
        mock_args.encoder_backend = None
        mock_args.bitrate = constants.DEFAULT_BITRATE
        mock_args.codec = 'mp3'
        mock_args.command = None
        mock_args.resolution = None
        mock_args.chunk_size = 64
        mock_args.sample_rate = 44100
        mock_args.youtube = None
        mock_args.input_file = None

        # Now, we set the args to trigger tray mode.
        mock_args.discover = False
        mock_args.input_file = None
        mock_args.reset = False
        mock_args.screencast = False
        mock_args.source_url = None
        mock_args.tray = True

        # Setting the mock config contents.
        mock_config.backend = "backend"
        mock_config.codec = "codec"
        mock_config.bitrate = 12345
        mock_config.samplerate = 54321
        mock_config.notifications = True
        mock_config.colors = "colors"
        mock_config.search_at_launch = False
        mock_config.alsa_device = "alsa_device"

        mkcc = mkchromecast.Mkchromecast(mock_args)

        # We should find that the mock config values are returned by mkcc, even
        # when they are defined differently in args (for instance, bitrate,
        # codec, and samplerate above)
        self.assertEqual(mkcc.backend, "backend")
        self.assertEqual(mkcc.codec, "codec")
        self.assertEqual(mkcc.bitrate, 12345)
        self.assertEqual(mkcc.samplerate, 54321)
        self.assertEqual(mkcc.notifications, "enabled")
        self.assertEqual(mkcc.colors, "colors")
        self.assertEqual(mkcc.search_at_launch, "disabled")
        self.assertEqual(mkcc.adevice, "alsa_device")


if __name__ == "__main__":
    unittest.main(verbosity=2)
