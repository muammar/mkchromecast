# This file is part of mkchromecast.

import configparser
import functools
import getpass
import os
import pathlib
from typing import Optional

import mkchromecast

# Section name.
SETTINGS = "settings"

# Field names.
CODEC = "codec"
BITRATE = "bitrate"
SAMPLERATE = "samplerate"
NOTIFICATIONS = "notifications"
COLORS = "colors"
SEARCH_AT_LAUNCH = "searchatlaunch"
ALSA_DEVICE = "alsadevice"


def _default_config_path(mkcc: mkchromecast.Mkchromecast) -> pathlib.Path:
    config_dir: pathlib.PurePath
    if mkcc.platform == "Darwin":
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
    def __init__(self, config_path: Optional[os.PathLike] = None):
        self._mkcc = mkchromecast.Mkchromecast()

        if not config_path:
            config_path = _default_config_path(self._mkcc)

        self.config = configparser.ConfigParser()

    # TODO(xsdg): Refactor this to avoid code duplication.  Sadly,
    # functools.partialmethod doesn't work with properties.
    @property
    def codec(self) -> str:
        return self.config.get(SETTINGS, CODEC)

    @codec.setter
    def codec(self, value: str) -> None:
        self.config.set(SETTINGS, CODEC, value)

    @property
    def bitrate(self) -> int:
        return self.config.getint(SETTINGS, BITRATE)

    @bitrate.setter
    def bitrate(self, value: int) -> None:
        self.config.set(SETTINGS, BITRATE, str(value))

    @property
    def samplerate(self) -> int:
        return self.config.getint(SETTINGS, SAMPLERATE)

    @samplerate.setter
    def samplerate(self, value: int) -> None:
        self.config.set(SETTINGS, SAMPLERATE, str(value))

    @property
    def notifications(self) -> bool:
        return self.config.getboolean(SETTINGS, NOTIFICATIONS)

    @notifications.setter
    def notifications(self, value: bool) -> None:
        self.config.set(SETTINGS, NOTIFICATIONS, str(value))

    @property
    def colors(self) -> str:
        return self.config.get(SETTINGS, COLORS)

    @colors.setter
    def colors(self, value: str) -> None:
        self.config.set(SETTINGS, COLORS, value)

    @property
    def search_at_launch(self) -> bool:
        return self.config.getboolean(SETTINGS, SEARCH_AT_LAUNCH)

    @search_at_launch.setter
    def search_at_launch(self, value: bool) -> None:
        self.config.set(SETTINGS, SEARCH_AT_LAUNCH, str(value))

    @property
    def alsa_device(self) -> str:
        return self.config.get(SETTINGS, ALSA_DEVICE)

    @alsa_device.setter
    def alsa_device(self, value: str) -> None:
        self.config.set(SETTINGS, ALSA_DEVICE, value)


class config_manager:
    def __init__(self):
        self._mkcc = mkchromecast.Mkchromecast()

        self.config = configparser.ConfigParser()

        self.config.add_section("settings")
        self.default_conf = {
            "codec": "mp3",
            "bitrate": "192",
            "samplerate": "44100",
            "notifications": "disabled",
            "colors": "black",
            "searchatlaunch": "disabled",
            "alsadevice": None,
        }

        if self._mkcc.platform == "Darwin":
            self.default_conf["backend"] = "node"
        else:
            self.default_conf["backend"] = "parec"

        # Writing our configuration file

        self.config_path = _default_config_path(self._mkcc)
        self.config_dir = self.config_path.parent

    def config_defaults(self):
        """
        Verify that the directory exists.
        """
        self.config_dir.mkdir(parents=True, exist_ok=True)

        """
        Creation of new configuration file with defaults.
        """
        if not self.config_path.exists():
            self.write_defaults()

    def write_defaults(self):
        if self._mkcc.platform == "Darwin":
            self.config.set("settings", "backend", "node")
        else:
            self.config.set("settings", "backend", "parec")

        self.config.set("settings", "codec", "mp3")
        self.config.set("settings", "bitrate", "192")
        self.config.set("settings", "samplerate", "44100")
        self.config.set("settings", "notifications", "disabled")
        self.config.set("settings", "colors", "black")
        self.config.set("settings", "searchatlaunch", "disabled")
        self.config.set("settings", "alsadevice", None)

        with open(self.config_path, "w") as config_file:
            self.config.write(config_file)

    def chk_config(self):
        self.config.read(self.config_path)

        """
        We check that configuration file is complete, otherwise the settings
        are filled from self.defaultconf dictionary.
        """
        expected_keys = self.default_conf.keys()
        missing_keys: list[str] = []
        for key in expected_keys:
            if not self.config.has_option("settings", key):
                missing_keys.append(key)
                if self._mkcc.debug:
                    print(f":::config::: Setting missing key {key} to default "
                          "value.")
                self.config.set("settings", key, self.defaultconf[key])

        if missing_keys:
            if self._mkcc.debug:
                print(":::config::: Re-writing config to add missing keys: "
                      f"{missing_keys}")

            with open(self.config_path, "w") as config_file:
                self.config.write(config_file)
