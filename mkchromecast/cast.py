# This file is part of mkchromecast.

import dataclasses
import os
import pickle
import socket
import subprocess
from threading import Thread
import time
from typing import Any, Iterable, Optional

import mkchromecast
from mkchromecast import colors
from mkchromecast import utils
from mkchromecast.audio_devices import inputint, outputint
from mkchromecast.constants import OpMode
from mkchromecast.utils import terminate, checkmktmp
from mkchromecast.pulseaudio import remove_sink
from mkchromecast.version import __version__


"""
We verify that soco is installed to give Sonos support
"""
has_sonos: bool
try:
    import soco

    has_sonos = True
except ImportError:
    has_sonos = False

"""
We verify that pychromecast is installed
"""
has_chromecast: bool
try:
    import pychromecast

    has_chromecast = True
except ImportError:
    has_chromecast = False


@dataclasses.dataclass
class AvailableDevice:
    index: int
    name: str
    type: str

    def __str__(self):
        return f"{self.index} \t{self.type} \t{self.name}"


def print_available_devices(devices: Iterable[AvailableDevice]):
    """Prints a list of available devices."""
    print(colors.important("List of Devices Available in Network:"))
    print(colors.important("-------------------------------------\n"))
    print(colors.important("Index   Type    Friendly Name "))
    print(colors.important("=====   =====   ============= "))
    for device in devices:
        print(f"{device.index} \t{device.type} \t{device.name.encode('utf-8').decode('utf-8')}")


