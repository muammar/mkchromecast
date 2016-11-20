#!/usr/bin/env python

# This file is part of mkchromecast.

from mkchromecast.audiodevices import *
import mkchromecast.colors as colors
from mkchromecast.terminate import *
from mkchromecast.version import __version__
import argparse
import os.path
import sys
import platform
import pickle
import subprocess
from argparse import RawTextHelpFormatter

parser = argparse.ArgumentParser(
description='''
This is a program to cast your macOS audio, or Linux audio to your Google Cast
devices.

It is written in Python, and it can stream via node.js, ffmpeg, parec (Linux
pulseaudio users), avconv (Linux only) or ALSA (Linux users). mkchromecast is
capable of using lossy and lossless audio formats provided that ffmpeg, avconv
or parec is installed.  Additionally, a system tray menu is available.

Linux users that have installed the debian package need to launch the command
`mkchromecast`, e.g.:

    mkchromecast

whereas, installation from source needs users to go inside the cloned git
repository and execute:

    python mkchromecast.py

The two examples above will make mkchromecast streams with node.js (or parec in
Linux) together with mp3 audio coding format at a sample rate of 44100Hz and an
average bitrate of 192k (defaults). These defaults can be changed using the
--sample-rate and -b flags. It is useful to modify these parameters when your
wireless router is not very powerful, or in the case you don't want to degrade
the sound quality. For more information visit the wiki and the FAQ
https://github.com/muammar/mkchromecast/wiki/.


''',
formatter_class=RawTextHelpFormatter
)

parser.add_argument(
'--alsa-device',
type=str,
default=None,
help=
'''
Set the ALSA device name. This option is useful when you are using pure
ALSA in your system.

Example:
    python mkchromecast.py --encoder-backend ffmpeg --alsa-device hw:2,1

It only works for the ffmpeg and avconv backends, and it is not useful for
pulseaudio users. For more information read the README.Debian file shipped in
the Debian package or https://github.com/muammar/mkchromecast/wiki/ALSA.
'''
)

parser.add_argument(
'-b',
'--bitrate',
type=int,
default='192',
help=
'''
Set the audio encoder's bitrate. The default is set to be 192k average bitrate.

Example:

ffmpeg:
    python mkchromecast.py --encoder-backend ffmpeg -c ogg -b 128

node:
    python mkchromecast.py  -b 128

This option works with all backends. The example above sets the average
bitrate to 128k.
'''
)

parser.add_argument(
'--chunk-size',
type=int,
default='1024',
help=
'''
Set the chunk size for streaming in the Flask server. Default to 1024. This
option only works when using the ffmpeg or avconv backends.

Example:

ffmpeg:
    python mkchromecast.py --encoder-backend ffmpeg -c ogg -b 128 --chunk-size 2048

avconv:
    python mkchromecast.py --encoder-backend avconv -c ogg -b 128 --chunk-size 512
'''
)

