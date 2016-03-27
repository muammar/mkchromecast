#!/usr/bin/env python

# This file is part of mkchromecast.

import argparse
from .audiodevices import *
from .terminate import *

parser = argparse.ArgumentParser(description='Cast mac os x audio to your google cast devices.')
#parser.add_argument('--dissable-auto-reconnect', action='store_true', help='If set, the application does not tries to reconnect devices in case the stream collapsed')
parser.add_argument('-r', '--reset-audio', action="store_true", help='When the application fails, and you have no audio, use this option to reset.')
args = parser.parse_args()

if args.reset_audio == True:
    inputint()
    outputint()
    terminate()
