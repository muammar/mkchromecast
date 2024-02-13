# This file is part of mkchromecast.

import getpass
import os
import sys
from typing import Any
import webbrowser

import mkchromecast
from mkchromecast import constants
from mkchromecast import config
from mkchromecast.constants import OpMode
from mkchromecast.utils import is_installed

"""
Check if external programs are available to build the preferences
"""

# TODO(xsdg): Encapsulate this so that we don't do this work on import.
_mkcc = mkchromecast.Mkchromecast()
BITRATE_OPTIONS = [128, 160, 192, 224, 256, 320, 500]
USER = getpass.getuser()

if _mkcc.platform == "Darwin":
    # TODO(xsdg): This seems really inappropriate.  We should be respecting the
    # user's PATH rather than potentially running binaries that they don't
    # expect.
    PATH = (
        "./bin:./nodejs/bin:/Users/"
        + str(USER)
        + "/bin:/usr/local/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/X11/bin:/usr/games:"
        + os.environ["PATH"]
    )
else:
    PATH = os.environ["PATH"]

if _mkcc.debug is True:
    print("USER =" + str(USER))
    print("PATH =" + str(PATH))


if _mkcc.operation == OpMode.TRAY:
    from PyQt5.QtWidgets import (
        QWidget,
        QLabel,
        QComboBox,
        QApplication,
        QPushButton,
        QLineEdit,
    )
    from PyQt5 import QtCore

    class preferences(QWidget):
        def __init__(self, scale_factor):
            try:
                super().__init__()
            except TypeError:
                super(self.__class__, self).__init__()  # port to python2

            self.scale_factor = scale_factor
            self.config = config.Config(platform=_mkcc.platform,
                                        read_only=False,
                                        debug=_mkcc.debug)
            self.read_defaults()
            self.initUI()

        def initUI(self):
            self.backend()
            self.codec()
            self.bitrate()
            self.samplerates()
            self.iconcolors()
            self.notifications()
            self.searchatlaunch()
            if _mkcc.platform == "Linux":
                self.alsadevice()
            self.buttons()
            self.window()

        def backend(self):
            """
            Backend
            """
            backend_options = constants.backend_options_for_platform(
                _mkcc.platform
            )
            self.backends: list[str] = []
            for option in backend_options:
                if is_installed(option, PATH, _mkcc.debug):
                    self.backends.append(option)
            # Hard-coded for gstreamer.
            if (_mkcc.platform == "Linux"
                and is_installed("gst-launch-1.0", PATH, _mkcc.debug)):
                self.backends.append("gstreamer")

            try:
                backend_idx = self.backends.index(self.config.backend)
            except ValueError:
                # No backend found
                backend_idx = None

            self.backend = QLabel("Select Backend", self)
            self.backend.move(20 * self.scale_factor, 24 * self.scale_factor)
            self.qcbackend = QComboBox(self)
            self.qcbackend.move(180 * self.scale_factor, 20 * self.scale_factor)
            self.qcbackend.setMinimumContentsLength(7)
            for backend in self.backends:
                self.qcbackend.addItem(backend)

            if backend_idx:
                self.qcbackend.setCurrentIndex(backend_idx)

            self.qcbackend.activated[str].connect(self.onActivatedbk)

        def codec(self):
            """
            Codec
            """
            self.codec = QLabel("Audio Coding Format", self)
            self.codec.move(20 * self.scale_factor, 56 * self.scale_factor)
            self.qccodec = QComboBox(self)
            self.qccodec.clear()
            if self.config.backend == "node":
                self.codecs = ["mp3"]
            else:
                self.codecs = ["mp3", "ogg", "aac", "wav", "flac"]
            if _mkcc.debug is True:
                print(self.codecs)
            codecindex = self.codecs.index(self.codecconf)
            self.qccodec.move(180 * self.scale_factor, 54 * self.scale_factor)
            self.qccodec.setMinimumContentsLength(7)
            for item in self.codecs:
                self.qccodec.addItem(item)
            self.qccodec.setCurrentIndex(codecindex)
            self.qccodec.activated[str].connect(self.onActivatedcc)

        def bitrate(self):
            """
            Bitrate
            """
            self.bitrate = QLabel("Select Bitrate (kbit/s)", self)
            self.bitrate.move(20 * self.scale_factor, 88 * self.scale_factor)
            self.qcbitrate = QComboBox(self)
            self.qcbitrate.clear()
            self.qcbitrate.move(180 * self.scale_factor, 88 * self.scale_factor)
            self.qcbitrate.setMinimumContentsLength(7)
            if self.codecconf == "wav":
                self.bitrates = ["None"]
                bitrateindex = 0
            else:
                self.bitrates = ["128", "160", "192", "224", "256", "320", "500"]
                bitrateindex = self.bitrates.index(str(self.config.bitrate))
            for item in self.bitrates:
                self.qcbitrate.addItem(item)
            self.qcbitrate.setCurrentIndex(bitrateindex)
            self.qcbitrate.activated[str].connect(self.onActivatedbt)

        def samplerates(self):
            """
            Sample rate
            """
            samplerate_idx = constants.ALL_SAMPLE_RATES.index(
                self.config.samplerate)
            self.samplerate = QLabel("Sample Rate (Hz)", self)
            self.samplerate.move(20 * self.scale_factor, 120 * self.scale_factor)
            self.qcsamplerate = QComboBox(self)
            self.qcsamplerate.move(180 * self.scale_factor, 120 * self.scale_factor)
            self.qcsamplerate.setMinimumContentsLength(7)
            for samplerate in constants.ALL_SAMPLE_RATES:
                self.qcsamplerate.addItem(str(samplerate))
            self.qcsamplerate.setCurrentIndex(samplerate_idx)
            self.qcsamplerate.activated[str].connect(self.onActivatedsr)

        def iconcolors(self):
            """
            Icon colors
            """
            self.colors_list = ["black", "blue", "white"]
            colorsindex = self.colors_list.index(self.searchcolorsconf)
            self.colors = QLabel("Icon Colors", self)
            self.colors.move(20 * self.scale_factor, 152 * self.scale_factor)
            self.qccolors = QComboBox(self)
            self.qccolors.move(180 * self.scale_factor, 152 * self.scale_factor)
            self.qccolors.setMinimumContentsLength(7)
            for item in self.colors_list:
                self.qccolors.addItem(item)
            self.qccolors.setCurrentIndex(colorsindex)
            self.qccolors.activated[str].connect(self.onActivatedcolors)

        def notifications(self):
            """
            Notifications
            """
            self.notifications_list = ["enabled", "disabled"]
            notindex = self.notifications_list.index(self.notifconf)
            self.notifications = QLabel("Notifications", self)
            self.notifications.move(20 * self.scale_factor, 184 * self.scale_factor)
            self.qcnotifications = QComboBox(self)
            self.qcnotifications.move(180 * self.scale_factor, 184 * self.scale_factor)
            self.qcnotifications.setMinimumContentsLength(7)
            for item in self.notifications_list:
                self.qcnotifications.addItem(item)
            self.qcnotifications.setCurrentIndex(notindex)
            self.qcnotifications.activated[str].connect(self.onActivatednotify)

        def searchatlaunch(self):
            """
            Search at launch
            """
            self.atlaunch_list = ["enabled", "disabled"]
            launchindex = self.atlaunch_list.index(self.satlaunchconf)
            self.atlaunch = QLabel("Search At Launch", self)
            self.atlaunch.move(20 * self.scale_factor, 214 * self.scale_factor)
            self.qcatlaunch = QComboBox(self)
            self.qcatlaunch.move(180 * self.scale_factor, 214 * self.scale_factor)
            self.qcatlaunch.setMinimumContentsLength(7)
            for item in self.atlaunch_list:
                self.qcatlaunch.addItem(item)
            self.qcatlaunch.setCurrentIndex(launchindex)
            self.qcatlaunch.activated[str].connect(self.onActivatedatlaunch)

        def alsadevice(self):
            """
            Set the ALSA Device
            """
            self.alsadevice = QLabel("ALSA Device", self)
            self.alsadevice.move(20 * self.scale_factor, 244 * self.scale_factor)
            self.qle = QLineEdit(self)
            self.qle.move(179 * self.scale_factor, 244 * self.scale_factor)
            self.qle.setFixedWidth(84 * self.scale_factor)
            self.read_defaults()
            if self.alsadeviceconf is not None:
                self.qle.setText(self.alsadeviceconf)
            self.qle.textChanged[str].connect(self.onActivatedalsadevice)

        def buttons(self):
            """
            Buttons
            """
            resetbtn = QPushButton("Reset Settings", self)
            resetbtn.move(10 * self.scale_factor, 274 * self.scale_factor)
            resetbtn.clicked.connect(self.reset_configuration)

            faqbtn = QPushButton("FAQ", self)
            faqbtn.move(138 * self.scale_factor, 274 * self.scale_factor)
            faqbtn.clicked.connect(
                lambda: webbrowser.open(
                    "https://github.com/muammar/mkchromecast/wiki/FAQ"
                )
            )

        def window(self):
            """
            Geometry and window's title
            """
            self.setGeometry(
                300 * self.scale_factor,
                300 * self.scale_factor,
                300 * self.scale_factor,
                200 * self.scale_factor,
            )
            if _mkcc.platform == "Darwin":
                # This is to fix the size of the window
                self.setFixedSize(310 * self.scale_factor, 320 * self.scale_factor)
            else:
                # This is to fix the size of the window
                self.setFixedSize(282 * self.scale_factor, 320 * self.scale_factor)
            self.setWindowFlags(
                QtCore.Qt.WindowCloseButtonHint
                | QtCore.Qt.WindowMinimizeButtonHint
                | QtCore.Qt.WindowStaysOnTopHint
            )
            self.setWindowTitle("Mkchromecast Preferences")

            """
            Methods
            """

        def reset_configuration(self):
            self.configurations.write_defaults()
            self.reset_indexes()

        def reset_indexes(self):
            """
            Indexes of QCombo boxes are reset
            """
            backend_index = self.backends.index(self.config.backend)
            codecindex = self.codecs.index(self.config.codec)
            self.bitrates = ["128", "160", "192", "224", "256", "320", "500"]
            bitrateindex = self.bitrates.index(str(self.config.bitrate))
            self.qcbitrate.clear()
            for bitrate in self.bitrates:
                self.qcbitrate.addItem(str(bitrate))
            sampleratesindex = self.samplerates.index(self.config.samplerate)
            colorsindex = self.colors_list.index(self.config.colors)
            notindex = self.notifications_list.index(self.config.notifconf)
            launchindex = self.atlaunch_list.index(self.satlaunchconf)
            self.qcbackend.setCurrentIndex(backend_index)
            self.qccodec.setCurrentIndex(codecindex)
            self.qcbitrate.setCurrentIndex(bitrateindex)
            self.qcsamplerate.setCurrentIndex(sampleratesindex)
            self.qccolors.setCurrentIndex(colorsindex)
            self.qcnotifications.setCurrentIndex(notindex)
            self.qcatlaunch.setCurrentIndex(launchindex)

        def onActivatedbk(self, backend):
            # TODO(xsdg): input validation?
            # Available codecs vary by backend, so we 
            with self.config:
                self.config.backend = backend
                if backend == "node":
                    codecs = [constants.NODE_CODEC]
                    self.config.codec = constants.NODE_CODEC
                else:
                    codecs = constants.ALL_CODECS

            if _mkcc.debug is True:
                print("Codecs: %s." % codecs)
            codec_idx = codecs.index(self.config.codec)
            self.qccodec.clear()
            self.qccodec.move(180 * self.scale_factor, 54 * self.scale_factor)
            self.qccodec.setMinimumContentsLength(7)
            for codec in codecs:
                self.qccodec.addItem(codec)
            self.qccodec.setCurrentIndex(codec_idx)
            self.qccodec.activated[str].connect(self.onActivatedcc)

        def onActivatedcc(self, codec):
            with self.config:
                self.config.codec = codec

            bitrates: list[Any]
            if codec in constants.CODECS_WITH_BITRATE:
                bitrate_idx = BITRATE_OPTIONS.index(self.config.bitrate)
                bitrates = BITRATE_OPTIONS
            else:
                bitrate_idx = 0
                bitrates = [None]

            self.qcbitrate.clear()
            self.qcbitrate.move(180 * self.scale_factor, 88 * self.scale_factor)
            for bitrate in bitrates:
                self.qcbitrate.addItem(str(bitrate))
            self.qcbitrate.setCurrentIndex(bitrate_idx)
            self.qcbitrate.activated[str].connect(self.onActivatedbt)

        def onActivatedbt(self, bitrate):
            with self.config:
                self.config.bitrate = int(bitrate)

        def onActivatedsr(self, samplerate):
            with self.config:
                self.config.samplerate = int(samplerate)

        def onActivatednotify(self, setting):
            # TODO(xsdg): Switch this to a checkbox.
            with self.config:
                self.config.notifications = setting == "enabled"

        def onActivatedcolors(self, colors):
            with self.config:
                self.config.colors = colors

        def onActivatedatlaunch(self, setting):
            with self.config:
                self.config.search_at_launch = setting == "enabled"

        def onActivatedalsadevice(self, alsa_device):
            with self.config:
                if alsa_device:
                    self.config.alsa_device = alsa_device
                else:
                    self.config.alsa_device = None


if __name__ == "__main__":
    app = QApplication(sys.argv)
    p = preferences()
    p.show()
    sys.exit(app.exec_())
