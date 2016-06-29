#!/usr/bin/env python

# This file is part of mkchromecast.

import sys
import mkchromecast.__init__        # This is to verify against some needed variables
from mkchromecast.config import *
import os, getpass
import subprocess

"""
Check if external programs are available to build the preferences
"""

platform = mkchromecast.__init__.platform
debug = mkchromecast.__init__.debug
tray = mkchromecast.__init__.tray
USER = getpass.getuser()

if platform == 'Darwin':
    PATH ='./bin:./nodejs/bin:/Users/'+str(USER)+'/bin:/usr/local/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/X11/bin:/usr/games:'+ os.environ['PATH']
else:
    PATH = os.environ['PATH']

if debug == True:
    print('USER ='+str(USER))
    print('PATH ='+str(PATH))

def is_installed(name):
    iterate = PATH.split(':')
    for item in iterate:
        verifyif = str(item+'/'+name)
        if os.path.exists(verifyif) == False:
            continue
        else:
            if debug == True:
                print('Program '+str(name)+' found in '+str(verifyif))
            return True
    return

"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser # This is for Python3



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

if tray == True:
    from PyQt5.QtWidgets import QWidget, QLabel, QComboBox, QApplication
    from PyQt5 import QtCore

    class preferences(QWidget):
        def __init__(self, scale_factor):
            try:
                super().__init__()
            except TypeError:
                super(self.__class__, self).__init__() #This is to port to python2

            self.scale_factor = scale_factor
            self.config = ConfigParser.RawConfigParser()
            self.configurations = config_manager()    # Class from mkchromecast.config
            self.configf = self.configurations.configf
            if os.path.exists(self.configf) == False:
                print('config does not exist')
                self.configurations.config_defaults()
            self.read_defaults()
            self.initUI()

        def initUI(self):
            """
            Backend
            """
            backends_supported = ['node', 'ffmpeg', 'avconv', 'parec']
            backends = []
            if platform == 'Darwin':
                for item in backends_supported:
                    if is_installed(item) == True and item != 'avconv':
                        backends.append(item)
            else:
                for item in backends_supported:
                    if is_installed(item) == True and item != 'node':
                        backends.append(item)
            backendindex = backends.index(self.backendconf)
            self.backend = QLabel('Select Backend', self)
            self.backend.move(20*self.scale_factor, 24*self.scale_factor)
            self.qcbackend = QComboBox(self)
            self.qcbackend.move(180*self.scale_factor, 20*self.scale_factor)
            self.qcbackend.setMinimumContentsLength(7)
            for item in backends:
                self.qcbackend.addItem(item)
            self.qcbackend.setCurrentIndex(backendindex)
            self.qcbackend.activated[str].connect(self.onActivatedbk)

            """
            Codec
            """
            self.codec = QLabel('Audio coding format', self)
            self.codec.move(20*self.scale_factor, 56*self.scale_factor)
            self.qccodec = QComboBox(self)
            self.qccodec.clear()
            if self.backendconf == 'node':
                codecs = ['mp3']
            else:
                codecs = ['mp3', 'ogg', 'aac', 'wav', 'flac']
            if debug == True:
                print(codecs)
            codecindex = codecs.index(self.codecconf)
            self.qccodec.move(180*self.scale_factor, 54*self.scale_factor)
            self.qccodec.setMinimumContentsLength(7)
            for item in codecs:
                self.qccodec.addItem(item)
            self.qccodec.setCurrentIndex(codecindex)
            self.qccodec.activated[str].connect(self.onActivatedcc)

            """
            Bitrate
            """
            self.bitrate = QLabel('Select Bitrate (kbit/s)', self)
            self.bitrate.move(20*self.scale_factor, 88*self.scale_factor)
            self.qcbitrate = QComboBox(self)
            self.qcbitrate.clear()
            self.qcbitrate.move(180*self.scale_factor, 88*self.scale_factor)
            self.qcbitrate.setMinimumContentsLength(7)
            if self.codecconf == 'wav':
                bitrates = ["None"]
                bitrateindex = 0
            elif self.codecconf == 'flac':
                bitrates = ["None"]
                bitrateindex = 0
            else:
                bitrates = [ "128", "160", "192", "224", "256", "320", "500"]
                bitrateindex = bitrates.index(self.bitrateconf)
            for item in bitrates:
                self.qcbitrate.addItem(item)
            self.qcbitrate.setCurrentIndex(bitrateindex)
            self.qcbitrate.activated[str].connect(self.onActivatedbt)

            """
            Sample rate
            """
            samplerates = ["48000", "44100", "32000", "22050"]
            sampleratesindex = samplerates.index(self.samplerateconf)
            self.samplerate = QLabel('Sample rate (Hz)', self)
            self.samplerate.move(20*self.scale_factor, 120*self.scale_factor)
            self.qcsamplerate = QComboBox(self)
            self.qcsamplerate.move(180*self.scale_factor, 120*self.scale_factor)
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
            self.notifications.move(20*self.scale_factor, 152*self.scale_factor)
            self.qcnotifications = QComboBox(self)
            self.qcnotifications.move(180*self.scale_factor, 152*self.scale_factor)
            self.qcnotifications.setMinimumContentsLength(7)
            for item in notifications:
                self.qcnotifications.addItem(item)
            self.qcnotifications.setCurrentIndex(notindex)
            self.qcnotifications.activated[str].connect(self.onActivatednotify)

            """
            Search at launch
            """
            atlaunch = ["enabled", "disabled"]
            launchindex = atlaunch.index(self.searchatlaunchconf)
            self.atlaunch = QLabel('Search at launch', self)
            self.atlaunch.move(20*self.scale_factor, 184*self.scale_factor)
            self.qcatlaunch = QComboBox(self)
            self.qcatlaunch.move(180*self.scale_factor, 184*self.scale_factor)
            self.qcatlaunch.setMinimumContentsLength(7)
            for item in atlaunch:
                self.qcatlaunch.addItem(item)
            self.qcatlaunch.setCurrentIndex(launchindex)
            #self.qcatlaunch.activated[str].connect(self.onActivatedatlaunch)

            self.setGeometry(300*self.scale_factor, 300*self.scale_factor, 300*self.scale_factor, 200*self.scale_factor)
            self.setFixedSize(300*self.scale_factor, 220*self.scale_factor)     #This is to fix the size of the window
            self.setWindowFlags(QtCore.Qt.WindowMinimizeButtonHint | QtCore.Qt.WindowStaysOnTopHint)
            self.setWindowTitle('mkchromecast Preferences')

            """
            Methods
            """
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
            if debug == True:
                print(codecs)
            codecindex = codecs.index(self.codecconf)
            self.qccodec.move(180*self.scale_factor, 54*self.scale_factor)
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
                bitrateindex = 0
            elif self.codecconf == 'flac':
                bitrateindex = 0
                bitrates = ["None"]
            else:
                self.configurations.verify_config()
                self.read_defaults()
                bitrates = [ "128", "160", "192", "224", "256", "320", "500"]
                bitrateindex = bitrates.index(self.bitrateconf)
            self.qcbitrate.move(180*self.scale_factor, 88*self.scale_factor)
            for item in bitrates:
                self.qcbitrate.addItem(item)
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
            self.searchatlaunchconf = ConfigSectionMap("settings")['searchatlaunch']
            if debug == True:
                print(self.backendconf, self.codecconf, self.bitrateconf, self.samplerateconf, self.notificationsconf, self.searchatlaunchconf)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    p = preferences()
    p.show()
    sys.exit(app.exec_())
