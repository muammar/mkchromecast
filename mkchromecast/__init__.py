#!/usr/bin/env python

# This file is part of mkchromecast.

import argparse
from .audiodevices import *
from .terminate import *
import os.path, sys
import pickle
from argparse import RawTextHelpFormatter
from .version import __version__

global backend, codec, bitrate

parser = argparse.ArgumentParser(description='Cast mac os x audio to your google cast devices.', formatter_class=RawTextHelpFormatter)
parser.add_argument('-b', '--bit-rate', type=int, default='192', help=
'''
Set the audio encoder's bitrate. The default is set to be 192k average bitrate.
This option only works when using ffmpeg encoder. For instance, if you desire
128k you need to pass -b 128.
''')
parser.add_argument('-c', '--codec', type=str, default='mp3', help=
'''
Set the audio codec.

Possible codecs:
- mp3  [192k]   MPEG Audio Layer III (default)
- ogg  [192k]   Ogg Vorbis
- aac  [192k]   Advanced Audio Coding (AAC)
- wav  [HQ]     Waveform Audio File Format
- flac [HQ]     Free Lossless Audio Codec
''')
parser.add_argument('--config', action="store_true", help='Use this option to connect from configuration file')
parser.add_argument('-d', '--discover', action="store_true", help='Use this option if you want to know the friendly name of a google cast device')
parser.add_argument('--encoder-backend', type=str, default='node', help=
'''
Set the backend for all encoders.
Possible backends:
- node (default)
- ffmpeg
- avconv (not yet implemented)
''')
parser.add_argument('-n', '--name', action="store_true", help='Use this option if you know the name of the google cast you want to connect')
parser.add_argument('-r', '--reset', action="store_true", help='When the application fails, and you have no audio in your laptop, use this option to reset')
parser.add_argument('-s', '--select-cc', action="store_true", help='If you have more than one google cast device use this option')
parser.add_argument('-t', '--tray', action="store_true", help='This option let you launch mkchromecast as a systray menu (still experimental)')
parser.add_argument('-v', '--version', action="store_true", help='Show the version')
parser.add_argument('-y', '--youtube', action="store_true", help='Stream a youtube URL')
args = parser.parse_args()

if args.reset == True:
    inputint()
    outputint()
    terminate()

if args.config == True or args.discover == True or args.name == True or args.youtube == True:
    print ('This option is not implemented yet.')
    sys.exit(0)

"""
Check that encoders exist in the list
"""
backends = ['node', 'ffmpeg']

if args.encoder_backend in backends:
    backend = args.encoder_backend
else:
    print ('Supported backends are: ')
    for backend in backends:
        print ('-',backend)
    sys.exit(0)

"""
Codecs
"""
codecs = ['mp3', 'ogg', 'aac', 'wav', 'flac']

if args.codec in codecs:
    codec = args.codec
else:
    print ('Selected audio codec: ', args.codec)
    print ('Supported audio codecs are: ')
    for codec in codecs:
        print ('-',codec)
    sys.exit(0)

"""
Bitrate
"""
codecs_br = ['mp3', 'ogg', 'aac']
if args.codec in codecs_br:
    if args.bit_rate != 0:
        bitrate = abs(args.bit_rate)
    elif args.bit_rate == 0:
        bitrate = 192
    else:
        bitrate = args.bit_rate
else:
    print ('The '+args.codec+' codec does not require the bitrate argument')
    bitrate = None

"""
Version
"""
if args.version is True:
    print ('mkchromecast ', __version__)
    sys.exit(0)

"""
This is to write a PID file
"""
def writePidFile():
    if os.path.exists('/tmp/mkcrhomecast.pid') == True:     #This is to verify that pickle tmp file exists
       os.remove('/tmp/mkcrhomecast.pid')
    pid = str(os.getpid())
    f = open('/tmp/mkcrhomecast.pid', 'wb')
    pickle.dump(pid, f)
    f.close()
    return

def checkmktmp():
    if os.path.exists('/tmp/mkcrhomecast.tmp') == True:     #This is to verify that pickle tmp file exists
       os.remove('/tmp/mkcrhomecast.tmp')
    return
