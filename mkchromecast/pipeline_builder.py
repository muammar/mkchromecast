# This file is part of mkchromecast.

from dataclasses import dataclass
import os
from typing import Optional, Union

import mkchromecast
from mkchromecast import colors
from mkchromecast import constants
from mkchromecast import resolution
from mkchromecast import stream_infra
from mkchromecast import utils

SubprocessCommand = Union[list[str], str, os.PathLike]

@dataclass
class EncodeSettings:
    codec: str
    adevice: Optional[str]
    bitrate: int
    frame_size: int
    samplerate: str
    segment_time: Optional[int]
    ffmpeg_debug: bool = False


class Audio:

    _ffmpeg_fmt_to_acodec: dict[str, str] = {
        "mp3": "libmp3lame",
        "ogg": "libvorbis",
        "adts": "aac",
        "opus": "libopus",
        "wav": "pcm_s24le",
        "flac": "flac",
    }

    def __init__(self,
                 backend: stream_infra.BackendInfo,
                 platform: str,
                 encode_settings: EncodeSettings):
        self._backend = backend
        self._platform = platform
        self._settings = encode_settings

    # TODO(xsdg): Use SubprocessCommand here.
    @property
    def command(self) -> list[str]:
        if self._platform == "Darwin":
            return self._build_ffmpeg_command()
        else:  # platform == "Linux"
            if self._backend.name == "ffmpeg":
                return self._build_ffmpeg_command()

            elif self._backend.name == "parec":
                return self._build_linux_other_command()

            else:
                # TODO(xsdg): gstreamer support never worked, so drop itDrop support for gstreamer.
                raise Exception("gstreamer is not currently supported")

    def _input_command(self) -> list[str]:
        """Returns an appropriate set of input arguments for the pipeline.

        Considers the platform and (on Linux) whether we're configured to use
        pulse or alsa.
        """
        if self._platform == "Darwin":
            return ["-f", "avfoundation", "-i", ":BlackHole 16ch"]
        else:  # platform == "Linux"
            # NOTE(xsdg): Warning on console:
            # [Pulse indev @ 0x564d070e7440] The "frame_size" option is deprecated: set number of bytes per frame
            cmd: list[str] = [
                "-ac", "2",
                "-ar", "44100",
                "-frame_size", str(self._settings.frame_size),
                "-fragment_size", str(self._settings.frame_size),
            ]

            if self._settings.adevice:
                cmd.extend(["-f", "alsa", "-i", self._settings.adevice])
            else:
                cmd.extend(["-f", "pulse", "-i", "Mkchromecast.monitor"])

            return cmd

    def _build_ffmpeg_command(self) -> list[str]:
        fmt = self._settings.codec
        # Special case: the ffmpeg format for AAC is ADTS
        if self._settings.codec == "aac":
            fmt = "adts"

        # Runs ffmpeg with debug logging enabled.
        maybe_debug_cmd: list[str] = (
            [] if not self._settings.ffmpeg_debug else ["-loglevel", "panic"]
        )

        maybe_bitrate_cmd: list[str]
        if self._settings.codec in constants.CODECS_WITH_BITRATE:
            maybe_bitrate_cmd = ["-b:a", f"{self._settings.bitrate}k"]
        else:
            maybe_bitrate_cmd = []

        # TODO(xsdg): It's really weird that the legacy code excludes
        # specifically Darwin/ogg and Linux/aac.  Do some more testing to
        # determine if this was just a copy-paste error or if there's an
        # underlying motivation for which of these don't use segment_time.
        maybe_segment_cmd: list[str]
        if self._settings.segment_time and (
            (self._platform == "Darwin" and fmt != "ogg") or
            (self._platform == "Linux" and fmt != "adts")):
            maybe_segment_cmd = [
                "-f", "segment",
                "-segment_time", str(self._settings.segment_time)
            ]
        else:
            maybe_segment_cmd = []

        # TODO(xsdg): Figure out and document why -segment_time and -cutoff are
        # clustered specifically for aac.
        maybe_cutoff_cmd: list[str]
        if fmt == "adts" and self._settings.segment_time:
            maybe_cutoff_cmd = ["-cutoff", "18000"]
        else:  # fmt != "adts" or bool(segment_time) == False
            maybe_cutoff_cmd = []

        return [self._backend.path,
                *maybe_debug_cmd,
                *self._input_command(),
                *maybe_segment_cmd,
                "-f", fmt,
                "-acodec", self._ffmpeg_fmt_to_acodec[fmt],
                "-ac", "2",
                "-ar", self._settings.samplerate,
                *maybe_bitrate_cmd,
                *maybe_cutoff_cmd,
                "pipe:",
        ]

    def _build_linux_other_command(self) -> list[str]:
        if self._settings.codec == "mp3":
            return ["lame",
                    "-b", str(self._settings.bitrate),
                    "-r",
                    "-"]

        if self._settings.codec == "ogg":
            return ["oggenc",
                    "-b", str(self._settings.bitrate),
                    "-Q",
                    "-r",
                    "--ignorelength",
                    "-"]

        # Original comment: AAC > 128k for Stereo, Default sample rate: 44100Hz.
        if self._settings.codec == "aac":
            # TODO(xsdg): This always applies the 18kHz cutoff, in contrast to
            # the ffmpeg code which only applies it when segment_time is
            # included.  Figure out this discrepancy.
            return ["faac",
                    "-b", str(self._settings.bitrate),
                    "-X",
                    "-P",
                    "-c", "18000",
                    "-o", "-",
                    "-"]

        if self._settings.codec == "opus":
            return ["opusenc",
                    "-",
                    "--raw",
                    "--bitrate", str(self._settings.bitrate),
                    "--raw-rate", self._settings.samplerate,
                    "-"]

        if self._settings.codec == "wav":
            return ["sox",
                    "-t", "raw",
                    "-b", "16",
                    "-e", "signed",
                    "-c", "2",
                    "-r", self._settings.samplerate,
                    "-",
                    "-t", "wav",
                    "-b", "16",
                    "-e", "signed",
                    "-c", "2",
                    "-r", self._settings.samplerate,
                    "-L",
                    "-"]

        if self._settings.codec == "flac":
            return ["flac",
                    "-",
                    "-c",
                    "--channels", "2",
                    "--bps", "16",
                    "--sample-rate", self._settings.samplerate,
                    "--endian", "little",
                    "--sign", "signed",
                    "-s"]

        raise Exception(f"Can't handle unexpected codec {self._settings.codec}")


