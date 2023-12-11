# this file is part of mkchromecast.

import unittest

from mkchromecast import constants

class ConstantsTests(unittest.TestCase):
    def testMax48kSampleRates(self):
        self.assertEqual(constants.MAX_48K_SAMPLE_RATES,
                         constants.sample_rates_for_codec("mp3"))
        self.assertEqual(constants.ALL_SAMPLE_RATES,
                         constants.sample_rates_for_codec("aac"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
