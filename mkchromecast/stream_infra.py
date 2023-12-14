# This file is part of mkchromecast.

from dataclasses import dataclass
import flask
from functools import partial
import multiprocessing
import os
import pickle
import psutil
from subprocess import Popen, PIPE
import sys
import textwrap
import threading
import time
from typing import Callable, Optional, Union

import mkchromecast
from mkchromecast.audio_devices import inputint, outputint
from mkchromecast import colors

FlaskViewReturn = Union[str, flask.Response]


@dataclass
class BackendInfo:
    name: Optional[str] = None
    # TODO(xsdg): Switch to pathlib for this.
    path: Optional[str] = None


# TODO(xsdg): Consider porting to https://github.com/pallets-eco/flask-classful
# for a more natural approach to using Flask in an encapsulated way.
class FlaskServer:
    """Singleton Flask server for Chromecast audio and video casting.

    Given that Flask is module-based, this "class" encapsulates the state at a
    class level, and not at an instance level.
    """

    _app: Optional[flask.Flask] = None
    _video_mode: Optional[bool] = None

    _mkcc: mkchromecast.Mkchromecast
    _stream_url: str = "stream"

    # Common arguments.
    _command: Union[str, list[str]]
    _media_type: str

    # Audio arguments.
    _adevice: Optional[str]
    _backend: BackendInfo
    _bitrate: str
    _buffer_size: int
    _codec: str
    _platform: str
    _samplerate: str

    # Video arguments.
    _chunk_size: int

    @staticmethod
    def _init_common(video_mode: bool) -> None:
        if FlaskServer._app is not None or FlaskServer._video_mode is not None:
            raise Exception("Flask Server can only be initialized once.")

        FlaskServer._app = flask.Flask("mkchromecast")
        FlaskServer._app.add_url_rule("/", view_func=FlaskServer._index)

        # TODO(xsdg): Maybe just have distinct audio and video endpoints?
        if video_mode:
            FlaskServer._app.add_url_rule("/stream",
                                          view_func=FlaskServer._stream_video)
        else:
            FlaskServer._app.add_url_rule("/stream",
                                          view_func=FlaskServer._stream_audio)

        FlaskServer._video_mode = video_mode

    @staticmethod
    def init_audio(adevice: Optional[str],
                   backend: BackendInfo,
                   bitrate: str,
                   buffer_size: int,
                   codec: str,
                   command: Union[str, list[str]],
                   media_type: str,
                   platform: str,
                   samplerate: str) -> None:
        FlaskServer._init_common(video_mode=False)

        FlaskServer._adevice = adevice
        FlaskServer._backend = backend
        FlaskServer._bitrate = bitrate
        FlaskServer._buffer_size = buffer_size
        FlaskServer._codec = codec
        FlaskServer._command = command
        FlaskServer._media_type = media_type
        FlaskServer._platform = platform
        FlaskServer._samplerate = samplerate

    @staticmethod
    def init_video(chunk_size: int,
                   command: Union[str, list[str]],
                   media_type: str) -> None:
        FlaskServer._init_common(video_mode=True)

        FlaskServer._chunk_size = chunk_size
        FlaskServer._command = command
        FlaskServer._media_type = media_type

    @staticmethod
    def run(host: str, port: int) -> None:
        FlaskServer._ensure_initialized()

        # NOTE(xsdg): video.py used threaded=True and didn't specify
        # passthrough_errors.  audio.py used passthrough_errors=False and didn't
        # specify threaded.
        # I _believe_ that threaded is a bad idea, since it would potentially
        # launch multiple streaming pipelines.  I could be wrong about that,
        # though.

        # Original comment: Note that passthrough_errors=False is useful when
        # reconnecting. In that way, flask won't die.
        FlaskServer._app.run(host=host, port=port, passthrough_errors=False)

    @staticmethod
    def _ensure_initialized():
        if FlaskServer._app is None or FlaskServer._video_mode is None:
            raise Exception("Flask Server needs to be initialized first.")

    @staticmethod
    def _ensure_audio_mode():
        FlaskServer._ensure_initialized()
        if FlaskServer._video_mode == True:
            raise Exception(
                "Tried to use audio mode, but Flask Server was initialized in "
                "video mode.")

    @staticmethod
    def _ensure_video_mode():
        FlaskServer._ensure_initialized()
        if FlaskServer._video_mode == False:
            raise Exception(
                "Tried to use vidio mode, but Flask Server was initialized in "
                "audio mode.")

    @staticmethod
    def _index() -> FlaskViewReturn:
        FlaskServer._ensure_initialized()

        # TODO(xsdg): Add head and body tags?
        if FlaskServer._video_mode:
            return textwrap.dedent(f"""\
                <!doctype html>
                <title>Play {FlaskServer._stream_url}</title>
                <video controls autoplay >
                    <source src="{FlaskServer._stream_url}" type="video/mp4" >
                    Your browser does not support this video format.
                </video>
                """)
        else:
            return textwrap.dedent(f"""\
                <!doctype html>
                <title>Play {FlaskServer._stream_url}</title>
                <audio controls autoplay >
                    <source src="{FlaskServer._stream_url}" type="audio/mp3" >
                    Your browser does not support this audio format.
                </audio>
                """)

    @staticmethod
    def _stream_video() -> flask.Response:
        FlaskServer._ensure_video_mode()

        process = Popen(FlaskServer._command, stdout=PIPE, bufsize=-1)
        read_chunk = partial(os.read, process.stdout.fileno(), FlaskServer._chunk_size)
        return flask.Response(iter(read_chunk, b""), mimetype=FlaskServer._media_type)

    @staticmethod
    def _stream_audio():
        FlaskServer._ensure_audio_mode()

        if (
            FlaskServer._platform == "Linux"
            and FlaskServer._backend.name == "parec"
            and FlaskServer._backend.path is not None
        ):
            c_parec = [FlaskServer._backend.path, "--format=s16le", "-d", "Mkchromecast.monitor"]
            parec = Popen(c_parec, stdout=PIPE)

            try:
                process = Popen(FlaskServer._command, stdin=parec.stdout, stdout=PIPE, bufsize=-1)
            except FileNotFoundError:
                print("Failed to execute {}".format(FlaskServer._command))
                message = "Have you installed lame, see https://github.com/muammar/mkchromecast#linux-1?"
                raise Exception(message)

        elif (
            FlaskServer._platform == "Linux"
            and FlaskServer._backend.name == "gstreamer"
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
            if FlaskServer._adevice is not None:
                c_gst.insert(2, "alsasrc")
                c_gst.insert(3, 'device="' + FlaskServer._adevice + '"')
            else:
                c_gst.insert(2, "pulsesrc")
                c_gst.insert(3, 'device="Mkchromecast.monitor"')
            gst = Popen(c_gst, stdout=PIPE)
            process = Popen(FlaskServer._command, stdin=gst.stdout, stdout=PIPE, bufsize=-1)
        else:
            process = Popen(FlaskServer._command, stdout=PIPE, bufsize=-1)
        read_chunk = partial(os.read, process.stdout.fileno(), FlaskServer._buffer_size)
        return flask.Response(iter(read_chunk, b""), mimetype=FlaskServer._media_type)


# Launching the pipeline command in a separate process.
class PipelineProcess:
    def __init__(self, flask_init: Callable, host: str, port: int, platform: str):
        self._proc = multiprocessing.Process(
            target=PipelineProcess.start_app,
            args=(flask_init, host, port, platform,)
        )
        self._proc.daemon = True

    def start(self):
        self._proc.start()

    @staticmethod
    def start_app(flask_init: Callable, host: str, port: int, platform: str):
        """Starting the streaming server."""
        monitor_daemon = ParentMonitor(platform)
        monitor_daemon.start()

        flask_init()
        FlaskServer.run(host=host, port=port)


class ParentMonitor(object):
    """Thread that terminates this process if the main process dies.

    A normal running of mkchromecast will have 2 threads in the streaming
    process when ffmpeg is used.
    """

    def __init__(self, platform: str):
        self._monitor_thread = threading.Thread(target=ParentMonitor._monitor_loop,
                                                args=(platform,))
        self._monitor_thread.daemon = True

    def start(self):
        self._monitor_thread.start()

    @staticmethod
    def _monitor_loop(platform: str):
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
