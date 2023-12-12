# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import configparser as ConfigParser
from flask import Flask, Response
from functools import partial
import multiprocessing
import os
import pickle
import psutil
from subprocess import Popen, PIPE
import sys
import threading
import time
from typing import Optional

import mkchromecast
from mkchromecast import colors
from mkchromecast import constants
from mkchromecast import utils
from mkchromecast.audio_devices import inputint, outputint
from mkchromecast.config import config_manager
import mkchromecast.messages as msg
from mkchromecast.preferences import ConfigSectionMap

backends_dict = {}


# TODO(xsdg): Encapsulate this so that we don't do this work on import.
_mkcc = mkchromecast.Mkchromecast()

# We make local copies of these attributes because they are sometimes modified.
# TODO(xsdg): clean this up more when we refactor this file.
tray = _mkcc.tray
adevice = _mkcc.adevice
chunk_size = _mkcc.chunk_size
segment_time = _mkcc.segment_time
host = _mkcc.host
port = _mkcc.port
platform = _mkcc.platform

ip = utils.get_effective_ip(platform, host_override=host, fallback_ip="0.0.0.0")

frame_size = 32 * chunk_size
buffer_size = 2 * chunk_size**2

debug = _mkcc.debug

if debug is True:
    print(
        ":::audio::: chunk_size, frame_size, buffer_size: %s, %s, %s"
        % (chunk_size, frame_size, buffer_size)
    )
source_url = _mkcc.source_url
config = ConfigParser.RawConfigParser()
configurations = config_manager()  # Class from mkchromecast.config
configf = configurations.configf
appendtourl = "stream"

# This is to take the youtube URL
if _mkcc.youtube_url is not None:
    print(colors.options("The Youtube URL chosen: ") + _mkcc.youtube_url)

    try:
        import urlparse

        url_data = urlparse.urlparse(_mkcc.youtube_url)
        query = urlparse.parse_qs(url_data.query)
    except ImportError:
        import urllib.parse

        url_data = urllib.parse.urlparse(_mkcc.youtube_url)
        query = urllib.parse.parse_qs(url_data.query)
    video = query["v"][0]
    print(colors.options("Playing video:") + " " + video)
    command = ["youtube-dl", "-o", "-", _mkcc.youtube_url]
    mtype = "audio/mp4"
