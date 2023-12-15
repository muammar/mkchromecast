# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import configparser as ConfigParser
import os
import shutil
from typing import Union

import mkchromecast
from mkchromecast import colors
from mkchromecast import constants
from mkchromecast import pipeline_builder
from mkchromecast import stream_infra
from mkchromecast import utils
from mkchromecast.config import config_manager
import mkchromecast.messages as msg
from mkchromecast.preferences import ConfigSectionMap


backend = stream_infra.BackendInfo()

# TODO(xsdg): Encapsulate this so that we don't do this work on import.
_mkcc = mkchromecast.Mkchromecast()
command: Union[str, list[str]]

# We make local copies of these attributes because they are sometimes modified.
# TODO(xsdg): clean this up more when we refactor this file.
tray = _mkcc.tray
#adevice = _mkcc.adevice
chunk_size = _mkcc.chunk_size
#segment_time = _mkcc.segment_time
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
    encode_settings: pipeline_builder.EncodeSettings
    if os.path.exists(configf) and tray is True:
        configurations.chk_config()
        config.read(configf)
        backend.name = ConfigSectionMap("settings")["backend"]
        backend.path = backend.name
        adevice = ConfigSectionMap("settings")["alsadevice"]
        if adevice == "None":
            adevice = None
        encode_settings = pipeline_builder.EncodeSettings(
            codec=ConfigSectionMap("settings")["codec"],
            adevice=adevice,
            bitrate=ConfigSectionMap("settings")["bitrate"],
            frame_size=frame_size,
            samplerate=ConfigSectionMap("settings")["samplerate"],
            segment_time=_mkcc.segment_time
        )
        if debug is True:
            print(":::audio::: tray = " + str(tray))
            print(colors.warning("Configuration file exists"))
            print(colors.warning("Using defaults set there"))
            print(backend, encode_settings, adevice)
    else:
        backend.name = _mkcc.backend
        backend.path = backend.name
        encode_settings = pipeline_builder.EncodeSettings(
            codec=_mkcc.codec,
            adevice=_mkcc.adevice,
            bitrate=str(_mkcc.bitrate),
            frame_size=frame_size,
            samplerate=str(_mkcc.samplerate),
            segment_time=_mkcc.segment_time
        )

    # TODO(xsdg): Why is this only run in tray mode???
    if tray and backend.name in ["ffmpeg", "parec"]:
        import os
        import getpass

        # TODO(xsdg): We should not be setting up a custom path like this.  We
        # should be respecting the path that the user has set, and requiring
        # them to specify an absolute path if the backend isn't in their PATH.
        username = getpass.getuser()
        backend_search_path = (
            f"./bin:./nodejs/bin:/Users/{username}/bin:/usr/local/bin:"
            "/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:"
            f"/usr/X11/bin:/usr/games:{os.environ['PATH']}"
        )

        backend.path = shutil.which(backend.name, path=backend_search_path)
        if debug:
            print(f"Searched for {backend.name} in PATH {backend_search_path}")
            print(f"Resolved to {repr(backend.path)}")

    if codec == "mp3":
        append_mtype = "mpeg"
    else:
        append_mtype = codec

    mtype = "audio/" + append_mtype

    if source_url is None:
        print(colors.options("Selected backend:") + f" {backend}")
        print(colors.options("Selected audio codec:")
              + f" {encode_settings.codec}")

    if backend.name != "node":
        if encode_settings.bitrate == "192":
            encode_settings.bitrate = bitrate + "k"
        elif encode_settings.bitrate == "None":
            pass
        else:
            # TODO(xsdg): The logic here is unclear or incorrect.  It appears
            # that we add "k" to the bitrate unless the bitrate was above the
            # maximum, in which case we set the bitrate to the max and don't add
            # the trailing "k".
            if encode_settings.codec == "mp3" and int(encode_settings.bitrate) > 320:
                encode_settings.bitrate = "320"
                if not source_url:
                    msg.print_bitrate_warning(codec, bitrate)
            elif encode_settings.codec == "ogg" and int(encode_settings.bitrate) > 500:
                encode_settings.bitrate = "500"
                if not source_url:
                    msg.print_bitrate_warning(codec, bitrate)
            elif encode_settings.codec == "aac" and int(encode_settings.bitrate) > 500:
                encode_settings.bitrate = "500"
                if not source_url:
                    msg.print_bitrate_warning(codec, bitrate)
            else:
                encode_settings.bitrate = encode_settings.bitrate + "k"

        if encode_settings.bitrate != "None" and not source_url:
            print(colors.options("Using bitrate:") + f" {encode_settings.bitrate}")

        if encode_settings.codec in constants.QUANTIZED_SAMPLE_RATE_CODECS:
            encode_settings.samplerate = str(utils.quantize_sample_rate(
                bool(_mkcc.source_url),
                encode_settings.codec,
                int(encode_settings.samplerate))
            )

        if source_url is None:
            print(colors.options("Using sample rate:") + f" {encode_settings.samplerate}Hz")

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
        string = ["-f", "segment", "-segment_time", str(_mkcc.segment_time)]
        for element in string:
            command.insert(position, element)
        return

    pb = pipeline_builder.AudioPipelineBuilder(backend, encode_settings)
    command = pb.build_command()

    """
    MP3 192k
    """
    if codec == "mp3":
        if platform == "Linux" and backend.name in {"parec", "gstreamer"}:
            command = ["lame", "-b", bitrate[:-1], "-r", "-"]
            """
        This command dumps to file correctly, but does not work for stdout.
        elif platform == 'Linux' and backend.name == 'gstreamer':
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

    """
    OGG 192k
    """
    if codec == "ogg":
        if platform == "Linux" and backend.name in {"parec", "gstreamer"}:
            command = ["oggenc", "-b", bitrate[:-1], "-Q", "-r", "--ignorelength", "-"]
            """
        This command dumps to file correctly, but does not work for stdout.
        elif platform == 'Linux' and backend.name == 'gstreamer':
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

    """
    AAC > 128k for Stereo, Default sample rate: 44100kHz
    """
    if codec == "aac":
        if platform == "Linux" and backend.name in {"parec", "gstreamer"}:
            command = [
                "faac",
                "-b", bitrate[:-1],
                "-X",
                "-P",
                "-c", "18000",
                "-o", "-",
                "-",
            ]
            """
        This command dumps to file correctly, but does not work for stdout.
        elif platform == 'Linux' and backend.name == 'gstreamer':
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

    """
    OPUS
    """
    if codec == "opus":
        if platform == "Linux" and backend.name in {"parec", "gstreamer"}:
            command = [
                "opusenc",
                "-",
                "--raw",
                "--bitrate", bitrate[:-1],
                "--raw-rate", samplerate,
                "-",
            ]

    """
    WAV 24-Bit
    """
    if codec == "wav":
        if platform == "Linux" and backend.name in {"parec", "gstreamer"}:
            command = [
                "sox",
                "-t", "raw",
                "-b", "16",
                "-e", "signed",
                "-c", "2",
                "-r", samplerate,
                "-",
                "-t", "wav",
                "-b", "16",
                "-e", "signed",
                "-c", "2",
                "-r", samplerate,
                "-L",
                "-",
            ]

    """
    FLAC 24-Bit (values taken from:
    https://trac.ffmpeg.org/wiki/Encode/HighQualityAudio) except for parec.
    """
    if codec == "flac":
        if platform == "Linux" and backend.name in {"parec", "gstreamer"}:
            command = [
                "flac",
                "-",
                "-c",
                "--channels", "2",
                "--bps", "16",
                "--sample-rate", samplerate,
                "--endian", "little",
                "--sign", "signed",
                "-s",
            ]

    if not debug and backend.name == "ffmpeg":
        debug_command()

if debug is True:
    print(":::audio::: command " + str(command))


def _flask_init():
    stream_infra.FlaskServer.init_audio(
        adevice=adevice,
        backend=backend,
        bitrate=bitrate,
        buffer_size=buffer_size,
        codec=codec,
        command=command,
        media_type=mtype,
        platform=platform,
        samplerate=samplerate)


def main():
    pipeline = stream_infra.PipelineProcess(_flask_init, ip, port, platform)
    pipeline.start()
