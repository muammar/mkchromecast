# This file is part of Mkchromecast.

import mkchromecast.colors as colors
from mkchromecast import _arg_parsing
from mkchromecast.utils import terminate, check_url
from mkchromecast.version import __version__
from mkchromecast.resolution import resolutions
import sys
import platform
import subprocess
import os
import shlex


args = _arg_parsing.Parser.parse_args()

"""
Guess the platform
"""
platform = platform.system()

"""
Assignment of args to variables
"""
tray = args.tray
if tray is True:
    select_device = True
else:
    select_device = args.select_device
debug = args.debug

if args.notifications is True:
    notifications = "enabled"
else:
    notifications = "disabled"

adevice = args.alsa_device
if debug is True:
    print("ALSA device name: %s." % adevice)

discover = args.discover
host = args.host
input_file = args.input_file
source_url = args.source_url
subtitles = args.subtitles
hijack = args.hijack
device_name = args.name
port = args.port
fps = args.fps


if debug is True:
    print("Google Cast name: %s." % device_name)

"""
Check that input file exists
"""
if input_file != None and os.path.isfile(input_file) is False:
    if platform == "Darwin":
        from mkchromecast.audio_devices import inputint, outputint

        inputint()
        outputint()
    else:
        from mkchromecast.pulseaudio import remove_sink

        remove_sink()

    print(colors.warning("File not found!"))
    terminate()

"""
Media-Type
"""
mtype = args.mtype

if args.mtype is not None and args.video is False:
    print(
        colors.warning("The media type is not supported for audio.")
        % args.encoder_backend
    )

"""
Reset
"""
if args.reset is True:
    if platform == "Darwin":
        from mkchromecast.audio_devices import inputint, outputint

        inputint()
        outputint()
    else:
        from mkchromecast.pulseaudio import remove_sink, get_sink_list

        get_sink_list()
        remove_sink()
    terminate()

"""
Reboot
"""
if args.reboot is True:
    print(colors.error("This option is not implemented yet."))
    sys.exit(0)

"""
Not yet implemented
"""
if args.config is True:
    print(colors.error("This option is not implemented yet."))
    sys.exit(0)

"""
Version
"""
if args.version is True:
    print("mkchromecast " + "v" + colors.success(__version__))
    sys.exit(0)

"""
Update
"""
if args.update is True:
    print(colors.warning("Updating Mkchromecast"))
    print(colors.important("git pull --all"))
    pull = subprocess.Popen(
        ["git", "pull", "--all"], stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )

    print(pull.stdout.read().decode("utf-8").strip())
    print(colors.important("git fetch -p"))
    prune = subprocess.Popen(
        ["git", "fetch", "-p"], stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    print(prune.stdout.read().decode("utf-8").strip())
    sys.exit(0)

"""
Check that encoders exist in the list
"""
screencast = args.screencast
display = args.display
vcodec = args.vcodec

backends = ["node", "ffmpeg", "avconv"]
if platform == "Darwin":
    backends.remove("avconv")
elif platform == "Linux" and args.video is True:
    pass
else:
    backends.remove("node")
    backends.append("parec")
    backends.append("gstreamer")

if args.debug is True:
    print("backends: ", backends)

if args.encoder_backend not in backends and args.encoder_backend is not None:
    print(colors.error("Supported backends are: "))
    for backend in backends:
        print("- %s." % backend)
    sys.exit(0)

if args.encoder_backend in backends:
    backend = args.encoder_backend
elif args.encoder_backend is None:  # This is to define defaults
    if platform == "Linux" and args.video is False:
        args.encoder_backend = "parec"
        backend = args.encoder_backend
    if platform == "Linux" and args.video is True:
        args.encoder_backend = "ffmpeg"
        backend = args.encoder_backend
    elif platform == "Darwin" and args.video is True:
        args.encoder_backend = "ffmpeg"
        backend = args.encoder_backend
    elif platform == "Darwin" and args.video is False:
        args.encoder_backend = "node"
        backend = args.encoder_backend

"""
Codecs
"""
codecs = ["mp3", "ogg", "aac", "opus", "wav", "flac"]

if backend == "node" and args.codec != "mp3" and source_url is None:
    rcodec = args.codec
    codec = "mp3"
elif backend == "node" and args.codec == "mp3" and source_url is None:
    rcodec = args.codec
    codec = "mp3"
elif source_url is not None:
    codec = args.codec
else:
    rcodec = None
    if backend != "node" and args.codec in codecs:
        codec = args.codec
    else:
        print(colors.options("Selected audio codec: %s.") % args.codec)
        print(colors.error("Supported audio codecs are: "))
        for codec in codecs:
            print("- %s." % codec)
        sys.exit(0)

"""
Loop
"""
loop = args.loop

if args.loop is True and args.video is True:
    print(colors.warning("The %s backend is not supported.") % args.encoder_backend)

"""
Command
"""
if args.command is not None and args.video is True:
    safe_commands = ["ffmpeg", "avconv", "youtube-dl"]
    command = shlex.split(args.command)
    if command[0] not in safe_commands:
        print(colors.error("Refusing to execute this."))
        sys.exit(0)
elif args.command is None and args.video is True:
    command = args.command
elif args.command is not None and args.video is False:
    print(colors.warning("The --command option only works for video."))

"""
Resolution
"""

resolutions = [r.lower() for r in resolutions.keys()]

if args.resolution is None:
    resolution = args.resolution
elif args.resolution.lower() in resolutions:
    resolution = args.resolution.lower()
else:
    print(colors.error("Supported resolutions are: "))
    for res in resolutions:
        if res is not False:
            print("- %s." % res)
    sys.exit(0)

"""
Bitrate
"""
codecs_br = ["mp3", "ogg", "aac", "opus", "flac"]

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
    print(colors.warning("Chunk size set to default: %s." % chunk_size))
else:
    chunk_size = abs(args.chunk_size)

"""
Sample rate
"""
if args.sample_rate != 0:
    if args.sample_rate < 22050:
        print(colors.error("The sample rate has to be greater than 22049."))
        sys.exit(0)
    elif args.codec == "opus":
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
avoid = ["parec", "node"]

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
if args.volume is True:  # FIXME this has to be deleted in future releases.
    control = args.volume
    print(
        colors.warning(
            "The --volume flag is going to be renamed to \
          --control."
        )
    )

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
        youtube_url = args.youtube
        backend = "ffmpeg"
else:
    youtube_url = args.youtube
