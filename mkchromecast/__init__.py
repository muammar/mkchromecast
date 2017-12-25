#!/usr/bin/env python

# This file is part of Mkchromecast.

import mkchromecast.colors as colors
from mkchromecast.utils import terminate, check_url
from mkchromecast.version import __version__
from mkchromecast.resolution import resolutions
import argparse
import sys
import platform
import subprocess
from argparse import RawTextHelpFormatter

parser = argparse.ArgumentParser(
    description='''
    This is a program to cast your macOS audio, or Linux audio to your Google
    Cast devices.

    It is written in Python, and it can stream via node.js, ffmpeg, parec
    (Linux pulseaudio users), avconv (Linux only) or ALSA (Linux users).
    Mkchromecast is capable of using lossy and lossless audio formats provided
    that ffmpeg, avconv or parec is installed.  Additionally, a system tray
    menu is available.

    Linux users that have installed the debian package need to launch the
    command `mkchromecast`, e.g.:

        mkchromecast

    whereas, installation from source needs users to go inside the cloned git
    repository and execute:

        python mkchromecast.py

    The two examples above will make Mkchromecast streams with node.js (or
    parec in Linux) together with mp3 audio coding format at a sample rate of
    44100Hz and an average bitrate of 192k (defaults). These defaults can be
    changed using the --sample-rate and -b flags. It is useful to modify these
    parameters when your wireless router is not very powerful, or in the case
    you don't want to degrade the sound quality. For more information visit the
    wiki and the FAQ https://github.com/muammar/mkchromecast/wiki/.


    ''',
    formatter_class=RawTextHelpFormatter
    )

parser.add_argument(
    '--alsa-device',
    type=str,
    default=None,
    help='''
    Set the ALSA device name. This option is useful when you are using pure
    ALSA in your system.

    Example:
        python mkchromecast.py --encoder-backend ffmpeg --alsa-device hw:2,1

    It only works for the ffmpeg and avconv backends, and it is not useful for
    pulseaudio users. For more information read the README.Debian file shipped
    in the Debian package or https://github.com/muammar/mkchromecast/wiki/ALSA.
    '''
    )

parser.add_argument(
    '-b',
    '--bitrate',
    type=int,
    default='192',
    help='''
    Set the audio encoder's bitrate. The default is set to be 192k average
    bitrate.

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
    default='64',
    help='''
    Set the chunk size base for streaming in the Flask server. Default to 64.
    This option only works when using the ffmpeg or avconv backends. This
    number is the base to set both the buffer_size (defined by
    2 * chunk_size**2) in Flask server and the frame_size (defined by 32
      * chunk_size).

    Example:

    ffmpeg:
        python mkchromecast.py --encoder-backend ffmpeg -c ogg -b 128 --chunk-size 2048

    avconv:
        python mkchromecast.py --encoder-backend avconv -c ogg -b 128 --chunk-size 64

    '''
    )

parser.add_argument(
    '-c',
    '--codec',
    type=str,
    default='mp3',
    help='''
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
    '--command',
    type=str,
    default=None,
    help='''
    Set a ffmpeg or avconv command for streaming video.

    Example:
        python3 mkchromecast.py --video --command 'ffmpeg -re -i \
        /path/to/myvideo.mp4 -map_chapters -1 -vcodec libx264 -preset ultrafast \
        -tune zerolatency -maxrate 10000k -bufsize 20000k -pix_fmt yuv420p -g \
        60 -f mp4 -max_muxing_queue_size 9999 -movflags \
        frag_keyframe+empty_moov pipe:1'

    Note that for the output you have to use pipe:1 to stream. This option only
    works for the ffmpeg, avconv backends.
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
    '--control',
    action='store_true',
    default=False,
    help='''
    Control some actions of your Google Cast Devices. Use the 'u' and 'd' keys
    to perform volume up and volume down respectively, or press 'p' and 'r' to
    pause and resume cast process (only works with ffmpeg). Note that to kill
    the application using this option, you need to press the 'q' key or
    'Ctrl-c'.
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
    Use this option if you want to know the friendly name of a Google Cast
    device.
    '''
    )

parser.add_argument(
    '--encoder-backend',
    type=str,
    default=None,
    help='''
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
    '--hijack',
    action='store_true',
    default=False,
    help='''
    This flag monitors if connection with google cast has been lost, and try to
    hijack it.
    '''
    )

