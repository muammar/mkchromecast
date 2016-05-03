#!/usr/bin/env python

# This file is part of mkchromecast.

import argparse
from .audiodevices import *
from .terminate import *
import os.path, sys, platform
import pickle
from argparse import RawTextHelpFormatter
from .version import __version__

parser = argparse.ArgumentParser(description='Cast Mac OS X and Linux audio to your Google Cast devices.', formatter_class=RawTextHelpFormatter)
parser.add_argument('-b', '--bitrate', type=int, default='192', help=
'''
Set the audio encoder's bitrate. The default is set to be 192k average bitrate.

Example:

ffmpeg:
    python mkchromecast.py --encoder-backend ffmpeg -c ogg -b 128

node:
    python mkchromecast.py  -b 128

This option works with both backends. The example above sets the average
bitrate to 128k.

''')
parser.add_argument('-c', '--codec', type=str, default='mp3', help=
'''
Set the audio codec.

Example:
    python mkchromecast.py --encoder-backend ffmpeg -c ogg

Possible codecs:
    - mp3  [192k]   MPEG Audio Layer III (default)
    - ogg  [192k]   Ogg Vorbis
    - aac  [192k]   Advanced Audio Coding (AAC)
    - wav  [HQ]     Waveform Audio File Format
    - flac [HQ]     Free Lossless Audio Codec

This option only works for the ffmpeg backend.

''')
parser.add_argument('--config', action="store_true", help='Use this option to connect from configuration file')
parser.add_argument('--debug', action="store_true", help='Option for debugging purposes')
parser.add_argument('-d', '--discover', action="store_true", help='Use this option if you want to know the friendly name of a Google Cast device')
parser.add_argument('--encoder-backend', type=str, default='node', help=
'''
Set the backend for all encoders.
Possible backends:
    - node (default)
    - ffmpeg

Example:
    python mkchromecast.py --encoder-backend ffmpeg

''')
parser.add_argument('-n', '--name', action="store_true", help='Use this option if you know the name of the Google Cast you want to connect')
parser.add_argument('-r', '--reset', action="store_true", help='When the application fails, and you have no audio in your laptop, use this option to reset')
parser.add_argument('-s', '--select-cc', action="store_true", help='If you have more than one Google Cast device use this option')
parser.add_argument('--sample-rate', type=int, default='44100', help=
'''
Set the sample rate. The default sample rate obtained from avfoundation audio
device input in ffmpeg using soundflower is 44100Hz. You can change this in the
Audio MIDI Setup in the "Soundflower (2ch)" audio device. You need to change
the "Format" in both input/output from 44100Hz to maximum 96000Hz. I think that
more than 48000Hz is not necessary, but this is up to the users' preferences.

Note that resampling to higher sample rates is not a good idea. It was indeed
an issue in the chromecast audio. See: https://goo.gl/yNVODZ.

Example:

ffmpeg:
    python mkchromecast.py --encoder-backend ffmpeg -c ogg -b 128 --sample-rate 32000

node:
    python mkchromecast.py -b 128 --sample-rate 32000

This option works for both backends. The example above sets the sample rate to
32000Hz, and the bitrate to 128k.

Which sample rate to use?

    - 48000Hz: sampling rate of audio in DVDs.
    - 44100Hz: sampling rate of audio CDs giving a 20 kHz maximum frequency.
    - 32000Hz: sampling rate of audio quality a little below FM radio bandwidth.
    - 22050Hz: sampling rate of audio quality of AM radio.

For more information see: http://wiki.audacityteam.org/wiki/Sample_Rates.

''')
parser.add_argument('-t', '--tray', action="store_true", help=
'''
This option let you launch mkchromecast as a systray menu (still experimental)
''')
parser.add_argument('-v', '--version', action="store_true", help='Show the version')
parser.add_argument('--volume', action="store_true", default=False, help=
'''
This option lets you control the volume of your Google Cast Devices. Use the
'u' and 'd' keys to perform volume up and volume down actions respectively. Note
that to kill the application using this option, you need to press the 'q' key.
''')
parser.add_argument('-y', '--youtube', type=str, default=None, help=
'''
Stream from Youtube URL. This option only works for Google Casts in TV.

Example:
    python mkchromecast.py -y https://www.youtube.com/watch?v=NVvAJhZVBTc

As I don't own a Google Cast for TVs, I cannot test this correctly. But in
principle it should work.

''')
args = parser.parse_args()

"""
Guess the platform
"""
platform = platform.system()

"""
Reset
"""
if args.reset == True:
    if platform == 'Darwin':
        inputint()
        outputint()
    else:
        from mkchromecast.pulseaudio import *
        remove_sink()
    terminate()

if args.config == True or args.discover == True or args.name == True:
    print ('This option is not implemented yet.')
    sys.exit(0)

"""
Version
"""
if args.version is True:
    print ('mkchromecast ', __version__)
    sys.exit(0)

"""
Check that encoders exist in the list
"""
backends = ['node', 'ffmpeg']

if args.encoder_backend in backends:
    backend = args.encoder_backend
    if platform == 'Linux' and backend == 'node':
        args.encoder_backend = 'ffmpeg'
        backend = args.encoder_backend
else:
    print ('Supported backends are: ')
    for backend in backends:
        print ('-',backend)
    sys.exit(0)

"""
Debug
"""
if args.debug == True:
    debug = args.debug
else:
    debug = False

"""
Codecs
"""
codecs = ['mp3', 'ogg', 'aac', 'wav', 'flac']

if backend == 'node' and args.codec != 'mp3':
    rcodec = args.codec
    codec = 'mp3'
elif backend == 'node' and args.codec == 'mp3':
    rcodec = args.codec
    codec = 'mp3'
else:
    rcodec = None
    if backend != 'node' and args.codec in codecs:
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

if codec in codecs_br:
    if args.bitrate != 0:
        bitrate = abs(args.bitrate)
    elif args.bitrate == 0:
        bitrate = 192
    else:
        bitrate = args.bit_rate
else:
    bitrate = None      #When the codec does not require bitrate I set it to None

"""
Sample rate
"""
if args.sample_rate != 0:
    if args.sample_rate < 22050:
        print ('The sample rate has to be greater than 22049.')
        sys.exit(0)
    else:
        samplerate = abs(args.sample_rate)
elif args.sample_rate == 0:
    samplerate = 44100

"""
Volume
"""
if args.volume == True:
    volumearg = args.volume

"""
Youtube URLs
"""
if args.youtube != None:
    if 'https' not in args.youtube:
        print('You need to provide the youtube URL')
        sys.exit(0)
    else:
        youtubeurl = args.youtube

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
