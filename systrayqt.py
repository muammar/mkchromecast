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
        menu = QtWidgets.QMenu()
        self.SearchAction = menu.addAction("Search for Google cast devices")
        self.SearchAction.triggered.connect(self.search_cast)

        self.StopCastAction = menu.addAction("Stop casting")
        self.StopCastAction.triggered.connect(self.stop_cast)

        menu.addSeparator()
        self.StopCastAction = menu.addAction("List of CC")
        menu.addSeparator()
        self.ResetAudioAction = menu.addAction("Reset audio")
        self.ResetAudioAction.triggered.connect(self.reset_audio)

        self.ResetAudioAction = menu.addAction("About")

        exitAction = menu.addAction("Exit")
        exitAction.triggered.connect(app.quit)
        tray.setContextMenu(menu)
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
            for i in cc.availablecc:
                print i

    def stop_cast(self):
        cc.stop_cast()

    def reset_audio(self):
        inputint()
        outputint()

if __name__ == '__main__':
    menubar()
