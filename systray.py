#!/usr/bin/env python

# This file is part of mkchromecast.
# brew install pyqt5 --with-python --without-python3

from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from mkchromecast.streaming import *

from PyQt5 import QtCore, QtGui, QtWidgets
import signal
import os.path
from os import getpid
import psutil


class menubar(object):
    def __init__(self):
        self.cc = casting()
        signal.signal(signal.SIGINT, signal.SIG_DFL)
        self.cc.cast = None
        self.systray = True
        self.stopped = False



    def search_menu(self):
        self.SearchAction = menu.addAction("Search for Google cast devices")
        self.SearchAction.triggered.connect(self.search_cast)

    def stop_menu(self):
        self.StopCastAction = menu.addAction("Stop casting")
        self.StopCastAction.triggered.connect(self.stop_cast)

    def separator_menu(self):
        menu.addSeparator()

    def populating_menu(self):
        if self.SearchAction.triggered.connect == True:
            self.cast_list()

    def resetaudio_menu(self):
        self.ResetAudioAction = menu.addAction("Reset audio")
        self.ResetAudioAction.triggered.connect(self.reset_audio)

    def about_menu(self):
        self.AboutAction = menu.addAction("About")

    def exit_menu(self):
        exitAction = menu.addAction("Quit")
        exitAction.triggered.connect(self.exit_all)

    """
    These are methods for interacting with the mkchromecast objects
    """


    def search_cast(self):
        args.select_cc = True
        if self.stopped == True and os.path.exists('/tmp/mkcrhomecast.tmp') == True:
            os.remove('/tmp/mkcrhomecast.tmp')
        self.cc.initialize_cast()
        self.cast_list()

    def cast_list(self):
        if len(self.cc.availablecc) == 0:
            menu.clear()
            self.search_menu()
            self.separator_menu()
            self.NodevAction = self.menu.addAction("No devices found!")
            self.separator_menu()
            self.stop_menu()
            self.resetaudio_menu()
            self.about_menu()
            self.exit_menu()
        else:
            menu.clear()
            self.search_menu()
            self.separator_menu()
            for index,menuentry in enumerate(self.cc.availablecc):
                self.index = index
                self.index = menu.addAction(str(menuentry[1]))
                self.index.triggered.connect(self.play_cast)
                self.index.setCheckable(True)
                if self.index.triggered.connect == True:
                    self.index.setChecked(True)
                    self.play_cast()
            self.separator_menu()
            self.stop_menu()
            self.resetaudio_menu()
            self.about_menu()
            self.exit_menu()

    def play_cast(self):
        self.cc.inp_cc()
        inputdev()
        outputdev()
        stream()
        self.cc.get_cc()
        self.cc.play_cast()

    def stop_cast(self):
        self.reset_audio()
        self.parent_pid = getpid()
        self.parent = psutil.Process(self.parent_pid)
        for child in self.parent.children(recursive=True):  # or parent.children() for recursive=False
            child.kill()
        if self.cc.cast != None:
            ncast = self.cc.cast
            self.cc.stop_cast()
            if os.path.exists('/tmp/mkcrhomecast.tmp') == True:
                os.remove('/tmp/mkcrhomecast.tmp')
            self.search_cast()
            self.stopped = True

    def reset_audio(self):
        inputint()
        outputint()

    def exit_all(self):
        if self.stopped == False:
            self.stop_cast()
        for child in self.parent.children(recursive=True):  # or parent.children() for recursive=False
            child.kill()
        app.quit()


def main():
    global menu
    global app

    menubar()
    app = QtWidgets.QApplication(sys.argv)
    if os.path.exists('images/google.icns') == True:
        icon = QtGui.QIcon('images/google.icns')
    else:
        icon = QtGui.QIcon('google.icns')

    tray = QtWidgets.QSystemTrayIcon(icon)

    menu = QtWidgets.QMenu()
    start = menubar()
    start.search_menu()
    start.separator_menu()
    start.populating_menu()
    start.separator_menu()
    start.stop_menu()
    start.resetaudio_menu()
    start.about_menu()
    start.exit_menu()

    tray.setContextMenu(menu)
    tray.show()
    app.exec_()

if __name__ == '__main__':
    if os.path.exists('/tmp/mkcrhomecast.tmp') == True:     #This is to verify that pickle tmp file exists
       os.remove('/tmp/mkcrhomecast.tmp')
    main()
