# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import os
import re
import shutil
from typing import Union

import mkchromecast
from mkchromecast import colors
from mkchromecast import constants
from mkchromecast import pipeline_builder
from mkchromecast import stream_infra
from mkchromecast import utils
from mkchromecast.constants import OpMode
import mkchromecast.messages as msg


backend = stream_infra.BackendInfo()

# TODO(xsdg): Encapsulate this so that we don't do this work on import.
_mkcc = mkchromecast.Mkchromecast()
command: Union[str, list[str]]
media_type: str

# We make local copies of these attributes because they are sometimes modified.
# TODO(xsdg): clean this up more when we refactor this file.
host = _mkcc.host
port = _mkcc.port
platform = _mkcc.platform

ip = utils.get_effective_ip(platform, host_override=host, fallback_ip="0.0.0.0")

frame_size = 32 * _mkcc.chunk_size
buffer_size = 2 * _mkcc.chunk_size**2

debug = _mkcc.debug

if debug is True:
    print(
        ":::audio::: chunk_size, frame_size, buffer_size: %s, %s, %s"
        % (_mkcc.chunk_size, frame_size, buffer_size)
    )

# This is to take the youtube URL
if _mkcc.operation == OpMode.YOUTUBE:
    print(colors.options("The Youtube URL chosen: ") + _mkcc.youtube_url)

    try:
        import urlparse

        url_data = urlparse.urlparse(_mkcc.youtube_url)
        query = urlparse.parse_qs(url_data.query)
    except ImportError:
        import urllib.parse

        url_data = urllib.parse.urlparse(_mkcc.youtube_url)
        query = urllib.parse.parse_qs(url_data.query)

    if "v" in query:
        video = query["v"][0]
    else:
        video = _mkcc.youtube_url
    print(colors.options("Playing video:") + " " + video)

    command = ["youtube-dl", "-o", "-", _mkcc.youtube_url]
    media_type = "audio/mp4"
else:
    backend.name = _mkcc.backend
    backend.path = backend.name
    encode_settings = pipeline_builder.EncodeSettings(
        codec=_mkcc.codec,
        adevice=_mkcc.adevice,
        bitrate=_mkcc.bitrate,
        frame_size=frame_size,
        samplerate=str(_mkcc.samplerate),
        segment_time=_mkcc.segment_time
    )

    # TODO(xsdg): Why is this only run in tray mode???
    if _mkcc.operation == OpMode.TRAY and backend.name in {"ffmpeg", "parec"}:
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

    if encode_settings.codec == "mp3":
        media_type = "audio/mpeg"
    else:
        media_type = f"audio/{encode_settings.codec}"

    print(colors.options("Selected backend:") + f" {backend}")
    print(colors.options("Selected audio codec:") + f" {encode_settings.codec}")

    if backend.name != "node":
        encode_settings.bitrate = utils.clamp_bitrate(encode_settings.codec,
                                                      encode_settings.bitrate)

        if encode_settings.bitrate != "None":
            print(colors.options("Using bitrate:") + f" {encode_settings.bitrate}")

        if encode_settings.codec in constants.QUANTIZED_SAMPLE_RATE_CODECS:
            encode_settings.samplerate = str(utils.quantize_sample_rate(
                encode_settings.codec,
                int(encode_settings.samplerate))
            )

        print(colors.options("Using sample rate:") + f" {encode_settings.samplerate}Hz")

    builder = pipeline_builder.Audio(backend, platform, encode_settings)
    command = builder.command

if debug is True:
    print(":::audio::: command " + str(command))


def _flask_init():
    # TODO(xsdg): Update init_audio to take an EncodeSettings.
    stream_infra.FlaskServer.init_audio(
        adevice=encode_settings.adevice,
        backend=backend,
        bitrate=encode_settings.bitrate,
        buffer_size=buffer_size,
        codec=encode_settings.codec,
        command=command,
        media_type=media_type,
        platform=platform,
        samplerate=encode_settings.samplerate)


def main():
    pipeline = stream_infra.PipelineProcess(_flask_init, ip, port, platform)
    pipeline.start()