parser.add_argument(
    '--host',
    type=str,
    default=None,
    help='''
    Set the ip of the local host. This option is useful if the local ip of your
    computer is not being detected correctly, or in the case you have more than
    one network device available.

    Example:
        python mkchromecast.py --encoder-backend ffmpeg --host 192.168.1.1

    You can pass it to all available backends.
    '''
    )

parser.add_argument(
    '-i',
    '--input-file',
    type=str,
    default=None,
    help='''
    Stream a file.

    Example:
        python mkchromecast.py -i /path/to/file.mp4
    '''
    )

parser.add_argument(
    '--loop',
    action='store_true',
    default=False,
    help='''
    Loop video indefinitely while streaming
    '''
    )

parser.add_argument(
    '-n',
    '--name',
    type=str,
    default=None,
    help='''
    Use this option if you know the name of the Google Cast you want to
    connect.

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
    '-p',
    '--port',
    type=int,
    default='5000',
    help='''
    Set the listening port for local webserver.

    Example:

    ffmpeg:
        python mkchromecast.py --encoder-backend ffmpeg -p 5100

    '''
    )


parser.add_argument(
    '-r',
    '--reset',
    action='store_true',
    help='''
    When the application fails, and you have no audio in your computer, use
    this option to reset the computer's audio.
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
    '--resolution',
    type=str,
    default=None,
    help='''
    Set the resolution of the streamed video. The following resolutions are
    supported:

    ''' +
    "\n".join("    - {0} ({2}).".format(k, *v) for k, v in resolutions.items())
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
    Set the sample rate. The default sample rate obtained from avfoundation
    audio device input in ffmpeg using soundflower for macOS is 44100Hz (in
    Linux can be 44100Hz or 48000Hz). You can change this in the Audio MIDI
    Setup in the "Soundflower (2ch)" audio device. You need to change the
    "Format" in both input/output from 44100Hz to maximum 96000Hz.  I think
    that more than 48000Hz is not necessary, but this is up to the users'
    preferences.

    Note that re-sampling to higher sample rates is not a good idea. It was
    indeed an issue in the chromecast audio. See: https://goo.gl/yNVODZ.

    Example:

    ffmpeg:
        python mkchromecast.py --encoder-backend ffmpeg -c ogg -b 128 --sample-rate 32000

    node:
        python mkchromecast.py -b 128 --sample-rate 32000

    This option works for both backends. The example above sets the sample rate
    to 32000Hz, and the bitrate to 128k.

    Which sample rate to use?

        - 192000Hz: maximum sampling rate supported in google cast audio
          without using High Dynamic Range. Only supported by aac, wav and flac
          codecs.
        - 96000Hz: maximum sampling rate supported in google cast audio using
          High Dynamic Range. Only supported by aac, wav and flac codecs.
        - 48000Hz: sampling rate of audio in DVDs.
        - 44100Hz: sampling rate of audio CDs giving a 20 kHz maximum
          frequency.
        - 32000Hz: sampling rate of audio quality a little below FM radio
          bandwidth.
        - 22050Hz: sampling rate of audio quality of AM radio.

    For more information see: http://wiki.audacityteam.org/wiki/Sample_Rates.
    '''
    )

parser.add_argument(
    '--screencast',
    action='store_true',
    default=False,
    help='''
    Use this flag to cast your Desktop Google cast devices. It is only working
    with ffmpeg. You may want to you use the --resolution option together with
    this flag.

    Examples:

        python mkchromecast.py --video --screencast
    '''
    )

parser.add_argument(
    '--seek',
    type=str,
    default=None,
    help='''
    Option to seeking when casting video. The format to set the time is
    HH:MM:SS.

    Example:
        python mkchromecast.py --video -i "/path/to/file.mp4" --seek 00:23:00

    '''
    )

parser.add_argument(
    '--segment-time',
    type=int,
    default=None,
    help='''
    Segmentate audio for improved live streaming when using ffmpeg.

    Example:
        python mkchromecast.py --encoder-backend ffmpeg --segment-time 2

    '''
    )

parser.add_argument(
    '--source-url',
    type=str,
    default=None,
    help='''
    This option allows you to pass any source URL to your Google Cast device.
    You have to specify the codec with -c flag when using it.

    Example:

    Source URL, port and extension:
        python mkchromecast.py --source-url http://192.99.131.205:8000/pvfm1.ogg -c ogg --control

    Source URL, no port, and extension:
        python mkchromecast.py --source-url http://example.com/name.ogg -c ogg --control

    Source URL without extension:
        python mkchromecast.py --source-url http://example.com/name -c aac --control

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
    '--subtitles',
    type=str,
    default=None,
    help='''
    Set subtitles.
    '''
    )

