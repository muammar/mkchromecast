# this file is part of mkchromecast.

import unittest
from unittest import mock

import mkchromecast
from mkchromecast import _arg_parsing
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


if __name__ == "__main__":
    unittest.main(verbosity=2)
