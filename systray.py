#!/usr/bin/env python

# This file is part of mkchromecast.
# brew install pyqt5 --with-python --without-python3

from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from mkchromecast.streaming import *
import mkchromecast.worker
import pychromecast

from PyQt5 import QtCore, QtGui, QtWidgets
import signal
import os.path
from os import getpid
import psutil, pickle

from PyQt5.QtCore import QThread, QObject, pyqtSignal, pyqtSlot



class menubar(object):
    def __init__(self):
        self.cc = casting()
        signal.signal(signal.SIGINT, signal.SIG_DFL)
        self.cc.cast = None
        self.systray = True
        self.stopped = False

        self.obj = mkchromecast.worker.Worker()  # no parent!
        self.thread = QThread()  # no parent!
        self.obj.intReady.connect(self.onIntReady)
        self.obj.moveToThread(self.thread)
        self.obj.finished.connect(self.thread.quit)
        self.thread.started.connect(self.obj._search_cast_)

        self.app = QtWidgets.QApplication(sys.argv)

        if os.path.exists('images/google.icns') == True:
            icon = QtGui.QIcon('images/google.icns')
        else:
            icon = QtGui.QIcon('google.icns')

        self.tray = QtWidgets.QSystemTrayIcon(icon)

        self.menu = QtWidgets.QMenu()
        self.search_menu()
        self.separator_menu()
        self.populating_menu()
        self.separator_menu()
        self.stop_menu()
        self.resetaudio_menu()
        self.about_menu()
        self.exit_menu()

        self.tray.setContextMenu(self.menu)
        self.tray.show()
        self.app.exec_()

    def search_menu(self):
        self.SearchAction = self.menu.addAction("Search for Google cast devices")
        self.SearchAction.triggered.connect(self.search_cast)

    def stop_menu(self):
        self.StopCastAction = self.menu.addAction("Stop casting")
        self.StopCastAction.triggered.connect(self.stop_cast)

    def separator_menu(self):
        self.menu.addSeparator()

    def populating_menu(self):
        if self.SearchAction.triggered.connect == True:
            self.cast_list()

    def resetaudio_menu(self):
        self.ResetAudioAction = self.menu.addAction("Reset audio")
        self.ResetAudioAction.triggered.connect(self.reset_audio)

    def about_menu(self):
        self.AboutAction = self.menu.addAction("About")

    def exit_menu(self):
        exitAction = self.menu.addAction("Quit")
        exitAction.triggered.connect(self.exit_all)

    """
    These are methods for interacting with the mkchromecast objects
    """


#   def _search_cast_(self):
#       args.select_cc = True
#       if self.stopped == True and os.path.exists('/tmp/mkcrhomecast.tmp') == True:
#           os.remove('/tmp/mkcrhomecast.tmp')
#       self.cc.initialize_cast()
#       self.cast_list()

    def onIntReady(self, availablecc):
        print ('availablecc')
        self.availablecc = availablecc
        self.cast_list()

    def search_cast(self):
        args.select_cc = True
        if self.stopped == True and os.path.exists('/tmp/mkcrhomecast.tmp') == True:
            os.remove('/tmp/mkcrhomecast.tmp')
        self.thread.start()

    def cast_list(self):
        if len(self.availablecc) == 0:
            self.menu.clear()
            self.search_menu()
            self.separator_menu()
            self.NodevAction = self.menu.addAction("No devices found!")
            self.separator_menu()
            self.stop_menu()
            self.resetaudio_menu()
            self.about_menu()
            self.exit_menu()
        else:
            self.menu.clear()
            self.search_menu()
            self.separator_menu()
            print ('again', self.availablecc)
            for index, menuentry in enumerate(self.availablecc):
                self.entries = menuentry
                self.menuentry = self.menu.addAction(str(menuentry[1]))
                self.menuentry.triggered.connect(self.play_cast)
                self.menuentry.setCheckable(True)
            self.separator_menu()
            self.stop_menu()
            self.resetaudio_menu()
            self.about_menu()
            self.exit_menu()


    def play_cast(self):
        self.menuentry.setChecked(True)
        print ('yes')
        print self.entries[0], self.entries[1]
        self.index = self.entries[0]
        self.castto = self.entries[1]
        if os.path.exists('/tmp/mkcrhomecast.tmp') == True:
            self.tf = open('/tmp/mkcrhomecast.tmp', 'wb')
        pickle.dump(self.index, self.tf)
        self.tf.close()
        print(' ')
        print('Casting to: ', self.castto)
        print(' ')
        stream()
        self.cast = pychromecast.get_chromecast(self.castto)
        ## Wait for cast device to be ready
        self.cast.wait()
        #print(self.cast.device)
        #print(self.cast.status)
        inputdev()
        outputdev()
        localip = self.cc.ip
        #print (localip)
        self.ncast = self.cast
        self.ncast.play_media('http://'+localip+':3000/stream.mp3', 'audio/mpeg')
        print(self.ncast.status)

    def stop_cast(self):
        self.menuentry.setChecked(False)
        self.reset_audio()
        self.parent_pid = getpid()
        self.parent = psutil.Process(self.parent_pid)
        for child in self.parent.children(recursive=True):  # or parent.children() for recursive=False
            child.kill()
        if self.cc.cast != None:
            self.ncast.quit_app()
            if os.path.exists('/tmp/mkcrhomecast.tmp') == True:
                os.remove('/tmp/mkcrhomecast.tmp')
            self.search_cast()
            self.ncast.quit_app()
            self.stopped = True

    def reset_audio(self):
        inputint()
        outputint()

    def exit_all(self):
        if self.stopped == False:
            self.stop_cast()
        for child in self.parent.children(recursive=True):  # or parent.children() for recursive=False
            child.kill()
        self.app.quit()

def main():
    menubar()

if __name__ == '__main__':
    if os.path.exists('/tmp/mkcrhomecast.tmp') == True:     #This is to verify that pickle tmp file exists
       os.remove('/tmp/mkcrhomecast.tmp')
    main()
