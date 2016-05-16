#!/usr/bin/env python

# This file is part of mkchromecast.

import mkchromecast.__init__
from PyQt5.QtCore import QThread, QObject, pyqtSignal, pyqtSlot
from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from mkchromecast.config import *
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
        self.cc = casting()
        self.cc.initialize_cast()
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
            print(colors.warning('threading Configuration file exist'))
            print(colors.warning('threading Using defaults set there'))
            config.read(configf)
            backend = ConfigSectionMap("settings")['backend']
            print(backend)
        else:
            backend = mkchromecast.__init__.backend
        global cast
        if backend == 'node':
            stream()
        else:
            import mkchromecast.ffmpeg
            mkchromecast.ffmpeg.main()
        if platform == 'Darwin':
            inputdev()
            outputdev()
        else:
            create_sink()
        start = casting()
        start.initialize_cast()
        start.get_cc()
        start.play_cast()
        cast = start.cast
        self.pcastready.emit('done')
        self.pcastfinished.emit()
