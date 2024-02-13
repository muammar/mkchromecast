# This file is part of mkchromecast.

import configparser
import os
import pathlib
from typing import Optional

# NOTE: Can't import mkchromecast because that would create a circular dependency.

# Section name.
SETTINGS = "settings"

# Field names.
BACKEND = "backend"
CODEC = "codec"
BITRATE = "bitrate"
SAMPLERATE = "samplerate"
NOTIFICATIONS = "notifications"
COLORS = "colors"
SEARCH_AT_LAUNCH = "search_at_launch"
ALSA_DEVICE = "alsa_device"


def _default_config_path(platform: str) -> pathlib.Path:
    config_dir: pathlib.PurePath
    if platform == "Darwin":
        config_dir = pathlib.PosixPath(
            "~/Library/Application Support/mkchromecast")
    else:  # Linux
        xdg_config_home = pathlib.PosixPath(
            os.environ.get("XDG_CONFIG_HOME", "~/.config"))
        config_dir = xdg_config_home / "mkchromecast"

    # TODO(xsdg): Switch this back to mkchromecast.cfg.
    config_path = config_dir / "mkchromecast_beta.cfg"

    print(f":::config::: WARNING: USING BETA CONFIG PATH: {config_path}")
    return config_path


class Config:
    """This represents a configuration, as backed by a config on disk.

    To use without updating settings, you can either use the `load_and_validate`
    method directly, or use it as a context manager, which will call that
    function.

    The context manager usage will _also_ consider saving updated files back to
    disk (depending on whether the instance is specified as read-only or not).
    That is the only supported way to write updated values to disk.
    """

    def __init__(self,
                 platform: str,
                 config_path: Optional[os.PathLike] = None,
                 read_only: bool = False,
                 debug: bool = False):
        self._debug = debug
        self._platform = platform
        self._read_only = read_only

        if config_path:
            self._config_path = config_path
        else:
            self._config_path = _default_config_path(self._platform)

        self._config = configparser.ConfigParser()

        self._default_conf = {
            CODEC: "mp3",
            BITRATE: 192,
            SAMPLERATE: 44100,
            NOTIFICATIONS: False,
            COLORS: "black",
            SEARCH_AT_LAUNCH: False,
            ALSA_DEVICE: None,
        }

        if self._platform == "Darwin":
            self._default_conf[BACKEND] = "node"
        else:
            self._default_conf[BACKEND] = "parec"

    def __enter__(self):
        """Parses config file and returns self"""
        self.load_and_validate()

        return self

    def __exit__(self, *exc):
        self._maybe_write_config()

    def load_and_validate(self) -> None:
        """Loads config from disk and validates that no settings are missing.

        If any settings are missing, they are set to the default value, and if
        this Config was not created read-only, the completed config will be
        written back to disk.
        """
        self._config.read(self._config_path)
        self._update_any_missing_values()

    def _maybe_write_config(self) -> None:
        """Writes the config to config_file unless read-only mode was used."""
        if self._read_only:
            return

        with open(self._config_path, "wt") as config_file:
            self._config.write(config_file)

    def _update_any_missing_values(self) -> None:
        """Sets any missing values to their defaults."""
        expected_keys = self._default_conf.keys()
        missing_keys: list[str] = []
        for key in expected_keys:
            if not self._config.has_option(SETTINGS, key):
                missing_keys.append(key)
                if self._debug:
                    print(f":::config::: Setting missing key {key} to default "
                          "value.")

                # We use setattr to avoid bypassing any validation code that
                # might exist.
                setattr(self, key, self._default_conf[key])

        if missing_keys:
            if self._read_only:
                print(":::config::: Missing keys _not_ being saved for "
                      "read-only config")
            else:
                if self._debug:
                    print(":::config::: Re-writing config to add missing keys: "
                          f"{missing_keys}")

                self._maybe_write_config()

    # TODO(xsdg): Refactor this to avoid code duplication.  Sadly,
    # functools.partialmethod doesn't work with properties.
    @property
    def backend(self) -> str:
        return self._config.get(SETTINGS, BACKEND)

    @backend.setter
    def backend(self, value: str) -> None:
        self._config.set(SETTINGS, BACKEND, value)

    @property
    def codec(self) -> str:
        return self._config.get(SETTINGS, CODEC)

    @codec.setter
    def codec(self, value: str) -> None:
        self._config.set(SETTINGS, CODEC, value)

    @property
    def bitrate(self) -> int:
        return self._config.getint(SETTINGS, BITRATE)

    @bitrate.setter
    def bitrate(self, value: int) -> None:
        self._config.set(SETTINGS, BITRATE, str(value))

    @property
    def samplerate(self) -> int:
        return self._config.getint(SETTINGS, SAMPLERATE)

    @samplerate.setter
    def samplerate(self, value: int) -> None:
        self._config.set(SETTINGS, SAMPLERATE, str(value))

    @property
    def notifications(self) -> bool:
        return self._config.getboolean(SETTINGS, NOTIFICATIONS)

    @notifications.setter
    def notifications(self, value: bool) -> None:
        self._config.set(SETTINGS, NOTIFICATIONS, str(value))

    @property
    def colors(self) -> str:
        return self._config.get(SETTINGS, COLORS)

    @colors.setter
    def colors(self, value: str) -> None:
        self._config.set(SETTINGS, COLORS, value)

    @property
    def search_at_launch(self) -> bool:
        return self._config.getboolean(SETTINGS, SEARCH_AT_LAUNCH)

    @search_at_launch.setter
    def search_at_launch(self, value: bool) -> None:
        self._config.set(SETTINGS, SEARCH_AT_LAUNCH, str(value))

    @property
    def alsa_device(self) -> Optional[str]:
        stored_value = self._config.get(SETTINGS, ALSA_DEVICE)
        if stored_value == "None":
            return None

        return stored_value

    @alsa_device.setter
    def alsa_device(self, value: Optional[str]) -> None:
        self._config.set(SETTINGS, ALSA_DEVICE, str(value))