def is_mkv(filename: str) -> bool:
    return filename.endswith("mkv")


@dataclass
class VideoSettings:
    display: Optional[str]  # TODO(xsdg): Should this be Optional?
    fps: str
    input_file: Optional[str]
    resolution: Optional[str]
    screencast: bool
    subtitles: Optional[str]
    user_command: Optional[str]  # TODO(xsdg): check type.
    vcodec: str
    youtube_url: Optional[str]


class Video:
    def __init__(self, video_settings: VideoSettings):
        self._settings = video_settings

    @property
    def command(self) -> SubprocessCommand:
        # TODO(xsdg): Set up a mutually-exclusive group for youtube_url,
        # screencast, user_command, and input_file in _arg_parsing.py .
        if self._settings.youtube_url:
            return ["youtube-dl", "-o", "-", self._settings.youtube_url]

        if self._settings.screencast:
            return self._screencast_command()

        if self._settings.user_command:
            return self._settings.user_command

        if self._settings.input_file:
            return self._input_file_command()

        # TODO(xsdg): Figure out if there's any way to actually get here.
        raise Exception("Internal error: Unexpected video mode")

    def _screencast_command(self) -> list[str]:
        screen_size = resolution.resolution(
            self._settings.resolution or "1080p",
            self._settings.screencast
        )

        maybe_veryfast_cmd: list[str]
        if self._settings.vcodec != "h264_nvenc":
            maybe_veryfast_cmd = ["-preset", "veryfast"]
        else:
            maybe_veryfast_cmd = []

        return ["ffmpeg",
                "-ac", "2",
                "-ar", "44100",
                "-frame_size", "2048",
                "-fragment_size", "2048",
                "-f", "pulse",
                "-ac", "2",
                "-i", "Mkchromecast.monitor",
                "-f", "x11grab",
                "-r", self._settings.fps,
                "-s", screen_size,
                "-i", "{}+0,0".format(self._settings.display),
                "-vcodec", self._settings.vcodec,
                *maybe_veryfast_cmd,
                "-tune", "zerolatency",
                "-maxrate", "10000k",
                "-bufsize", "20000k",
                "-pix_fmt", "yuv420p",
                "-g", "60",  # '-c:a', 'copy', '-ac', '2',
                # '-b', '900k',
                "-f", "mp4",
                "-movflags", "frag_keyframe+empty_moov",
                "-ar", "44100",
                "-acodec", "libvorbis",
                "pipe:1",
        ]

    @staticmethod
    def _input_file_subtitle(subtitles: Optional[str], is_mkv: bool) -> tuple[list[str], list[str]]:
        """Returns input_file arguments related to subtitles.

        Depending on the pipeline settings, this will return arguments to be
        specified alongside the input streams, and/or arguments to be specified
        near the output settings.

        Returns:
            A tuple of (input-adjacent args, output-adjacent args).
        """
        if not subtitles:
            return ([], [],)

        if not is_mkv:
            # Only output-adjacent args for non-mkv input files.
            output_args = ["-vf", f"subtitles={subtitles}"]
            return ([], output_args,)

        print(colors.warning("Subtitles with mkv are not supported yet."))
        # NOTE(xsdg):  Here's an excerpt from the original command:
        # "-i", _mkcc.input_file,
        # "-i", _mkcc.subtitles,
        # "-c:v", "copy",
        # "-c:a", "copy",
        # "-c:s", "mov_text",
        # "-map", "0:0",
        # "-map", "0:1",
        # "-map", "1:0",
        #
        # The first number in the "-map" command corresponds to an input
        # stream.  So "1" is the subtitle stream, and "0" is input_file.

        # NOTE(xsdg): In the original command,
        # "-max_muxing_queue_size" came after "-f" and before
        # "-movflags".  We may need to move it to be functionally
        # equivalent to the original command.

        input_args = ["-i", subtitles,
                      "-codec:s", "mov_text",
                      "-map", "1:0"]
        output_args = ["-max_muxing_queue_size", "9999"]
        return (input_args, output_args,)

    @staticmethod
    def _input_file_vencode(input_file: str) -> list[str]:
        input_is_mkv = is_mkv(input_file)
        copy_vencode = ["-vcodec", "copy"]

        if not input_is_mkv:
            # Return early to avoid expensive check_file_info.
            return copy_vencode

        # TODO(xsdg): rename "bit-depth" to something more accurate.
        pixel_format = utils.check_file_info(input_file, what="bit-depth")
        if pixel_format == "yuv420p10le":
            return ["-vcodec", "libx264",
                    "-preset", "ultrafast",
                    "-tune", "zerolatency",
                    "-maxrate", "10000k",
                    "-bufsize", "20000k",
                    "-pix_fmt", "yuv420p",
                    "-g", "60"]

        return copy_vencode

    @staticmethod
    def _input_file_aencode(has_subtitles: bool, input_is_mkv: bool) -> list[str]:
        #sub None, mkv False -> []
        #sub None mkv True -> ["-acodec", "libmp3lame", "-q:a", "0"]
        #sub not None, mkv False -> []
        #sub not None, mkv True -> ["-c:a", "copy"]

        # acodec is only specified for mkv files.
        if not input_is_mkv:
            return []

        if has_subtitles:
            return ["-codec:a", "copy"]
        else:
            return ["-codec:a", "libmp3lame",
                    "-q:a", "0"]

    def _input_file_command(self) -> list[str]:
        # Commands adapted from:
        # https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#Streamingafile
        if not self._settings.input_file:
            raise Exception("Internal error: input file is not specified.")

        input_is_mkv = is_mkv(self._settings.input_file)

        maybe_input_subtitle_cmd, maybe_vf_subtitle_cmd = (
            self._input_file_subtitle(self._settings.subtitles, input_is_mkv))

        vencode_cmd = self._input_file_vencode(self._settings.input_file)

        aencode_cmd = self._input_file_aencode(bool(self._settings.subtitles),
                                               input_is_mkv)

        return [
            "ffmpeg",
            "-re",
            "-i", self._settings.input_file,
            *maybe_input_subtitle_cmd,
            "-map_chapters", "-1",
            *vencode_cmd,
            *aencode_cmd,
            "-vcodec", "libx264",
            "-preset", "veryfast",
            "-tune", "zerolatency",
            "-maxrate", "10000k",
            "-bufsize", "20000k",
            "-pix_fmt", "yuv420p",
            "-g", "60",
            # '-b', '900k',
            "-f", "mp4",
            "-movflags", "frag_keyframe+empty_moov",
            *maybe_vf_subtitle_cmd,
            "pipe:1",
        ]