else:
    # Because these are defined in parallel conditional bodies, we declare
    # the types here to avoid ambiguity for the type analyzers.
    backend: Optional[str]
    bitrate: str
    codec: str
    samplerate: str
    if os.path.exists(configf) and tray is True:
        configurations.chk_config()
        config.read(configf)
        backend = ConfigSectionMap("settings")["backend"]
        backends_dict[backend] = backend
        codec = ConfigSectionMap("settings")["codec"]
        bitrate = ConfigSectionMap("settings")["bitrate"]
        samplerate = ConfigSectionMap("settings")["samplerate"]
        adevice = ConfigSectionMap("settings")["alsadevice"]
        if adevice == "None":
            adevice = None
        if debug is True:
            print(":::audio::: tray = " + str(tray))
            print(colors.warning("Configuration file exists"))
            print(colors.warning("Using defaults set there"))
            print(backend, codec, bitrate, samplerate, adevice)
    else:
        backend = _mkcc.backend
        backends_dict[backend] = backend
        codec = _mkcc.codec
        bitrate = str(_mkcc.bitrate)
        samplerate = str(_mkcc.samplerate)

    if tray and backend in ["ffmpeg", "parec"]:
        import os
        import getpass

        USER = getpass.getuser()
        PATH = (
            "./bin:./nodejs/bin:/Users/"
            + str(USER)
            + "/bin:/usr/local/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/X11/bin:/usr/games:"
            + os.environ["PATH"]
        )

        iterate = PATH.split(":")
        for item in iterate:
            verifyif = str(item + "/" + backend)
            if os.path.exists(verifyif) is False:
                continue
            else:
                backends_dict[verifyif] = backend
                backend = verifyif
                if debug is True:
                    print(
                        ":::audio::: Program "
                        + str(backend)
                        + " found in "
                        + str(verifyif)
                    )
                    print(":::audio::: backend dictionary " + str(backends_dict))

    if codec == "mp3":
        append_mtype = "mpeg"
    else:
        append_mtype = codec

    mtype = "audio/" + append_mtype

    if source_url is None:
        print(colors.options("Selected backend:") + " " + backend)
        print(colors.options("Selected audio codec:") + " " + codec)

    if backend != "node":
        if bitrate == "192":
            bitrate = bitrate + "k"
        elif bitrate == "None":
            pass
        else:
            # TODO(xsdg): The logic here is unclear or incorrect.  It appears
            # that we add "k" to the bitrate unless the bitrate was above the
            # maximum, in which case we set the bitrate to the max and don't add
            # the trailing "k".
            if codec == "mp3" and int(bitrate) > 320:
                bitrate = "320"
                if not source_url:
                    msg.print_bitrate_warning(codec, bitrate)
            elif codec == "ogg" and int(bitrate) > 500:
                bitrate = "500"
                if not source_url:
                    msg.print_bitrate_warning(codec, bitrate)
            elif codec == "aac" and int(bitrate) > 500:
                bitrate = "500"
                if not source_url:
                    msg.print_bitrate_warning(codec, bitrate)
            else:
                bitrate = bitrate + "k"

        if bitrate != "None" and not source_url:
            print(colors.options("Using bitrate:") + f" {bitrate}")

        if codec in constants.QUANTIZED_SAMPLE_RATE_CODECS:
            samplerate = str(utils.quantize_sample_rate(
                bool(_mkcc.source_url), codec, int(samplerate))
            )

        if source_url is None:
            print(colors.options("Using sample rate:") + f" {samplerate}Hz")

    """
    We verify platform and other options
    """

    # This function add some more flags to the ffmpeg command
    # when user passes --debug option.
    def debug_command():
        command.insert(1, "-loglevel")
        command.insert(2, "panic")
        return

    def modalsa():
        command[command.index("pulse")] = "alsa"
        command[command.index("Mkchromecast.monitor")] = adevice
        print(command)
        return

    def set_segment_time(position):
        string = ["-f", "segment", "-segment_time", str(segment_time)]
        for element in string:
            command.insert(position, element)
        return

    """
    MP3 192k
    """
    if codec == "mp3":
        if (
            platform == "Linux"
            and backends_dict[backend] != "parec"
            and backends_dict[backend] != "gstreamer"
        ):
            command = [
                backend,
                "-ac",
                "2",
                "-ar",
                "44100",
                "-frame_size",
                str(frame_size),
                "-fragment_size",
                str(frame_size),
                "-f",
                "pulse",
                "-i",
                "Mkchromecast.monitor",
                "-f",
                "mp3",
                "-acodec",
                "libmp3lame",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "pipe:",
            ]
            if adevice is not None:
                modalsa()

            if segment_time is not None:
                set_segment_time(-11)

        elif (
            platform == "Linux"
            and backends_dict[backend] == "parec"
            or backends_dict[backend] == "gstreamer"
        ):
            command = ["lame", "-b", bitrate[:-1], "-r", "-"]
            """
        This command dumps to file correctly, but does not work for stdout.
        elif platform == 'Linux' and backends_dict[backend] == 'gstreamer':
            command = [
                'gst-launch-1.0',
                '-v',
                '!',
                'audioconvert',
                '!',
                'audio/x-raw,rate='+samplerate,
                '!',
                'lamemp3enc',
                'target=bitrate',
                'bitrate='+bitrate[:-1],
                'cbr=true',
                '!',
                'mpegaudioparse',
                '!',
                'filesink', 'location=/dev/stdout'
                ]
            if adevice != None:
                command.insert(2, 'alsasrc')
                command.insert(3, 'device="'+adevice+'"')
            else:
                command.insert(2, 'pulsesrc')
                command.insert(3, 'device="Mkchromecast.monitor"')
            """
        else:
            command = [
                backend,
                "-f",
                "avfoundation",
                "-i",
                ":BlackHole 16ch",
                "-f",
                "mp3",
                "-acodec",
                "libmp3lame",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "pipe:",
            ]

            if segment_time is not None:
                set_segment_time(-11)

    """
    OGG 192k
    """
    if codec == "ogg":
        if (
            platform == "Linux"
            and backends_dict[backend] != "parec"
            and backends_dict[backend] != "gstreamer"
        ):
            command = [
                backend,
                "-ac",
                "2",
                "-ar",
                "44100",
                "-frame_size",
                str(frame_size),
                "-fragment_size",
                str(frame_size),
                "-f",
                "pulse",
                "-i",
                "Mkchromecast.monitor",
                "-f",
                "ogg",
                "-acodec",
                "libvorbis",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "pipe:",
            ]
            if adevice is not None:
                modalsa()

            if segment_time is not None:
                set_segment_time(-11)

        elif (
            platform == "Linux"
            and backends_dict[backend] == "parec"
            or backends_dict[backend] == "gstreamer"
        ):
            command = ["oggenc", "-b", bitrate[:-1], "-Q", "-r", "--ignorelength", "-"]
            """
        This command dumps to file correctly, but does not work for stdout.
        elif platform == 'Linux' and backends_dict[backend] == 'gstreamer':
            command = [
                'gst-launch-1.0',
                '!',
                'audioconvert',
                '!',
                'audioresample',
                '!',
                'vorbisenc',
                #'bitrate='+str(int(bitrate[:-1])*1000),
                '!',
                'vorbisparse',
                '!',
                'oggmux',
                '!',
                'filesink', 'location=/dev/stdout'
                #gst-launch-1.0 pulsesrc device="Mkchromecast.monitor"
                ! audioconvert ! audioresample ! vorbisenc ! oggmux ! filesink
                ]
            if adevice != None:
                command.insert(1, 'alsasrc')
                command.insert(2, 'device="'+adevice+'"')
            else:
                command.insert(1, 'pulsesrc')
                command.insert(2, 'device="Mkchromecast.monitor"')
            """
        else:
            command = [
                backend,
                "-f",
                "avfoundation",
                "-i",
                ":BlackHole 16ch",
                "-f",
                "ogg",
                "-acodec",
                "libvorbis",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "pipe:",
            ]

    """
    AAC > 128k for Stereo, Default sample rate: 44100kHz
    """
    if codec == "aac":
        if (
            platform == "Linux"
            and backends_dict[backend] != "parec"
            and backends_dict[backend] != "gstreamer"
        ):
            command = [
                backend,
                "-ac",
                "2",
                "-ar",
                "44100",
                "-frame_size",
                str(frame_size),
                "-fragment_size",
                str(frame_size),
                "-f",
                "pulse",
                "-i",
                "Mkchromecast.monitor",
                "-f",
                "adts",
                "-acodec",
                "aac",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "-cutoff",
                "18000",
                "pipe:",
            ]
            if adevice is not None:
                modalsa()

        elif (
            platform == "Linux"
            and backends_dict[backend] == "parec"
            or backends_dict[backend] == "gstreamer"
        ):
            command = [
                "faac",
                "-b",
                bitrate[:-1],
                "-X",
                "-P",
                "-c",
                "18000",
                "-o",
                "-",
                "-",
            ]
            """
        This command dumps to file correctly, but does not work for stdout.
        elif platform == 'Linux' and backends_dict[backend] == 'gstreamer':
            command = [
                'gst-launch-1.0',
                '-v',
                '!',
                'audioconvert',
                '!',
                'audio/x-raw,rate='+samplerate,
                '!',
                'voaacenc',
                #'bitrate='+bitrate[:-1],
                '!',
                'aacparse',
                '!',
                'filesink', 'location=/dev/stdout'
                ]
            if adevice != None:
                command.insert(2, 'alsasrc')
                command.insert(3, 'device="'+adevice+'"')
            else:
                command.insert(2, 'pulsesrc')
                command.insert(3, 'device="Mkchromecast.monitor"')
            """
        else:
            command = [
                backend,
                "-f",
                "avfoundation",
                "-i",
                ":BlackHole 16ch",
                "-f",
                "adts",
                "-ac",
                "2",
                "-acodec",
                "aac",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "pipe:",
            ]

            if segment_time is not None:
                set_segment_time(-11)
                if platform == "Darwin":
                    cutoff = ["-cutoff", "18000"]
                    for element in cutoff:
                        command.insert(-1, element)

    """
    OPUS
    """
    if codec == "opus":
        if platform == "Linux" and backends_dict[backend] != "parec":
            command = [
                backend,
                "-ac",
                "2",
                "-ar",
                "44100",
                "-frame_size",
                str(frame_size),
                "-fragment_size",
                str(frame_size),
                "-f",
                "pulse",
                "-i",
                "Mkchromecast.monitor",
                "-f",
                "opus",
                "-acodec",
                "libopus",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "pipe:",
            ]
            if adevice is not None:
                modalsa()

            if segment_time is not None:
                set_segment_time(-11)

        elif (
            platform == "Linux"
            and backends_dict[backend] == "parec"
            or backends_dict[backend] == "gstreamer"
        ):
            command = [
                "opusenc",
                "-",
                "--raw",
                "--bitrate",
                bitrate[:-1],
                "--raw-rate",
                samplerate,
                "-",
            ]
        else:
            command = [
                backend,
                "-f",
                "avfoundation",
                "-i",
                ":BlackHole 16ch",
                "-f",
                "opus",
                "-acodec",
                "libopus",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "pipe:",
            ]

            if segment_time is not None:
                set_segment_time(-11)

    """
    WAV 24-Bit
    """
    if codec == "wav":
        if platform == "Linux" and backends_dict[backend] != "parec":
            command = [
                backend,
                "-ac",
                "2",
                "-ar",
                "44100",
                "-frame_size",
                str(frame_size),
                "-fragment_size",
                str(frame_size),
                "-f",
                "pulse",
                "-i",
                "Mkchromecast.monitor",
                "-f",
                "wav",
                "-acodec",
                "pcm_s24le",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "pipe:",
            ]

            if adevice is not None:
                modalsa()

            if segment_time is not None:
                set_segment_time(-9)

        elif (
            platform == "Linux"
            and backends_dict[backend] == "parec"
            or backends_dict[backend] == "gstreamer"
        ):
            command = [
                "sox",
                "-t",
                "raw",
                "-b",
                "16",
                "-e",
                "signed",
                "-c",
                "2",
                "-r",
                samplerate,
                "-",
                "-t",
                "wav",
                "-b",
                "16",
                "-e",
                "signed",
                "-c",
                "2",
                "-r",
                samplerate,
                "-L",
                "-",
            ]
        else:
            command = [
                backend,
                "-f",
                "avfoundation",
                "-i",
                ":BlackHole 16ch",
                "-f",
                "wav",
                "-acodec",
                "pcm_s24le",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "pipe:",
            ]
            if segment_time is not None:
                set_segment_time(-9)

    """
    FLAC 24-Bit (values taken from:
    https://trac.ffmpeg.org/wiki/Encode/HighQualityAudio) except for parec.
    """
    if codec == "flac":
        if platform == "Linux" and backends_dict[backend] != "parec":
            command = [
                backend,
                "-ac",
                "2",
                "-ar",
                "44100",
                "-frame_size",
                str(frame_size),
                "-fragment_size",
                str(frame_size),
                "-f",
                "pulse",
                "-i",
                "Mkchromecast.monitor",
                "-f",
                "flac",
                "-acodec",
                "flac",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "pipe:",
            ]
            if adevice is not None:
                modalsa()

            if segment_time is not None:
                set_segment_time(-11)

        elif (
            platform == "Linux"
            and backends_dict[backend] == "parec"
            or backends_dict[backend] == "gstreamer"
        ):
            command = [
                "flac",
                "-",
                "-c",
                "--channels",
                "2",
                "--bps",
                "16",
                "--sample-rate",
                samplerate,
                "--endian",
                "little",
                "--sign",
                "signed",
                "-s",
            ]
        else:
            command = [
                backend,
                "-f",
                "avfoundation",
                "-i",
                ":BlackHole 16ch",
                "-f",
                "flac",
                "-acodec",
                "flac",
                "-ac",
                "2",
                "-ar",
                samplerate,
                "-b:a",
                bitrate,
                "pipe:",
            ]
            if segment_time is not None:
                set_segment_time(-11)

    if not debug and backends_dict[backend] == "ffmpeg":
        debug_command()

