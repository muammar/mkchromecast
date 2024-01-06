# This file is part of mkchromecast.

import configparser as ConfigParser
import os
import pickle
import socket
import subprocess
from threading import Thread
import time
from typing import Any, Optional

import mkchromecast
from mkchromecast import utils
from mkchromecast.audio_devices import inputint, outputint
import mkchromecast.colors as colors
from mkchromecast.constants import OpMode
from mkchromecast.preferences import ConfigSectionMap
from mkchromecast.utils import terminate, checkmktmp
from mkchromecast.pulseaudio import remove_sink
from mkchromecast.messages import print_available_devices
from mkchromecast.version import __version__


"""
We verify that soco is installed to give Sonos support
"""
try:
    import soco

    sonos = True
except ImportError:
    sonos = False

"""
We verify that pychromecast is installed
"""
try:
    import pychromecast

    chromecast = True
except ImportError:
    chromecast = False


class Casting(object):
    """Main casting class."""

    def __init__(self, mkcc: mkchromecast.Mkchromecast):
        self.mkcc = mkcc

        self.title = "Mkchromecast v" + __version__

        self.ip = utils.get_effective_ip(self.mkcc.platform, host_override=self.mkcc.host)

        self.cast: Optional[Any] = None
        self.sonos: Optional[Any] = None

    def _get_chromecasts(self):
        # TODO(xsdg): Drop backwards compatibility with old versions of
        # pychromecast

        # compatibility
        try:
            return list(pychromecast.get_chromecasts_as_dict().keys())
        except AttributeError:
            pass

        _chromecasts = pychromecast.get_chromecasts(tries=self.mkcc.tries)

        # since PR380, pychromecast.get_chromecasts returns a tuple
        # see: https://github.com/home-assistant-libs/pychromecast/pull/380
        if type(_chromecasts) == tuple:
            _chromecasts = _chromecasts[0]

        self._chromecasts_by_name = {c.name: c for c in _chromecasts}

        return list(self._chromecasts_by_name.keys())

    def _get_chromecast(self, name):
        # compatibility
        try:
            return pychromecast.get_chromecast(friendly_name=self.cast_to)
        except AttributeError:
            return self._chromecasts_by_name[name]

    """
    Cast processes
    """

    def initialize_cast(self):
        # This fixes the `No handlers could be found for logger
        # "pychromecast.socket_client` warning"`.
        # See commit 18005ebd4c96faccd69757bf3d126eb145687e0d.
        if chromecast:
            from pychromecast import socket_client

            self.cclist = self._get_chromecasts()
            self.cclist = [[i, _, "Gcast"] for i, _ in enumerate(self.cclist)]
        else:
            self.cclist = []

        if sonos:
            try:
                # Checking groups
                zone = soco.discovery.any_soco()

                self.sonos_list = zone.all_groups

                for self.index, group in enumerate(self.sonos_list):
                    add_sonos = [self.index, group.coordinator, "Sonos"]
                    self.cclist.append(add_sonos)
            except (TypeError, AttributeError):
                pass

        if self.mkcc.debug is True:
            print("self.cclist", self.cclist)

        if (
            len(self.cclist) != 0
            and self.mkcc.select_device is False
            and self.mkcc.device_name is None
        ):
            if self.mkcc.debug is True:
                print("if len(self.cclist) != 0 and self.mkcc.select_device == False:")
            print(" ")
            print_available_devices(self.available_devices())
            print(" ")
            if self.mkcc.discover is False:
                print(colors.important("Casting to first device shown above!"))
                print(colors.important("Select devices by using the -s flag."))
                print(" ")
                self.cast_to = self.cclist[0][1]
                if self.cclist[0][2] == "Sonos":
                    print(colors.success(self.cast_to.player_name))
                else:
                    print(colors.success(self.cast_to))
                print(" ")

        elif (
            len(self.cclist) != 0
            and self.mkcc.select_device is True
            and self.mkcc.tray is False
            and self.mkcc.device_name is None
        ):
            if self.mkcc.debug is True:
                print(
                    "elif len(self.cclist) != 0 and self.mkcc.select_device == True"
                    " and self.mkcc.tray == False:"
                )
            if os.path.exists("/tmp/mkchromecast.tmp") is False:
                self.tf = open("/tmp/mkchromecast.tmp", "wb")
                print(" ")
                print_available_devices(self.available_devices())
            else:
                if self.mkcc.debug is True:
                    print("else:")
                self.tf = open("/tmp/mkchromecast.tmp", "rb")
                self.index = pickle.load(self.tf)
                self.cast_to = self.cclist[int(self.index)]
                print(" ")
                print(
                    colors.options("Casting to:") + " " + colors.success(self.cast_to)
                )
                print(" ")

        elif len(self.cclist) != 0 and self.mkcc.select_device is True and self.mkcc.tray is True:
            if self.mkcc.debug is True:
                print(
                    "elif len(self.cclist) != 0 and self.mkcc.select_device == True"
                    "  and self.mkcc.tray == True:"
                )
            if os.path.exists("/tmp/mkchromecast.tmp") is False:
                self.tf = open("/tmp/mkchromecast.tmp", "wb")
                print(" ")
                print_available_devices(self.available_devices())
            else:
                if self.mkcc.debug is True:
                    print("else:")
                self.tf = open("/tmp/mkchromecast.tmp", "rb")
                self.cast_to = pickle.load(self.tf)
                print_available_devices(self.available_devices())
                print(" ")
                print(
                    colors.options("Casting to:") + " " + colors.success(self.cast_to)
                )
                print(" ")

        elif len(self.cclist) == 0 and self.mkcc.tray is False:
            if self.mkcc.debug is True:
                print("elif len(self.cclist) == 0 and self.mkcc.tray == False:")
            print(colors.error("No devices found!"))
            if self.mkcc.platform == "Linux" and self.mkcc.adevice is None:
                remove_sink()
            elif self.mkcc.platform == "Darwin":
                inputint()
                outputint()
            terminate()
            exit()

        elif len(self.cclist) == 0 and self.mkcc.tray is True:
            print(colors.error(":::Tray::: No devices found!"))
            self.available_devices = []

    def select_a_device(self):
        print(" ")
        print(
            "Please, select the "
            + colors.important("Index")
            + " of the Google Cast device that you want to use:"
        )
        self.index = input()

    def input_device(self, write_to_pickle=True):
        while True:
            try:
                if write_to_pickle:
                    pickle.dump(self.index, self.tf)
                    self.tf.close()
                self.cast_to = self.cclist[int(self.index)][1]
                print(" ")
                print(
                    colors.options("Casting to:") + " " + colors.success(self.cast_to)
                )
                print(" ")
            except TypeError:
                print(
                    colors.options("Casting to:")
                    + " "
                    + colors.success(self.cast_to.player_name)
                )
            except IndexError:
                checkmktmp()
                self.tf = open("/tmp/mkchromecast.tmp", "wb")
                self.mkcc.select_device()
                continue
            break

    def get_devices(self):
        if self.mkcc.debug is True:
            print("def get_devices(self):")
        if chromecast:
            try:
                if self.mkcc.device_name is not None:
                    self.cast_to = self.mkcc.device_name
                self.cast = self._get_chromecast(self.cast_to)
                # Wait for cast device to be ready
                self.cast.wait()
                print(" ")
                print(
                    colors.important("Information about ")
                    + " "
                    + colors.success(self.cast_to)
                )
                print(" ")
                print(self.cast.device)
                print(" ")
                print(
                    colors.important("Status of device ")
                    + " "
                    + colors.success(self.cast_to)
                )
                print(" ")
                print(self.cast.status)
                print(" ")
            except pychromecast.error.NoChromecastFoundError:
                print(
                    colors.error(
                        "No Chromecasts matching filter criteria" " were found!"
                    )
                )
                if self.mkcc.platform == "Darwin":
                    inputint()
                    outputint()
                elif self.mkcc.platform == "Linux":
                    remove_sink()
                # In the case that the tray is used, we don't kill the
                # application
                if self.mkcc.tray is False:
                    print(colors.error("Finishing the application..."))
                    terminate()
                    exit()
                else:
                    self.stop_cast()
            except AttributeError:
                pass
            except KeyError:
                pass

    def play_cast(self):
        if self.mkcc.debug is True:
            print("def play_cast(self):")
        localip = self.ip

        try:
            print(
                colors.options("The IP of ")
                + colors.success(self.cast_to)
                + colors.options(" is:")
                + " "
                + self.cast.socket_client.host  # valid since at least v3.0.0
            )
        except TypeError:
            print(
                colors.options("The IP of ")
                + colors.success(self.cast_to.player_name)
                + colors.options(" is:")
                + " "
                + self.cast_to.ip_address
            )
        except AttributeError:  # what AttributeError is being expected?
            for _ in self.sonos_list:
                if self.cast_to == _.player_name:
                    self.cast_to = _
            print(
                colors.options("The IP of ")
                + colors.success(self.cast_to.player_name)
                + colors.options(" is:")
                + " "
                + self.cast_to.ip_address
            )

        if self.mkcc.host is None:
            print(colors.options("Your local IP is:") + " " + localip)
        else:
            print(colors.options("Your manually entered local IP is:") + " " + localip)

        try:
            media_controller = self.cast.media_controller

            if self.mkcc.tray is True:
                config = ConfigParser.RawConfigParser()
                # Class from mkchromecast.config
                from mkchromecast.config import config_manager

                configurations = config_manager()
                configf = configurations.configf

                if os.path.exists(configf) and self.mkcc.tray is True:
                    print(self.mkcc.tray)
                    print(colors.warning("Configuration file exists"))
                    print(colors.warning("Using defaults set there"))
                    config.read(configf)
                    self.mkcc.backend = ConfigSectionMap("settings")["backend"]

            # Set up the mime type and conditionally import video or audio
            # TODO(xsdg): Get rid of these conditional imports.
            media_type: str
            if self.mkcc.videoarg:
                import mkchromecast.video

                # TODO(xsdg): Centralize media type storage in some way.
                # In mkcc?
                media_type = self.mkcc.mtype or "video/mp4"
            else:
                import mkchromecast.audio

                media_type = mkchromecast.audio.media_type
            print(" ")
            print(colors.options("Using media type:") + f" {media_type}")

            play_url: str
            if self.mkcc.operation = OpMode.SOURCE_URL:
                play_url = self.mkcc.source_url
                print(colors.options("Casting from stream URL:")
                      + f" {play_url}")
            else:
                play_url = f"http://{localip}:{self.mkcc.port}/stream"

            media_controller.play_media(
                play_url, media_type, title=self.title, stream_type="LIVE",
            )

            if media_controller.is_active:
                media_controller.play()

            print(" ")
            print(colors.important("Cast media controller status"))
            print(" ")
            print(self.cast.status)
            print(" ")

            time.sleep(5.0)
            media_controller.play()

            if self.mkcc.hijack is True:
                self.r = Thread(target=self.hijack_cc)
                # This has to be set to True so that we catch
                # KeyboardInterrupt.
                self.r.daemon = True
                self.r.start()

        # TODO(xsdg): This isn't an appropriate exception-handling strategy.
        except AttributeError:
            self.sonos = self.cast_to
            self.sonos.play_uri(
                "x-rincon-mp3radio://" + localip + ":" + self.mkcc.port + "/stream",
                title=self.title,
            )
            if self.mkcc.tray is True:
                self.cast = self.sonos

    def pause(self):
        """Pause casting"""
        media_controller = self.cast.media_controller
        media_controller.pause()

    def play(self):
        """Play casting"""
        media_controller = self.cast.media_controller
        media_controller.play()

    def stop_cast(self):
        if self.cast:
            self.cast.quit_app()
        if self.sonos:
            self.sonos.stop()

    def volume_up(self):
        """Increment volume by 0.1 unless it is already maxed.
        Returns the new volume.
        """
        if self.mkcc.debug is True:
            print("Increasing volume... \n")
        try:
            volume = round(self.cast.status.volume_level, 1)
            return self.cast.set_volume(volume + 0.1)
        except AttributeError:
            self.sonos.volume += 1
            self.sonos.play()

    def volume_down(self):
        """Decrement the volume by 0.1 unless it is already 0.
        Returns the new volume.
        """
        if self.mkcc.debug is True:
            print("Decreasing volume... \n")
        try:
            volume = round(self.cast.status.volume_level, 1)
            return self.cast.set_volume(volume - 0.1)
        except AttributeError:
            self.sonos.volume -= 1
            self.sonos.play()

    def reboot(self):
        try:
            from pychromecast.dial import reboot
        except ImportError:
            # reboot is removed from pychromecast.dial since PR394
            # see: https://github.com/home-assistant-libs/pychromecast/pull/394
            print(
                colors.warning(
                    "This version of pychromecast does not support reboot. Will do nothing."
                )
            )
            reboot = lambda x: None

        if self.mkcc.platform == "Darwin":
            self.cast.host = socket.gethostbyname(self.cast_to + ".local")
            reboot(self.cast.host)
        else:
            print(colors.error("This method is not supported in Linux yet."))

    # TOOD(xsdg): Unclear how this works, but the self.available_devices method
    # and the self.available_devices attribute are in obvious conflict.
    def available_devices(self):
        """This method is uplay_mediased for populating the self.available_devices array
        needed for the system tray.
        """
        self.available_devices = []
        for self.index, device in enumerate(self.cclist):
            try:
                types = device[2]
                if types == "Sonos":
                    device_ip = device[1].ip_address
                    device = device[1].player_name
                else:
                    device = device[1]
            except UnicodeEncodeError:
                types = device[2]
                if types == "Sonos":
                    device_ip = device[1].ip_address
                    device = device[1].player_name
                else:
                    device = device[1]
            if types == "Sonos":
                to_append = [self.index, device, types, device_ip]
            else:
                to_append = [self.index, device, types]
            self.available_devices.append(to_append)

        return self.available_devices

    def hijack_cc(self):
        """Dummy method to call  _hijack_cc_().

        In the cast that the self.r thread is alive, we check that the
        chromecast is connected. If it is connected, we check again in
        5 seconds.
        """
        try:
            while self.r.is_alive():
                self._hijack_cc_()
                # FIXME: I think that this has to be set by users.
                time.sleep(5)
        except KeyboardInterrupt:
            self.stop_cast()
            if self.mkcc.platform == "Darwin":
                inputint()
                outputint()
            elif self.mkcc.platform == "Linux" and self.mkcc.adevice is None:
                remove_sink()
            terminate()

    def _hijack_cc_(self):
        """Check if chromecast is disconnected and hijack.

        This function checks if the chromecast is online. Then, if the display
        name is different from "Default Media Receiver", it hijacks to the
        chromecast.
        """

        ip = self.cast.socket_client.host  # valid since at least v3.0.0

        if ping_chromecast(ip) is True:  # The chromecast is online.
            if str(self.cast.status.display_name) != "Default Media Receiver":
                self.mkcc.device_name = self.cast_to
                self.get_devices()
                self.play_cast()
        else:  # The chromecast is offline.
            try:
                self.mkcc.device_name = self.cast_to
                self.get_devices()
                self.play_cast()
            except AttributeError:
                pass


def ping_chromecast(ip):
    """This function pings to hosts.

    Credits: http://stackoverflow.com/a/34455969/1995261
    """
    try:
        subprocess.check_output("ping -c 1 " + ip, shell=True)
    except:
        return False
    return True
