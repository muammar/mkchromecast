#!/usr/bin/env python

# This file is part of mkchromecast.

import sys
from PyQt5.QtWidgets import QWidget, QLabel, QComboBox, QApplication
from PyQt5 import QtCore
import mkchromecast.__init__        # This is to verify against some needed variables
from mkchromecast.config import *
"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser # This is for Python3


platform = mkchromecast.__init__.platform

def ConfigSectionMap(section):
    config = ConfigParser.RawConfigParser()
    configurations = config_manager()    # Class from mkchromecast.config
    configf = configurations.configf
    config.read(configf)
    dict1 = {}
    options = config.options(section)
    for option in options:
        try:
            dict1[option] = config.get(section, option)
            if dict1[option] == -1:
                DebugPrint("skip: %s" % option)
        except:
            print("exception on %s!" % option)
            dict1[option] = None
    return dict1

class preferences(QWidget):
    def __init__(self):
        try:
            super().__init__()
        except TypeError:
            super(self.__class__, self).__init__() #This is to port to python2

        self.config = ConfigParser.RawConfigParser()
        configurations = config_manager()    # Class from mkchromecast.config
        self.configf = configurations.configf
        if os.path.exists(self.configf) == False:
            print ('config does not exist')
            configurations.config_defaults()
        self.read_defaults()
        self.initUI()

    def initUI(self):

        """
        Backend
        """
        if platform == 'Darwin':
            backends = ["node", "ffmpeg"]
        else:
            backends.append("avconv")
        backendindex = backends.index(self.backendconf)
        self.backend = QLabel('Select Backend', self)
        self.backend.move(20, 24)
        self.qcbackend = QComboBox(self)
        self.qcbackend.move(180, 20)
        self.qcbackend.setMinimumContentsLength(7)
        for item in backends:
            self.qcbackend.addItem(item)
        self.qcbackend.setCurrentIndex(backendindex)
        self.qcbackend.activated[str].connect(self.onActivatedbk)

        """
        Codec
        """
        self.codec = QLabel('Audio coding format', self)
        self.codec.move(20, 56)
        self.qccodec = QComboBox(self)
        self.qccodec.clear()
        if self.backendconf == 'node':
            codecs = ['mp3']
        else:
            codecs = ['mp3', 'ogg', 'aac', 'wav', 'flac']
        print (codecs)
        codecindex = codecs.index(self.codecconf)
        self.qccodec.move(180, 54)
        self.qccodec.setMinimumContentsLength(7)
        for item in codecs:
            self.qccodec.addItem(item)
        self.qccodec.setCurrentIndex(codecindex)
        self.qccodec.activated[str].connect(self.onActivatedcc)

        """
        Bitrate
        """
        self.bitrate = QLabel('Select Bitrate (kbit/s)', self)
        self.bitrate.move(20, 88)
        self.qcbitrate = QComboBox(self)
        self.qcbitrate.move(180, 88)
        self.qcbitrate.setMinimumContentsLength(7)
        if self.codecconf == 'wav':
            bitrates = ["None"]
            self.config.read(self.configf)
            self.config.set('settings','bitrate','None')
            with open(self.configf, 'w') as configfile:
                    self.config.write(configfile)
        elif self.codecconf == 'flac':
            bitrates = ["None"]
            self.config.read(self.configf)
            self.config.set('settings','bitrate','None')
            with open(self.configf, 'w') as configfile:
                    self.config.write(configfile)
        else:
            bitrates = [ "128", "160", "192", "224", "256", "320", "500"]
            self.config.read(self.configf)
            self.config.set('settings','bitrate','192')
            with open(self.configf, 'w') as configfile:
                    self.config.write(configfile)
        for item in bitrates:
            self.qcbitrate.addItem(item)
        bitrateindex = bitrates.index(self.bitrateconf)
        self.qcbitrate.setCurrentIndex(bitrateindex)
        self.qcbitrate.activated[str].connect(self.onActivatedbt)

        """
        Sample rate
        """
        samplerates = ["48000", "44100", "32000", "22050"]
        sampleratesindex = samplerates.index(self.samplerateconf)
        self.samplerate = QLabel('Sample rate (Hz)', self)
        self.samplerate.move(20, 120)
        self.qcsamplerate = QComboBox(self)
        self.qcsamplerate.move(180, 120)
        self.qcsamplerate.setMinimumContentsLength(7)
        for item in samplerates:
            self.qcsamplerate.addItem(item)
        self.qcsamplerate.setCurrentIndex(sampleratesindex)
        self.qcsamplerate.activated[str].connect(self.onActivatedsr)

        """
        Notifications
        """
        notifications = ["enabled", "disabled"]
        notindex = notifications.index(self.notificationsconf)
        self.notifications = QLabel('Notifications', self)
        self.notifications.move(20, 152)
        self.qcnotifications = QComboBox(self)
        self.qcnotifications.move(180, 152)
        self.qcnotifications.setMinimumContentsLength(7)
        for item in notifications:
            self.qcnotifications.addItem(item)
        self.qcnotifications.setCurrentIndex(notindex)
        self.qcnotifications.activated[str].connect(self.onActivatednotify)

        #self.lbl.move(50, 150)

        self.setGeometry(300, 300, 300, 200)
        self.setFixedSize(300, 200)     #This is to fix the size of the window
        self.setWindowTitle('mkchromecast Preferences')

    def onActivatedbk(self, text):
        self.config.read(self.configf)
        self.config.set('settings','backend',text)
        with open(self.configf, 'w') as configfile:
                self.config.write(configfile)
        self.read_defaults()
        self.qccodec.clear()
        if self.backendconf == 'node':
            codecs = ['mp3']
            self.config.read(self.configf)
            self.config.set('settings','codec','mp3')
            with open(self.configf, 'w') as configfile:
                    self.config.write(configfile)
        else:
            codecs = ['mp3', 'ogg', 'aac', 'wav', 'flac']
        print (codecs)
        codecindex = codecs.index(self.codecconf)
        self.qccodec.move(180, 54)
        self.qccodec.setMinimumContentsLength(7)
        for item in codecs:
            self.qccodec.addItem(item)
        self.qccodec.setCurrentIndex(codecindex)
        self.qccodec.activated[str].connect(self.onActivatedcc)

    def onActivatedcc(self, text):
        self.config.read(self.configf)
        self.config.set('settings','codec',text)
        with open(self.configf, 'w') as configfile:
                self.config.write(configfile)
        self.read_defaults()
        self.qcbitrate.clear()
        if self.codecconf == 'wav':
            bitrates = ["None"]
            self.config.read(self.configf)
            self.config.set('settings','bitrate','None')
            with open(self.configf, 'w') as configfile:
                    self.config.write(configfile)
        elif self.codecconf == 'flac':
            bitrates = ["None"]
            self.config.read(self.configf)
            self.config.set('settings','bitrate','None')
            with open(self.configf, 'w') as configfile:
                    self.config.write(configfile)
        else:
            bitrates = [ "128", "160", "192", "224", "256", "320", "500"]
            self.config.read(self.configf)
            self.config.set('settings','bitrate','None')
            with open(self.configf, 'w') as configfile:
                    self.config.write(configfile)
        bitrateindex = bitrates.index(self.bitrateconf)
        self.qcbitrate.move(180, 88)
        self.qcbitrate.setCurrentIndex(bitrateindex)
        self.qcbitrate.activated[str].connect(self.onActivatedbt)

    def onActivatedbt(self, text):
        self.config.read(self.configf)
        self.config.set('settings','bitrate',text)
        with open(self.configf, 'w') as configfile:
                self.config.write(configfile)
        self.read_defaults()

    def onActivatedsr(self, text):
        self.config.read(self.configf)
        self.config.set('settings','samplerate',text)
        with open(self.configf, 'w') as configfile:
                self.config.write(configfile)
        self.read_defaults()

    def onActivatednotify(self, text):
        self.config.read(self.configf)
        self.config.set('settings','notifications',text)
        with open(self.configf, 'w') as configfile:
                self.config.write(configfile)
        self.read_defaults()
        #self.lbl.setText(text)
        #self.lbl.adjustSize()

    def read_defaults(self):
        self.backendconf = ConfigSectionMap("settings")['backend']
        self.codecconf = ConfigSectionMap("settings")['codec']
        if self.backendconf == 'node' and self.codecconf != 'mp3':
            self.config.read(self.configf)
            self.config.set('settings','codec','mp3')
            with open(self.configf, 'w') as configfile:
                    self.config.write(configfile)
            self.codecconf = ConfigSectionMap("settings")['codec']
        self.bitrateconf = ConfigSectionMap("settings")['bitrate']
        self.samplerateconf = ConfigSectionMap("settings")['samplerate']
        self.notificationsconf = ConfigSectionMap("settings")['notifications']

        print (self.backendconf, self.codecconf, self.bitrateconf, self.samplerateconf, self.notificationsconf)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    p = preferences()
    p.show()
    sys.exit(app.exec_())
