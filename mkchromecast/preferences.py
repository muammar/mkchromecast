#!/usr/bin/env python

# This file is part of mkchromecast.

import sys
from PyQt5.QtWidgets import QWidget, QLabel, QComboBox, QApplication
from PyQt5 import QtCore

class preferences(QWidget):
    def __init__(self):
        try:
            super().__init__()
        except TypeError:
            super(self.__class__, self).__init__() #This is to port to python2

        self.initUI()

    def initUI(self):
        platform = 'Darwin'

        if platform == 'Darwin':
            self.lbl = QLabel("node", self)
        else:
            self.lbl = QLabel("ffmpeg", self)

        """
        Backend
        """
        backends = ["node", "ffmpeg", "avconv"]
        self.backend = QLabel('Select Backend', self)
        self.backend.move(20, 24)
        self.qcbackend = QComboBox(self)
        self.qcbackend.move(180, 20)
        self.qcbackend.setMinimumContentsLength(7)
        for item in backends:
            self.qcbackend.addItem(item)
        if platform == 'Darwin':
            self.qcbackend.setCurrentIndex(0)
        else:
            self.qcbackend.setCurrentIndex(1)
        self.qcbackend.activated[str].connect(self.onActivated)

        """
        Bitrate
        """
        bitrates = [ "128", "160", "192", "224", "256", "320", "500"]
        self.bitrate = QLabel('Select Bitrate (kbit/s)', self)
        self.bitrate.move(20, 56)
        self.qcbitrate = QComboBox(self)
        self.qcbitrate.move(180, 54)
        self.qcbitrate.setMinimumContentsLength(7)
        for item in bitrates:
            self.qcbitrate.addItem(item)
        self.qcbitrate.setCurrentIndex(2)
        self.qcbitrate.activated[str].connect(self.onActivated)

        """
        Sample rate
        """
        samplerates = ["48000", "44100", "32000", "22050"]
        self.samplerate = QLabel('Sample rate (Hz)', self)
        self.samplerate.move(20, 88)
        self.qcsamplerate = QComboBox(self)
        self.qcsamplerate.move(180, 88)
        self.qcsamplerate.setMinimumContentsLength(7)
        for item in samplerates:
            self.qcsamplerate.addItem(item)
        self.qcsamplerate.setCurrentIndex(1)
        self.qcsamplerate.activated[str].connect(self.onActivated)

        """
        Notifications
        """
        notifications = ["Enabled", "Disabled"]
        self.notifications = QLabel('Notifications', self)
        self.notifications.move(20, 120)
        self.qcnotifications = QComboBox(self)
        self.qcnotifications.move(180, 120)
        self.qcnotifications.setMinimumContentsLength(7)
        for item in notifications:
            self.qcnotifications.addItem(item)
        self.qcnotifications.setCurrentIndex(0)

        self.lbl.move(50, 150)

        self.setGeometry(300, 300, 300, 200)
        self.setFixedSize(300, 200)     #This is to fix the size of the window
        self.setWindowTitle('mkchromecast Preferences')

    def onActivated(self, text):
        self.lbl.setText(text)
        self.lbl.adjustSize()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    p = preferences()
    p.show()
    sys.exit(app.exec_())