parser.add_argument(
'-c',
'--codec',
type=str,
default='mp3',
help=
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

This option only works for the ffmpeg, avconv and parec backends.
'''
)

parser.add_argument(
'--config',
action='store_true',
help='''
Use this option to connect from configuration file.
'''
)

parser.add_argument(
'--debug',
action='store_true',
help='''
Option for debugging purposes.
'''
)

parser.add_argument(
'-d',
'--discover',
action='store_true',
default=False,
help='''
Use this option if you want to know the friendly name of a Google Cast device.
'''
)

parser.add_argument(
'--encoder-backend',
type=str,
default=None,
help=
'''
Set the backend for all encoders.
Possible backends:
    - node (default in macOS)
    - parec (default in Linux)
    - ffmpeg
    - avconv
    - gstreamer

Example:
    python mkchromecast.py --encoder-backend ffmpeg
'''
)

parser.add_argument(
'--host',
type=str,
default=None,
help=
'''
Set the ip of the local host. This option is useful if the local ip of your
computer is not being detected correctly, or in the case you have more than one
network device available.

Example:
    python mkchromecast.py --encoder-backend ffmpeg --host 192.168.1.1

You can pass it to all available backends.
'''
)

parser.add_argument(
'-n',
'--name',
type=str,
default=None,
help='''
Use this option if you know the name of the Google Cast you want to connect.

Example:
    python mkchromecast.py -n mychromecast
'''
)

parser.add_argument(
'--notifications',
action='store_true',
help='''
Use this flag to enable the notifications.
'''
)

parser.add_argument(
'-r',
'--reset',
action='store_true',
help='''
When the application fails, and you have no audio in your computer, use this
option to reset the computer's audio.
'''
)

parser.add_argument(
'--reboot',
action='store_true',
help='''
Reboot the Google Cast device.
'''
)

parser.add_argument(
'--reconnect',
action='store_true',
default=False,
help='''
Monitor if connection with google cast has been lost, and try to reconnect.
'''
)

parser.add_argument(
'-s',
'--select-cc',
action='store_true',
help='''
If you have more than one Google Cast device use this option.
'''
)

parser.add_argument(
'--sample-rate',
type=int,
default='44100',
help='''
Set the sample rate. The default sample rate obtained from avfoundation audio
device input in ffmpeg using soundflower for macOS is 44100Hz (in Linux can be
44100Hz or 48000Hz). You can change this in the Audio MIDI Setup in the
"Soundflower (2ch)" audio device. You need to change the "Format" in both
input/output from 44100Hz to maximum 96000Hz.  I think that more than 48000Hz
is not necessary, but this is up to the users' preferences.

Note that re-sampling to higher sample rates is not a good idea. It was indeed
an issue in the chromecast audio. See: https://goo.gl/yNVODZ.

Example:

ffmpeg:
    python mkchromecast.py --encoder-backend ffmpeg -c ogg -b 128 --sample-rate 32000

node:
    python mkchromecast.py -b 128 --sample-rate 32000

This option works for both backends. The example above sets the sample rate to
32000Hz, and the bitrate to 128k.

Which sample rate to use?

    - 96000Hz: maximum sampling rate supported in google cast audio. Only
      supported by aac, wav and flac codecs.
    - 48000Hz: sampling rate of audio in DVDs.
    - 44100Hz: sampling rate of audio CDs giving a 20 kHz maximum frequency.
    - 32000Hz: sampling rate of audio quality a little below FM radio bandwidth.
    - 22050Hz: sampling rate of audio quality of AM radio.

For more information see: http://wiki.audacityteam.org/wiki/Sample_Rates.
'''
)

parser.add_argument(
'--segment-time',
type=int,
default=None,
help=
'''
Segmentate audio for improved live streaming when using ffmpeg.

Example:
    python mkchromecast.py --encoder-backend ffmpeg --segment-time 2

'''
)

parser.add_argument(
'--source-url',
type=str,
default=None,
help=
'''
This option allows you to pass any source URL to your Google Cast device. You
have to specify the codec with -c flag when using it.

Example:

Source URL, port and extension:
    python mkchromecast.py --source-url http://192.99.131.205:8000/pvfm1.ogg -c ogg --volume

Source URL, no port, and extension:
    python mkchromecast.py --source-url http://example.com/name.ogg -c ogg --volume

Source URL without extension:
    python mkchromecast.py --source-url http://example.com/name -c aac --volume

Supported source URLs are:

    - http://url:port/name.mp3
    - http://url:port/name.ogg
    - http://url:port/name.mp4 (use the aac codec)
    - http://url:port/name.wav
    - http://url:port/name.flac

.m3u or .pls are not yet available.
'''
)

parser.add_argument(
'-t',
'--tray',
action='store_true',
help='''
This option let you launch mkchromecast as a systray menu (beta).
'''
)

parser.add_argument(
'--update',
action='store_true',
help="""
Update mkchromecast git repository.

Example:
    python mkchromecast.py --update

This will execute for you:

    git pull --all
    git fetch -p
"""
)

parser.add_argument(
'-v',
'--version',
action='store_true',
help='''
Show the version'''
)

parser.add_argument(
'--volume',
action='store_true',
default=False,
help='''
Control the volume of your Google Cast Devices. Use the 'u' and 'd' keys to
perform volume up and volume down actions respectively. Note that to kill the
application using this option, you need to press the 'q' key or 'Ctrl-c'.
'''
)

parser.add_argument(
'-y',
'--youtube',
type=str,
default=None,
help='''
Stream from Youtube URL. This option needs youtube-dl.

Example:
    python mkchromecast.py -y https://www.youtube.com/watch?v=NVvAJhZVBTc

As I don't own a Google Cast for TVs, I cannot test this correctly. But in
principle it should work.
'''
)

args = parser.parse_args()

"""
Guess the platform
"""
platform = platform.system()

"""
Assignment of args to variables
"""
tray = args.tray
if tray == True:
    select_cc = True
else:
    select_cc = args.select_cc
debug = args.debug

if args.notifications == True:
    notifications = 'enabled'
else:
    notifications = 'disabled'

adevice = args.alsa_device
if debug == True:
    print('ALSA device name:', adevice)

discover = args.discover
host = args.host
sourceurl = args.source_url
reconnect = args.reconnect

ccname = args.name
if debug == True:
    print('Google Cast name:', ccname)

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

"""
Reboot
"""
if args.reboot == True:
    print(colors.error('This option is not implemented yet.'))
    sys.exit(0)

"""
Not yet implemented
"""
if args.config == True:
    print(colors.error('This option is not implemented yet.'))
    sys.exit(0)

"""
Version
"""
if args.version is True:
    print('mkchromecast '+'v'+colors.success(__version__))
    sys.exit(0)

"""
Update
"""
if args.update is True:
    print(colors.warning('Updating mkchromecast'))
    print(colors.important('git pull --all'))
    pull = subprocess.Popen(
        ['git', 'pull', '--all'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
        )

    print(pull.stdout.read().decode('utf-8').strip())
    print(colors.important('git fetch -p'))
    prune = subprocess.Popen(
        ['git', 'fetch', '-p'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
        )
    print(prune.stdout.read().decode('utf-8').strip())
    sys.exit(0)

"""
Check that encoders exist in the list
"""
backends = [
    'node',
    'ffmpeg',
    'avconv'
    ]
if platform == 'Darwin':
    backends.remove('avconv')
else:
    backends.remove('node')
    backends.append('parec')
    backends.append('gstreamer')

if args.debug == True:
    print('backends: ', backends)

if args.encoder_backend not in backends and args.encoder_backend != None:
    print(colors.error('Supported backends are: '))
    for backend in backends:
        print('-',backend)
    sys.exit(0)

if args.encoder_backend in backends:
    backend = args.encoder_backend
elif args.encoder_backend  == None:     #This is to define defaults
    if platform == 'Linux':
        args.encoder_backend = 'parec'
        backend = args.encoder_backend
    elif platform == 'Darwin':
        args.encoder_backend = 'node'
        backend = args.encoder_backend

"""
Codecs
"""
codecs = [
    'mp3',
    'ogg',
    'aac',
    'wav',
    'flac'
    ]

if backend == 'node' and args.codec != 'mp3' and sourceurl == None:
    rcodec = args.codec
    codec = 'mp3'
elif backend == 'node' and args.codec == 'mp3' and sourceurl == None:
    rcodec = args.codec
    codec = 'mp3'
elif sourceurl != None:
    codec = args.codec
else:
    rcodec = None
    if backend != 'node' and args.codec in codecs:
        codec = args.codec
    else:
        print(colors.options('Selected audio codec: ')+ args.codec)
        print(colors.error('Supported audio codecs are: '))
        for codec in codecs:
            print('-',codec)
        sys.exit(0)

"""
Bitrate
"""
codecs_br = [
    'mp3',
    'ogg',
    'aac'
    ]

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
Chunk size
"""
if args.chunk_size <= 0:
    print(colors.warning('Chunk size set to default: 1024.'))
    chunk_size = 1024
elif args.chunk_size < 512:
    print(colors.warning('Chunk size not recommended. Using 512 instead.'))
    chunk_size = 512
else:
    chunk_size = abs(args.chunk_size)

"""
Sample rate
"""
if args.sample_rate != 0:
    if args.sample_rate < 22050:
        print(colors.error('The sample rate has to be greater than 22049.'))
        sys.exit(0)
    else:
        samplerate = abs(args.sample_rate)
elif args.sample_rate == 0:
    samplerate = 44100

"""
Segment time
"""
avoid = ['parec', 'node']
if isinstance(args.segment_time, int) and backend not in avoid:
    segmenttime = args.segment_time
elif isinstance(args.segment_time, float) or backend in avoid:
    segmenttime = None
else:
    print(colors.warning('The segment time has to be an integer number'))
    print(colors.warning('Set to default of 2 seconds'))
    segmenttime = 2

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
        print(colors.error('You need to provide a youtube URL'))
        sys.exit(0)
    else:
        youtubeurl = args.youtube
        backend = 'ffmpeg'

"""
This is to write a PID file
"""
def writePidFile():
    if os.path.exists('/tmp/mkchromecast.pid') == True:     #This is to verify that pickle tmp file exists
       os.remove('/tmp/mkchromecast.pid')
    pid = str(os.getpid())
    f = open('/tmp/mkchromecast.pid', 'wb')
    pickle.dump(pid, f)
    f.close()
    return

def checkmktmp():
    if os.path.exists('/tmp/mkchromecast.tmp') == True:     #This is to verify that pickle tmp file exists
       os.remove('/tmp/mkchromecast.tmp')
    return