parser.add_argument(
    '-t',
    '--tray',
    action='store_true',
    help='''
    This option let you launch Mkchromecast as a systray menu (beta).
    '''
    )

parser.add_argument(
    '--tries',
    type=int,
    default=None,
    help='''
    Limit the number of times the underlying socket associated with your
    Chromecast objects will retry connecting
    '''
    )

parser.add_argument(
    '--update',
    action='store_true',
    help="""
    Update Mkchromecast git repository.

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
    '--video',
    action='store_true',
    default=False,
    help='''
    Use this flag to cast video to your Google cast devices. It is only working
    with ffmpeg.

    Examples:

    Cast a file:
        python mkchromecast.py --video -i "/path/to/file.mp4"

    Cast from source-url:
        python mkchromecast.py --source-url http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 -c mp4 --control --video

    Cast a youtube-url:
        python mkchromecast.py -y https://www.youtube.com/watch\?v\=VuMBaAZn3II --video

    '''
    )
parser.add_argument(
    '--volume',
    action='store_true',
    default=False,
    help='''
    This option has been changed to --control. It will be deleted in following
    releases.
    '''
    )

parser.add_argument(
    '-y',
    '--youtube',
    type=str,
    default=None,
    help='''
    Stream from sources supported by youtube-dl. This option needs
    the youtube-dl package, and it also gives you access to all its
    supported websites such as Dailymotion, LiveLeak, and Vimeo.

    For a comprehensive list, check:
        http://rg3.github.io/youtube-dl/supportedsites.html.

    Example:
        python mkchromecast.py -y https://www.youtube.com/watch?v=NVvAJhZVBTc

    Note that this is only working for websites running over https.
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
if tray is True:
    select_cc = True
else:
    select_cc = args.select_cc
debug = args.debug

if args.notifications is True:
    notifications = 'enabled'
else:
    notifications = 'disabled'

adevice = args.alsa_device
if debug is True:
    print('ALSA device name: %s.' % adevice)

discover = args.discover
host = args.host
input_file = args.input_file
sourceurl = args.source_url
subtitles = args.subtitles
hijack = args.hijack
ccname = args.name
port = args.port


if debug is True:
    print('Google Cast name: %s.' % ccname)

"""
Reset
"""
if args.reset is True:
    if platform == 'Darwin':
        from mkchromecast.audio_devices import inputint, outputint
        inputint()
        outputint()
    else:
        from mkchromecast.pulseaudio import remove_sink
        remove_sink()
    terminate()

"""
Reboot
"""
if args.reboot is True:
    print(colors.error('This option is not implemented yet.'))
    sys.exit(0)

"""
Not yet implemented
"""
if args.config is True:
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
    print(colors.warning('Updating Mkchromecast'))
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
screencast = args.screencast

backends = [
    'node',
    'ffmpeg',
    'avconv'
    ]
if platform == 'Darwin':
    backends.remove('avconv')
elif platform == 'Linux' and args.video is True:
    pass
else:
    backends.remove('node')
    backends.append('parec')
    backends.append('gstreamer')

if args.debug is True:
    print('backends: ', backends)

if args.encoder_backend not in backends and args.encoder_backend is not None:
    print(colors.error('Supported backends are: '))
    for backend in backends:
        print('- %s.' % backend)
    sys.exit(0)

if args.encoder_backend in backends:
    backend = args.encoder_backend
elif args.encoder_backend is None:     # This is to define defaults
    if platform == 'Linux' and args.video is False:
        args.encoder_backend = 'parec'
        backend = args.encoder_backend
    if platform == 'Linux' and args.video is True:
        args.encoder_backend = 'ffmpeg'
        backend = args.encoder_backend
    elif platform == 'Darwin' and args.video is True:
        args.encoder_backend = 'ffmpeg'
        backend = args.encoder_backend
    elif platform == 'Darwin' and args.video is False:
        args.encoder_backend = 'node'
        backend = args.encoder_backend

"""
Codecs
"""
codecs = [
    'mp3',
    'ogg',
    'aac',
    'opus',
    'wav',
    'flac'
    ]

if backend == 'node' and args.codec != 'mp3' and sourceurl is None:
    rcodec = args.codec
    codec = 'mp3'
elif backend == 'node' and args.codec == 'mp3' and sourceurl is None:
    rcodec = args.codec
    codec = 'mp3'
elif sourceurl is not None:
    codec = args.codec
else:
    rcodec = None
    if backend != 'node' and args.codec in codecs:
        codec = args.codec
    else:
        print(colors.options('Selected audio codec: %s.') % args.codec)
        print(colors.error('Supported audio codecs are: '))
        for codec in codecs:
            print('- %s.' % codec)
        sys.exit(0)

"""
Loop
"""
loop = args.loop

if args.loop is True and args.video is True:
    print(colors.warning('The %s backend is not supported.')
          % args.encoder_backend)

"""
Command
"""
if args.command is not None and args.video is True:
    safe_commands = ['ffmpeg', 'avconv']
    command = args.command.split(' ')
    if command[0] not in safe_commands:
        print(colors.error('Refusing to execute this.'))
        sys.exit(0)
elif args.command is None and args.video is True:
    command = args.command
elif args.command is not None and args.video is False:
    print(colors.warning('The --command option only works for video.'))

"""
Resolution
"""

resolutions = [r.lower() for r in resolutions.keys()]

if args.resolution is None:
    resolution = args.resolution
elif args.resolution.lower() in resolutions:
    resolution = args.resolution.lower()
else:
    print(colors.error('Supported resolutions are: '))
    for res in resolutions:
        if res is not False:
            print('- %s.' % res)
    sys.exit(0)

"""
Bitrate
"""
codecs_br = [
    'mp3',
    'ogg',
    'aac',
    'opus',
    'flac'
    ]

if codec in codecs_br:
    if args.bitrate != 0:
        bitrate = abs(args.bitrate)
    elif args.bitrate == 0:
        bitrate = 192
    else:
        bitrate = args.bit_rate
else:
    # When the codec does not require bitrate I set it to None
    bitrate = None

"""
Chunk size
"""
if args.chunk_size <= 0:
    chunk_size = 64
    print(colors.warning('Chunk size set to default: %s.' % chunk_size))
else:
    chunk_size = abs(args.chunk_size)

"""
Sample rate
"""
if args.sample_rate != 0:
    if args.sample_rate < 22050:
        print(colors.error('The sample rate has to be greater than 22049.'))
        sys.exit(0)
    elif args.codec == 'opus':
        samplerate = 48000
    else:
        samplerate = abs(args.sample_rate)
elif args.sample_rate == 0:
    samplerate = 44100

"""
Seek
"""
seek = args.seek

"""
Segment time
"""
avoid = ['parec', 'node']

if isinstance(args.segment_time, int) and backend not in avoid:
    segment_time = args.segment_time
elif isinstance(args.segment_time, float) or backend in avoid:
    segment_time = None
else:
    segment_time = None

"""
Tries
"""

tries = args.tries

"""
Video
"""
videoarg = args.video

"""
Volume
"""
control = args.control
if args.volume is True:   # FIXME this has to be deleted in future releases.
    control = args.volume
    print(colors.warning('The --volume flag is going to be renamed to \
          --control.'))

"""
Youtube URLs
"""
if args.youtube is not None:
    if check_url(args.youtube) is False:
        youtube_error = """
        You need to provide a URL that is supported by youtube-dl.
        """
        message = """
        For a list of supported sources please visit:
            https://rg3.github.io/youtube-dl/supportedsites.html

        Note that the URLs have to start with https.
        """
        print(colors.error(youtube_error))
        print(message)
        sys.exit(0)
    else:
        youtubeurl = args.youtube
        backend = 'ffmpeg'
else:
    youtubeurl = args.youtube
