# this file is part of mkchromecast.

import unittest

from mkchromecast import constants

class ConstantsTests(unittest.TestCase):
    def testMax48kSampleRates(self):
        self.assertEqual(constants.MAX_48K_SAMPLE_RATES,
                         constants.sample_rates_for_codec("mp3"))
        self.assertEqual(constants.ALL_SAMPLE_RATES,
                         constants.sample_rates_for_codec("aac"))

    def testLinuxBackends(self):
        """Ensures video argument is used correctly, with the right default."""
        self.assertIn(
            "parec",
            constants.backend_options_for_platform("Linux", video=False)
        )
        self.assertNotIn(
            "parec",
            constants.backend_options_for_platform("Linux", video=True)
        )
        self.assertEqual(
            constants.backend_options_for_platform("Linux"),
            constants.backend_options_for_platform("Linux", video=False)
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
