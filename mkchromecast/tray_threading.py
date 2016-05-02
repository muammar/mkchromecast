#!/usr/bin/env python

# This file is part of mkchromecast.

import mkchromecast.__init__
from PyQt5.QtCore import QThread, QObject, pyqtSignal, pyqtSlot
from mkchromecast.audiodevices import *
from mkchromecast.cast import *
import mkchromecast.ffmpeg
from mkchromecast.node import *
from mkchromecast.systray import *
import os.path, pickle, pychromecast


backend = mkchromecast.__init__.backend

class Worker(QObject):
    finished = pyqtSignal()
    intReady = pyqtSignal(list)

    def __init__(self):
        QObject.__init__(self)

    @pyqtSlot()
    def _search_cast_(self):
        self.cc = casting()
        self.cc.initialize_cast()
        if len(self.cc.availablecc) == 0 and args.tray == True:
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
        global cast
        if backend == 'node':
            stream()
        else:
            mkchromecast.ffmpeg.main()
        inputdev()
        outputdev()
        start = casting()
        start.initialize_cast()
        start.get_cc()
        start.play_cast()
        cast = start.cast
        self.pcastready.emit('done')
        self.pcastfinished.emit()