class Casting:
    """Main casting class."""

    def __init__(self, mkcc: mkchromecast.Mkchromecast):
        self.mkcc = mkcc

        self.title = "Mkchromecast v" + __version__

        self.ip = utils.get_effective_ip(self.mkcc.platform, host_override=self.mkcc.host)

        self.cast: Optional[pychromecast.Chromecast] = None
        self._chromecasts_by_name: dict[str, pychromecast.Chromecast]

    def _get_chromecast_names(self) -> list[str]:
        _chromecasts = pychromecast.get_chromecasts(tries=self.mkcc.tries)

        # since PR380, pychromecast.get_chromecasts returns a tuple
        # see: https://github.com/home-assistant-libs/pychromecast/pull/380
        if type(_chromecasts) == tuple:
            _chromecasts = _chromecasts[0]

        self._chromecasts_by_name = {c.name: c for c in _chromecasts}

        return list(self._chromecasts_by_name.keys())

    """
    Cast processes
    """

    def initialize_cast(self):
        # This fixes the `No handlers could be found for logger
        # "pychromecast.socket_client` warning"`.
        # See commit 18005ebd4c96faccd69757bf3d126eb145687e0d.
        from pychromecast import socket_client

        tmp_cclist = self._get_chromecast_names()
        self.cclist = [[i, name, "Gcast"] for i, name in enumerate(tmp_cclist)]

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
            print_available_devices(self.available_devices)
            print(" ")
            if self.mkcc.operation != OpMode.DISCOVER:
                print(colors.important("Casting to first device shown above!"))
                print(colors.important("Select devices by using the -s flag."))
                print(" ")
                self.cast_to = self.cclist[0][1]
                print(colors.success(self.cast_to))
                print(" ")

        elif (
            len(self.cclist) != 0
            and self.mkcc.select_device is True
            and self.mkcc.operation != OpMode.TRAY
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
                print_available_devices(self.available_devices)
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

        elif len(self.cclist) != 0 and self.mkcc.select_device and self.mkcc.operation == OpMode.TRAY:
            if self.mkcc.debug is True:
                print(
                    "elif len(self.cclist) != 0 and self.mkcc.select_device == True"
                    "  and self.mkcc.tray == True:"
                )
            if os.path.exists("/tmp/mkchromecast.tmp") is False:
                self.tf = open("/tmp/mkchromecast.tmp", "wb")
                print(" ")
                print_available_devices(self.available_devices)
            else:
                if self.mkcc.debug is True:
                    print("else:")
                self.tf = open("/tmp/mkchromecast.tmp", "rb")
                self.cast_to = pickle.load(self.tf)
                print_available_devices(self.available_devices)
                print(" ")
                print(
                    colors.options("Casting to:") + " " + colors.success(self.cast_to)
                )
                print(" ")

        elif len(self.cclist) == 0 and self.mkcc.operation != OpMode.TRAY:
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

        elif len(self.cclist) == 0 and self.mkcc.operation == OpMode.TRAY:
            print(colors.error(":::Tray::: No devices found!"))

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
                # TODO(xsdg): The original code had what was likely a typo here,
                # in that this called `self.select_device()`, which did not
                # exist.  It likely was supposed to be `self.select_a_device()`,
                # but it's better to just start over, here.
                raise Exception(
                    "Internal error: Never worked; needs to be fixed.")
                self.mkcc.select_device()
                continue
            break

    def get_devices(self):
        if self.mkcc.debug is True:
            print("def get_devices(self):")

        if self.mkcc.device_name:
            self.cast_to = self.mkcc.device_name

        if self.cast_to not in self._chromecasts_by_name:
            self.cast = None
            print(colors.warning(f"No Chromecast found named {self.cast_to}"))

            if self.mkcc.platform == "Darwin":
                inputint()
                outputint()
            elif self.mkcc.platform == "Linux":
                remove_sink()

            # In the case that the tray is used, we don't kill the
            # application
            if self.mkcc.operation == OpMode.TRAY:
                return

            print(colors.error("Finishing the application..."))
            terminate()
            exit()

        self.cast = self._chromecasts_by_name[self.cast_to]
        # Wait for cast device to be ready
        self.cast.wait()
        print()
        print(
            colors.important("Status of device ")
            + " "
            + colors.success(self.cast_to)
        )
        print()
        print(self.cast.status)
        print()

    def play_cast(self):
        if self.mkcc.debug is True:
            print("def play_cast(self):")
        if not self.cast:
            print(colors.warning("Calling get_devices before proceeding with play_cast"))
            self.get_devices()
            if not self.cast:
                raise Exception("Internal error, self.cast was not set.")
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

        if self.mkcc.host is None:
            print(colors.options("Your local IP is:") + " " + localip)
        else:
            print(colors.options("Your manually entered local IP is:") + " " + localip)

        media_controller = self.cast.media_controller

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
        if self.mkcc.operation == OpMode.SOURCE_URL:
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

    def pause(self):
        """Pause casting"""
        if not self.cast:
            raise Exception("Internal error: not initialized.")
        media_controller = self.cast.media_controller
        media_controller.pause()

    def play(self):
        """Play casting"""
        if not self.cast:
            raise Exception("Internal error: not initialized.")
        media_controller = self.cast.media_controller
        media_controller.play()

    def stop_cast(self):
        if self.cast:
            self.cast.quit_app()

    def volume_up(self):
        """Increment volume by 0.1 unless it is already maxed.
        Returns the new volume.
        """
        if not self.cast:
            raise Exception("Internal error: not initialized.")
        if self.mkcc.debug is True:
            print("Increasing volume... \n")
        volume = round(self.cast.status.volume_level, 1)
        return self.cast.set_volume(volume + 0.1)

    def volume_down(self):
        """Decrement the volume by 0.1 unless it is already 0.
        Returns the new volume.
        """
        if not self.cast:
            raise Exception("Internal error: not initialized.")
        if self.mkcc.debug is True:
            print("Decreasing volume... \n")
        volume = round(self.cast.status.volume_level, 1)
        return self.cast.set_volume(volume - 0.1)

    @property
    def available_devices(self) -> list[AvailableDevice]:
        """The list of available devices."""
        devices: list[AvailableDevice] = []
        for device_index, (_, name, type_) in enumerate(self.cclist):
            devices.append(AvailableDevice(device_index, name, type_))

        return devices

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
        if not self.cast:
            raise Exception("Internal error: not initialized.")

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


class _DisabledSonosCasting:
    """Half-hearted attempt at refactoring Sonos support into its own class.

    This is broken, but should simplify the Chromecast support code until the
    Sonos support can be unbroken at some later point.
    """

    def __init__(self, mkcc: mkchromecast.Mkchromecast):
        self.mkcc = mkcc

        self.title = "Mkchromecast v" + __version__

        self.ip = utils.get_effective_ip(self.mkcc.platform, host_override=self.mkcc.host)

        self.sonos: Optional[Any] = None

    """
    Cast processes
    """

    def initialize_cast(self):
        self.cclist: list[Any] = []
        if has_sonos:
            # Checking groups
            zone = soco.discovery.any_soco()

            self.sonos_list = zone.all_groups

            for self.index, group in enumerate(self.sonos_list):
                add_sonos = [self.index, group.coordinator, "Sonos"]
                self.cclist.append(add_sonos)

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
            if self.mkcc.operation != OpMode.DISCOVER:
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
            and self.mkcc.operation != OpMode.TRAY
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

        elif len(self.cclist) != 0 and self.mkcc.select_device and self.mkcc.operation == OpMode.TRAY:
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

        elif len(self.cclist) == 0 and self.mkcc.operation != OpMode.TRAY:
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

        elif len(self.cclist) == 0 and self.mkcc.operation == OpMode.TRAY:
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
                # TODO(xsdg): The original code had what was likely a typo here,
                # in that this called `self.select_device()`, which did not
                # exist.  It likely was supposed to be `self.select_a_device()`,
                # but it's better to just start over, here.
                raise Exception(
                    "Internal error: Never worked; needs to be fixed.")
                self.mkcc.select_device()
                continue
            break

    def get_devices(self):
        if self.mkcc.debug is True:
            print("def get_devices(self):")
        if has_chromecast:
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
                if self.mkcc.operation != OpMode.TRAY:
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

        for sonos_target in self.sonos_list:
            if self.cast_to == sonos_target.player_name:
                self.cast_to = sonos_target
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

        raise Exception("Internal error: This code path is broken and "
                        "needs to be fixed.")
        self.sonos = self.cast_to
        self.sonos.play_uri(
            "x-rincon-mp3radio://" + localip + ":" + self.mkcc.port + "/stream",
            title=self.title,
        )
        if self.mkcc.operation == OpMode.TRAY:
            # TODO(xsdg): No.
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
        if self.sonos:
            self.sonos.stop()

    def volume_up(self):
        """Increment volume by 0.1 unless it is already maxed.
        Returns the new volume.
        """
        if self.mkcc.debug is True:
            print("Increasing volume... \n")
        self.sonos.volume += 1
        self.sonos.play()

    def volume_down(self):
        """Decrement the volume by 0.1 unless it is already 0.
        Returns the new volume.
        """
        if self.mkcc.debug is True:
            print("Decreasing volume... \n")
        self.sonos.volume -= 1
        self.sonos.play()

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
