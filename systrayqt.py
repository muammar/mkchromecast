#!/usr/bin/env python

# This file is part of mkchromecast.

from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from PyQt5 import QtCore, QtGui, QtWidgets
import signal


cc = casting()
class menubar(object):
    def __init__(self):
        signal.signal(signal.SIGINT, signal.SIG_DFL)

        app = QtWidgets.QApplication([])

        icon = QtGui.QIcon('images/google.ico')
        tray = QtWidgets.QSystemTrayIcon(icon)
        self.menu = QtWidgets.QMenu()
        self.SearchAction = self.menu.addAction("Search for Google cast devices")
        self.SearchAction.triggered.connect(self.search_cast)

        self.StopCastAction = self.menu.addAction("Stop casting")
        self.StopCastAction.triggered.connect(self.stop_cast)

        self.menu.addSeparator()
        self.StopCastAction = self.menu.addAction("Available Google cast devices")
        if self.StopCastAction.triggered.connect == True:
            self.cast_list()

        self.menu.addSeparator()
        self.ResetAudioAction = self.menu.addAction("Reset audio")
        self.ResetAudioAction.triggered.connect(self.reset_audio)

        self.ResetAudioAction = self.menu.addAction("About")

        exitAction = self.menu.addAction("Exit")
        exitAction.triggered.connect(app.quit)
        tray.setContextMenu(self.menu)
        tray.show()
        app.exec_()




    def search_cast(self):
        args.select_cc = True
        cc.initialize_cast()
        self.cast_list()

    def cast_list(self):
        if len(cc.availablecc) == 0:
            print ('No devices found!')
        else:
            for menuentry in cc.availablecc:
                print ('Lo hizo!')
                print menuentry[0]
                self.entry = self.menu.addAction(str(menuentry[0]))

    def stop_cast(self):
        cc.stop_cast()

    def reset_audio(self):
        inputint()
        outputint()

if __name__ == '__main__':
    menubar()
