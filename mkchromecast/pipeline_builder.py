# This file is part of mkchromecast.

from dataclasses import dataclass
from typing import Optional

import mkchromecast
from mkchromecast import stream_infra

@dataclass
class EncodeSettings:
    codec: str
    adevice: Optional[str]
    bitrate: str
    frame_size: int
    samplerate: str
    segment_time: Optional[int]

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

    @property
    def command(self) -> list[str]:
        if self._platform == "Darwin":
            return self._build_ffmpeg_command()
        else:  # platform == "Linux"
            if self._backend.name == "ffmpeg":
                return self._build_ffmpeg_command()

            return self._build_linux_other_command()

    def _input_command(self) -> list[str]:
        """Returns an appropriate set of input arguments for the pipeline.

        Considers the platform and (on Linux) whether we're configured to use
        pulse or alsa.
        """
        if self._platform == "Darwin":
            return ["-f", "avfoundation", "-i", ":BlackHole 16ch"]
        else:  # platform == "Linux"
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

        maybe_bitrate_cmd: list[str] = (
            ["-b:a", self._settings.bitrate] if fmt != "wav" else []
        )

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
        raise Exception("Not yet implemented")
