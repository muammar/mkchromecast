#!/usr/bin/env python

# This file is part of mkchromecast.

import mkchromecast.__init__
from PyQt5.QtCore import QThread, QObject, pyqtSignal, pyqtSlot
from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from mkchromecast.config import *
import mkchromecast.ffmpeg
from mkchromecast.node import *
from mkchromecast.preferences import ConfigSectionMap
from mkchromecast.pulseaudio import *
from mkchromecast.systray import *
import os.path, pickle, pychromecast
"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser # This is for Python3

platform = mkchromecast.__init__.platform
debug = mkchromecast.__init__.debug
config = ConfigParser.RawConfigParser()
configurations = config_manager()    # Class from mkchromecast.config
configf = configurations.configf


class Worker(QObject):
    finished = pyqtSignal()
    intReady = pyqtSignal(list)

    def __init__(self):
        QObject.__init__(self)

    @pyqtSlot()
    def _search_cast_(self):
        try:                        # This should fix the error socket.gaierror making the system tray to be closed.
            self.cc = casting()
            self.cc.initialize_cast()
        except socket.gaierror:
            if debug == True:
                print(colors.warning(':::Threading::: Socket error, CC set to 0'))
            self.cc.availablecc == 0
        if len(self.cc.availablecc) == 0 and tray == True:
            availablecc = []
            self.intReady.emit(availablecc)
            self.finished.emit()
        else:
            availablecc = self.cc.availablecc
            self.intReady.emit(availablecc)
            self.finished.emit()

class Player(QObject):
    pcastfinished = pyqtSignal()
    pcastready = pyqtSignal(str)

    def __init__(self):
        QObject.__init__(self)

    @pyqtSlot()
    def _play_cast_(self):
        if os.path.exists(configf):
            print(colors.warning(':::Threading::: Configuration file exist'))
            print(colors.warning(':::Threading::: Using defaults set there'))
            config.read(configf)
            backend = ConfigSectionMap("settings")['backend']
            print(':::Threading backend::: '+backend)
        else:
            backend = mkchromecast.__init__.backend
        global cast
        if backend == 'node':
            stream()
        else:
            try:
                reload(mkchromecast.ffmpeg)
            except NameError:
                from imp import reload
                reload(mkchromecast.ffmpeg)
            mkchromecast.ffmpeg.main()
        if platform == 'Linux':
            create_sink()
        start = casting()
        start.initialize_cast()
        try:
            start.get_cc()
            start.play_cast()
            cast = start.cast
            if platform == 'Darwin': # Let's change inputs at the end to avoid muting sound too early.
                inputdev()           # For Linux it does not matter given that user has to select sink in pulse audio.
                outputdev()          # Therefore the sooner it is available, the better.
            self.pcastready.emit('_play_cast_ success')
        except AttributeError:
            self.pcastready.emit('_play_cast_ failed')
        self.pcastfinished.emit()

class Updater(QObject):
    upcastfinished = pyqtSignal()
    updateready = pyqtSignal(str)

    def __init__(self):
        QObject.__init__(self)

    @pyqtSlot()
    def _updater_(self):
        chk = casting()
        if chk.ip == '127.0.0.1' or None:       # We verify the local IP.
            self.updateready.emit('None')
        else:
            from mkchromecast.version import __version__
            import requests
            url = 'https://api.github.com/repos/muammar/mkchromecast/releases/latest'
            response = requests.get(url).text.split(',')

            for e in response:
                if 'tag_name' in e:
                    version = e.strip('"tag_name":')
                    break

            if version > __version__:
                print ('Version ' + version + ' is available to download')
                self.updateready.emit(version)
            else:
                print ('You are up to date')
                self.updateready.emit('False')
        self.upcastfinished.emit()
