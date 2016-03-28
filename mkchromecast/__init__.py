#!/usr/bin/env python

# This file is part of mkchromecast.

import argparse
from .audiodevices import *
from .terminate import *

parser = argparse.ArgumentParser(description='Cast mac os x audio to your google cast devices.')
parser.add_argument('-c', '--config', action="store_true", help='Use this option to connect from configuration file')
parser.add_argument('-d', '--discover', action="store_true", help='Use this option if you want to know the friendly name of a google cast device')
parser.add_argument('-n', '--name', action="store_true", help='Use this option if you know the name of the google cast you want to connect')
parser.add_argument('-s', '--select-cc', action="store_true", help='If you have more than one google cast device use this option')
parser.add_argument('-r', '--reset', action="store_true", help='When the application fails, and you have no audio, use this option to reset')
parser.add_argument('-v', '--version', action="store_true", help='Show the version')
args = parser.parse_args()

if args.reset == True:
    inputint()
    outputint()
    terminate()

if args.config == True or args.discover == True or args.name == True or args.version == True:
    print ('This option is not implemented yet.')
    terminate()