app = Flask(__name__)

if debug is True:
    print(":::audio::: command " + str(command))


@app.route("/")
def index():
    return """<!doctype html>
<title>Play {appendtourl}</title>
<audio controls autoplay >
    <source src="{appendtourl}" type="audio/mp3" >
    Your browser does not support this audio format.
</audio>""".format(
        appendtourl=appendtourl
    )


"""
The code below is supposed to kill the Flask server. I don't know if it would
be useful later.
"""
"""
def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@app.route('/shutdown', methods=['POST'])
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

"""


@app.route("/" + appendtourl)
def stream():
    if (
        platform == "Linux"
        and bool(backends_dict) is True
        and backends_dict[backend] == "parec"
    ):
        c_parec = [backend, "--format=s16le", "-d", "Mkchromecast.monitor"]
        parec = Popen(c_parec, stdout=PIPE)

        try:
            process = Popen(command, stdin=parec.stdout, stdout=PIPE, bufsize=-1)
        except FileNotFoundError:
            print("Failed to execute {}".format(command))
            message = "Have you installed lame, see https://github.com/muammar/mkchromecast#linux-1?"
            raise Exception(message)

    elif (
        platform == "Linux"
        and bool(backends_dict) is True
        and backends_dict[backend] == "gstreamer"
    ):
        c_gst = [
            "gst-launch-1.0",
            "-v",
            "!",
            "audioconvert",
            "!",
            "filesink",
            "location=/dev/stdout",
        ]
        if adevice is not None:
            c_gst.insert(2, "alsasrc")
            c_gst.insert(3, 'device="' + adevice + '"')
        else:
            c_gst.insert(2, "pulsesrc")
            c_gst.insert(3, 'device="Mkchromecast.monitor"')
        gst = Popen(c_gst, stdout=PIPE)
        process = Popen(command, stdin=gst.stdout, stdout=PIPE, bufsize=-1)
    else:
        process = Popen(command, stdout=PIPE, bufsize=-1)
    read_chunk = partial(os.read, process.stdout.fileno(), buffer_size)
    return Response(iter(read_chunk, b""), mimetype=mtype)


