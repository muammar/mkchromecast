# This file is part of mkchromecast.

import configparser as ConfigParser
import os
import socket

import mkchromecast
from mkchromecast import audio
from mkchromecast import colors
from mkchromecast import node
from mkchromecast.audio_devices import inputdev, outputdev
from mkchromecast.cast import Casting
from mkchromecast.config import config_manager
from mkchromecast.constants import OpMode
from mkchromecast.preferences import ConfigSectionMap
from mkchromecast.pulseaudio import create_sink, check_sink
from PyQt5.QtCore import QObject, pyqtSignal, pyqtSlot


# TODO(xsdg): Encapsulate this so that we don't do this work on import.
_mkcc = mkchromecast.Mkchromecast()

config = ConfigParser.RawConfigParser()
# Class from mkchromecast.config
configurations = config_manager()
configf = configurations.configf


class Worker(QObject):
    finished = pyqtSignal()
    intReady = pyqtSignal(list)

    def __init__(self):
        QObject.__init__(self)

    @pyqtSlot()
    def _search_cast_(self):
        # This should fix the error socket.gaierror making the system tray to
        # be closed.
        try:
            self.cc = Casting(_mkcc)
            self.cc.initialize_cast()
            self.cc.available_devices()
        except socket.gaierror:
            if _mkcc.debug is True:
                print(colors.warning(":::Threading::: Socket error, CC set to 0"))
            pass
        except TypeError:
            pass
        except OSError:
            self.cc.available_devices = []

        if len(self.cc.available_devices) == 0 and _mkcc.operation == OpMode.TRAY:
            available_devices = []
            self.intReady.emit(available_devices)
            self.finished.emit()
        else:
            available_devices = self.cc.available_devices
            self.intReady.emit(available_devices)
            self.finished.emit()


class Player(QObject):
    pcastfinished = pyqtSignal()
    pcastready = pyqtSignal(str)

    def __init__(self):
        QObject.__init__(self)

    @pyqtSlot()
    def _play_cast_(self):
        if os.path.exists(configf):
            print(colors.warning(":::Threading::: Configuration file exists."))
            print(colors.warning(":::Threading::: Using defaults set there."))
            config.read(configf)
            backend = ConfigSectionMap("settings")["backend"]
            print(":::Threading backend::: %s." % backend)
        else:
            backend = _mkcc.backend
        global cast
        if backend == "node":
            node.stream_audio()
        else:
            try:
                reload(mkchromecast.audio)
            except NameError:
                from imp import reload

                reload(mkchromecast.audio)
            mkchromecast.audio.main()
        if _mkcc.platform == "Linux":
            # We create the sink only if it is not available
            if check_sink() is False and _mkcc.adevice is None:
                create_sink()

        start = Casting(_mkcc)
        start.initialize_cast()
        try:
            start.get_devices()
            start.play_cast()
            cast = start.cast
            # Let's change inputs at the end to avoid muting sound too early.
            # For Linux it does not matter given that user has to select sink
            # in pulse audio.  Therefore the sooner it is available, the
            # better.
            if _mkcc.platform == "Darwin":
                inputdev()
                outputdev()
            self.pcastready.emit("_play_cast_ success")
        except AttributeError:
            self.pcastready.emit("_play_cast_ failed")
        self.pcastfinished.emit()


url = "https://api.github.com/repos/muammar/mkchromecast/releases/latest"


class Updater(QObject):
    """This class is employed to check for new mkchromecast versions"""

    upcastfinished = pyqtSignal()
    updateready = pyqtSignal(str)

    def __init__(self):
        QObject.__init__(self)

    @pyqtSlot()
    def _updater_(self):
        chk = Casting()
        if chk.ip == "127.0.0.1" or None:  # We verify the local IP.
            self.updateready.emit("None")
        else:
            try:
                from mkchromecast.version import __version__
                import requests

                response = requests.get(url).text.split(",")

                for e in response:
                    if "tag_name" in e:
                        version = e.strip('"tag_name":')
                        break

                if version > __version__:
                    print("Version %s is available to download" % version)
                    self.updateready.emit(version)
                else:
                    print("You are up to date.")
                    self.updateready.emit("False")
            except UnboundLocalError:
                self.updateready.emit("error1")
            except requests.exceptions.ConnectionError:
                self.updateready.emit("error1")

        self.upcastfinished.emit()
