# This file is part of Mkchromecast.

import os
import platform
import shlex
import subprocess
import sys
from typing import Optional

from mkchromecast import _arg_parsing
from mkchromecast import colors
from mkchromecast import config
from mkchromecast import constants
from mkchromecast.constants import OpMode
from mkchromecast.utils import terminate, check_url
from mkchromecast.resolution import resolutions

class Mkchromecast:
    """A singleton object that encapsulates Mkchromecast state."""
    _parsed_args = None

    def __init__(self, args = None):
        # TODO(xsdg): Require arg parsing to be done outside of this class.
        first_parse: bool = False
        if not args:
            if not self._parsed_args:
                Mkchromecast._parsed_args = _arg_parsing.Parser.parse_args()
                first_parse = True
            args = Mkchromecast._parsed_args

        self.args = args
        self.debug: bool = args.debug

        # Operating Mode
        self.operation: OpMode
        if args.discover:
            self.operation = OpMode.DISCOVER
        elif args.input_file:
            self.operation = OpMode.INPUT_FILE
        elif args.reset:
            self.operation = OpMode.RESET
        elif args.screencast:
            self.operation = OpMode.SCREENCAST
        elif args.source_url:
            self.operation = OpMode.SOURCE_URL
        elif args.tray:
            self.operation = OpMode.TRAY
        elif args.version:
            self.operation = OpMode.VERSION
        elif args.youtube:
            self.operation = OpMode.YOUTUBE
        else:
            self.operation = OpMode.AUDIOCAST

        # Need platform and debug (above) for config loading.
        self.platform: str = platform.system()

        tray_config: Optional[config.Config] = None
        if self.operation == OpMode.TRAY:
            # TODO(xsdg): Probably don't need to initialize most of this class
            # for Tray mode.
            tray_config = config.Config(platform=self.platform,
                                        read_only=True,
                                        debug=self.debug)
            tray_config.load_and_validate()

        # Arguments with no dependencies.
        # Groupings are mostly carried over from earlier code; unclear how
        # meaningful they are.
        self.adevice: Optional[str] = (
            tray_config.alsa_device if tray_config else args.alsa_device)

        self.notifications: bool = (
            tray_config.notifications if tray_config else args.notifications)
        self.search_at_launch: Optional[bool]
        if tray_config:
            self.search_at_launch = tray_config.search_at_launch
        else:
            self.search_at_launch = None
        self.colors: Optional[str] = tray_config.colors if tray_config else None
        self.tray: bool = args.tray

        self.discover: bool = args.discover
        self.host: Optional[str] = args.host
        # TODO(xsdg): Switch input_file to pathlib.Path
        self.input_file: Optional[str] = args.input_file
        self.source_url: Optional[str] = args.source_url
        self.subtitles: Optional[str] = args.subtitles
        self.hijack: bool = args.hijack
        self.device_name: Optional[str] = args.name
        self.port: int = args.port  # TODO(xsdg): Validate range 0..65535.
        self.fps: str = args.fps  # TODO(xsdg): Why is this typed as a str?

        self.mtype: Optional[str] = args.mtype
        self.reset: bool = args.reset
        self.version: bool = args.version

        self.screencast: bool = args.screencast
        self.display: Optional[str] = args.display
        self.vcodec: str = args.vcodec
        self.loop: bool = args.loop
        self.seek: Optional[str] = args.seek

        self.control: bool = args.control
        self.tries: Optional[int] = args.tries
        self.videoarg: bool = args.video

        # Arguments that depend on other arguments.
        self.select_device: bool = True if self.tray else args.select_device

        backend_options = constants.backend_options_for_platform(
            self.platform, args.video
        )

        self.backend: Optional[str]
        if tray_config:
            self.backend = tray_config.backend
        elif args.encoder_backend:
            if args.encoder_backend not in backend_options:
                print(colors.error(f"Backend {args.encoder_backend} is not in "
                                   "supported backends: "))
                for backend in backend_options:
                    print(f"- {backend}.")
                sys.exit(0)

            # encoder_backend is reasonable.
            self.backend = args.encoder_backend
        else:
            if args.video:
                self.backend = "ffmpeg"
            elif self.platform == "Darwin":
                self.backend = "node"
            else:  # self.platform == "Linux"
                self.backend = "parec"

        codec_choices = ["mp3", "ogg", "aac", "opus", "wav", "flac"]
        self.codec: str

        if self.operation == OpMode.SOURCE_URL:
            self.codec = args.codec
        elif tray_config:  # OpMode.TRAY
            # TODO(xsdg): Validate config codec.
            self.codec = tray_config.codec
        elif self.backend == "node":
            if args.codec != "mp3":
                print(colors.warning(f"Setting codec from {args.codec} to mp3, "
                                     "as required by node backend"))
                self.codec = "mp3"
        else:  # not source_url and backend != "node"
            if args.codec not in codec_choices:
                print(colors.options(f"Selected audio codec: {args.codec}."))
                print(colors.error("Supported audio codecs are: "))
                for codec in codec_choices:
                    print(f"- {codec}")
                sys.exit(0)

            self.codec = args.codec

        # TODO(xsdg): Add support for yt-dlp
        command_choices = ["ffmpeg", "youtube-dl"]
        self.command: Optional[str]
        if not args.command:
            self.command = None
        else:
            # TODO(xsdg): Unbreak this so that it can accept a full command
            # string, and not just a command name.
            if args.command not in command_choices:
                print(colors.options(f"Configured command: {args.command}"))
                print(colors.error("Supported commands are: "))
                for command in command_choices:
                    print(f"- {command}")
                sys.exit(0)

            self.command = args.command

        resolution_choices = [r.lower() for r in resolutions.keys()]
        self.resolution: Optional[str]
        if not args.resolution:
            self.resolution = None
        else:
            if args.resolution.lower() not in resolution_choices:
                print(colors.options(
                        f"Configured resolution: {args.resolution.lower()}"))
                print(colors.error("Supported resolutions are: "))
                for resolution in resolution_choices:
                    print(f"- {resolution}")
                sys.exit(0)

            self.resolution = args.resolution

        self.bitrate: int
        if tray_config:
            self.bitrate = tray_config.bitrate
        elif self.codec in constants.CODECS_WITH_BITRATE:
            if args.bitrate <= 0:
                print(colors.error("Bitrate must be a positive integer"))
                sys.exit(0)

            self.bitrate = args.bitrate
        else:
            # Will be ignored downstream.
            self.bitrate = constants.DEFAULT_BITRATE

        if args.chunk_size <= 0:
            print(colors.error("Chunk size must be a positive integer"))
            sys.exit(0)
        self.chunk_size: int = args.chunk_size

        if args.sample_rate < 22050:
            print(colors.error("Sample rate must be at least 22050"))
            sys.exit(0)

        self.samplerate: int
        if tray_config:
            self.samplerate = tray_config.samplerate
        elif self.codec == "opus":
            self.samplerate = 48000
        else:
            self.samplerate = args.sample_rate

        self.segment_time: Optional[int]
        if args.segment_time and self.backend not in ["parec", "node"]:
            self.segment_time = args.segment_time
        else:
            self.segment_time = None

        self.youtube_url: Optional[str]
        if not args.youtube:
            self.youtube_url = None
        else:
            if not check_url(args.youtube):
                youtube_error = """
                You need to provide a URL that is supported by youtube-dl.
                """

                # TODO(xsdg): Switch to yt-dlp.
                message = """
                For a list of supported sources please visit:
                    https://rg3.github.io/youtube-dl/supportedsites.html

                Note that the URLs have to start with https.
                """
                print(colors.error(youtube_error))
                print(message)

                sys.exit(0)

            # TODO(xsdg): Warn that we're overriding the backend here.
            # Especially since this doesn't account for platform.
            self.youtube_url = args.youtube
            self.backend = "ffmpeg"

        # Argument validation.
        self._validate_input_file()


        # Diagnostic messages
        if first_parse:
            self._debug(f"Parsed args in process {os.getpid()}")

            self._debug(f"ALSA device name: {self.adevice}")
            self._debug(f"Google Cast name: {self.device_name}")
            self._debug(f"backend: {self.backend}")

            # TODO(xsdg): These were just printed warnings in the original, but
            # should they be errors?
            if self.mtype and not self.videoarg:
                print(colors.warning(
                    "The media type argument is only supported for video."))

            if self.loop and self.videoarg:
                print(colors.warning(
                    "The loop and video arguments aren't compatible."))

            if self.command and not self.videoarg:
                print(colors.warning(
                    "The --command option only works for video."))

    def _validate_input_file(self) -> None:
        if not self.input_file:
            return
        if os.path.isfile(self.input_file):
            return

        # NOTE: Prior implementation did a reset in the case that input_file was
        # specified by did not exist.  That... doesn't really make much sense,
        # since it should be treated as an argument parsing/validation error. So
        # I've dropped that behavior.
        self._fatal_error(colors.warning(
            "Specified input file does not exist or is not a file."))

    def _debug(self, msg: str) -> None:
        if not self.debug:
            return
        # TODO(xsdg): Maybe use stderr for debug messages?
        print(msg)

    def _fatal_error(self, msg: str) -> None:
        """Prints the specified message and then exits."""
        print(colors.warning(msg))
        sys.exit()

    def __enter__(self):
        """Starts performing whatever task is requested."""

    