def start_app():
    """Starting the streaming server.

    Note that passthrough_errors=False is useful when reconnecting. In that
    way, flask won't die.
    """
    monitor_daemon = monitor()
    monitor_daemon.start()
    app.run(host=ip, port=port, passthrough_errors=False)


class multi_proc(object):  # I launch ffmpeg in a different process
    def __init__(self):
        self.proc = multiprocessing.Process(target=start_app)
        self.proc.daemon = True

    def start(self):
        self.proc.start()


class monitor(object):
    """
    I create a class to launch a thread in this process that monitors if main
    application stops.  A normal running of mkchromecast will have 2 threads in
    the streaming process when ffmpeg is used.
    """

    def __init__(self):
        self.monitor_d = threading.Thread(target=monitor_daemon)
        self.monitor_d.daemon = True

    def start(self):
        self.monitor_d.start()


def monitor_daemon():
    f = open("/tmp/mkchromecast.pid", "rb")
    pidnumber = int(pickle.load(f))
    print(colors.options("PID of main process:") + " " + str(pidnumber))

    localpid = os.getpid()
    print(colors.options("PID of streaming process:") + " " + str(localpid))

    while psutil.pid_exists(localpid) is True:
        try:
            time.sleep(0.5)
            # With this I ensure that if the main app fails, everything
            # will get back to normal
            if psutil.pid_exists(pidnumber) is False:
                if platform == "Darwin":
                    inputint()
                    outputint()
                else:
                    from mkchromecast.pulseaudio import remove_sink

                    remove_sink()
                parent = psutil.Process(localpid)
                for child in parent.children(recursive=True):
                    child.kill()
                parent.kill()
        except KeyboardInterrupt:
            print("Ctrl-c was requested")
            sys.exit(0)
        except IOError:
            print("I/O Error")
            sys.exit(0)
        except OSError:
            print("OSError")
            sys.exit(0)


def main():
    st = multi_proc()
    st.start()
