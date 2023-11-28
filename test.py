#!/usr/bin/env python3

# This file is part of mkchromecast.

import argparse
import logging
import pathlib
import subprocess
import sys
import time
import unittest

import pychromecast

# This argument parser will steal arguments from unittest.  So we only define
# arguments that are needed for the integration test, and that won't collide
# with arguments that unittest cares about (like --help).
integration_arg_parser = argparse.ArgumentParser(add_help=False, allow_abbrev=False)

integration_arg_parser.add_argument(
    "--test-connect-to",
    type=str,
    help=(
        "Enables integration test mode, and attempts to connect to the "
        "Chromecast with the specified friendly name"
    ),
)

integration_args = ...


class MkchromecastTests(unittest.TestCase):
    def testPytype(self):
        # TODO(xsdg): Do something better than just listing files by hand.
        target_names = ["mkchromecast/", "setup.py", "start_tray.py", "test.py"]

        # Makes target names absolute.
        parent_dir = pathlib.Path(__file__).parent
        targets = [parent_dir / target for target in target_names]

        pytype_result = subprocess.run(
            ["pytype", "-k", "-j", "auto", "--no-cache"] + targets,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            encoding="utf8",
        )

        if pytype_result.returncode:
            self.fail(pytype_result.stdout)
        else:
            # Debug-log for diagnostic purposes.
            logging.debug(pytype_result.stdout)

    # "ZZ" prefix so this runs last.
    def testZZEndToEndIntegration(self):
        args = integration_args  # Shorthand.

        if not args.test_connect_to:
            self.skipTest("Specify --test-connect-to to run integration test")

        # TODO(xsdg): pychromecast API has changed significantly since this was
        # written, so this test is currently broken.
        self.skipTest("Integration test is currently broken :(")

        cast = pychromecast.get_chromecast(friendly_name=args.test_connect_to)
        print("Connected to Chromecast")
        mc = cast.media_controller
        print("Playing BigBuckBunny.mp4 (video)")
        # TODO(xsdg): use https.
        mc.play_media(
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "video/mp4",
        )
        time.sleep(15)
        print("Stopping video and sleeping for 5 secs")
        mc.stop()
        time.sleep(5)
        print("Playing Canon mp3 (audio)")
        # TODO(xsdg): This link is broken; find something else that's more
        # stable.  Also, https.
        mc.play_media("http://www.stephaniequinn.com/Music/Canon.mp3", "audio/mp3")
        time.sleep(15)
        print("Stopping audio and quitting app")
        mc.stop()
        cast.quit_app()


if __name__ == "__main__":
    # Steals known arguments from unittest in order to properly configure the
    # integration test.
    integration_args, skipped_argv = integration_arg_parser.parse_known_args()
    sys.argv[1:] = skipped_argv
    unittest.main(verbosity=2)
