#!/usr/bin/env python

# This file is part of mkchromecast.
# brew install pyqt5 --with-python --without-python3

from __future__ import division
import mkchromecast.__init__        # This is to verify against some needed variables
from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from mkchromecast.config import *
from mkchromecast.preferences import ConfigSectionMap
from mkchromecast.node import *
import mkchromecast.preferences
from mkchromecast.pulseaudio import *
import mkchromecast.tray_threading
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QThread, QObject, pyqtSignal, pyqtSlot, Qt
from PyQt5.QtWidgets import QWidget, QSlider, QLabel, QApplication, QMessageBox, QMainWindow
from PyQt5.QtGui import QPixmap
import pychromecast
from pychromecast.dial import reboot
import signal, os.path, psutil, pickle, subprocess, threading
from os import getpid
"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser # This is for Python3


platform = mkchromecast.__init__.platform
debug = mkchromecast.__init__.debug

class menubar(QtWidgets.QMainWindow):
    def __init__(self):
        self.cc = casting()
        signal.signal(signal.SIGINT, signal.SIG_DFL)
        self.cast = None
        self.stopped = False
        self.played = False
        self.read_config()

        """
        This is used when searching for cast devices
        """
        self.obj = mkchromecast.tray_threading.Worker()  # no parent!
        self.thread = QThread()  # no parent!

        self.obj.intReady.connect(self.onIntReady)
        self.obj.moveToThread(self.thread)
        self.obj.finished.connect(self.thread.quit)
        self.thread.started.connect(self.obj._search_cast_)

        """
        This is used when one clicks on cast device
        """
        self.objp = mkchromecast.tray_threading.Player()  # no parent!
        self.threadplay = QThread()  # no parent!

        self.objp.moveToThread(self.threadplay)
        self.objp.pcastready.connect(self.pcastready)
        self.objp.pcastfinished.connect(self.threadplay.quit)
        self.threadplay.started.connect(self.objp._play_cast_)

        """
        This is used when one clicks on the updater
        """
        self.objup = mkchromecast.tray_threading.Updater()  # no parent!
        self.threadupdater = QThread()  # no parent!

        self.objup.moveToThread(self.threadupdater)
        self.objup.updateready.connect(self.updateready)
        self.objup.upcastfinished.connect(self.threadupdater.quit)
        self.threadupdater.started.connect(self.objup._updater_)

        self.app = QtWidgets.QApplication(sys.argv)
        """
        This is to determine the scale factor.
        """
        screen_resolution = self.app.desktop().screenGeometry()
        self.width = screen_resolution.width()
        self.height = screen_resolution.height()
        if self.width > 1280:
            self.scale_factor = 2
        else:
            self.scale_factor = 1

        if debug == True:
            print(':::systray::: Screen resolution: ', self.width, self.height)
        self.app.setQuitOnLastWindowClosed(False) # This avoid the QMessageBox to close parent processes.
        if hasattr(QtCore.Qt, 'AA_UseHighDpiPixmaps'):
                    self.app.setAttribute(QtCore.Qt.AA_UseHighDpiPixmaps)
        self.w = QWidget()

        if os.path.exists('images/google.icns') == True:    # This is useful when launching from git repo
            self.icon = QtGui.QIcon()
            if platform == 'Darwin':
                self.icon.addFile('images/google.icns')
            else:
                self.icon.addFile('images/google.png')
        else:                                               # This is useful for applications
            self.icon = QtGui.QIcon()
            if platform == 'Linux':
                self.icon.addFile('/usr/share/mkchromecast/images/google.png')
            else:
                self.icon.addFile('google.icns')
        super(QtWidgets.QMainWindow,self).__init__()
        self.createUI()

    def createUI(self):
        self.tray = QtWidgets.QSystemTrayIcon(self.icon)
        self.menu = QtWidgets.QMenu()
        self.search_menu()
        self.separator_menu()
        self.populating_menu()
        self.separator_menu()
        self.stop_menu()
        self.volume_menu()
        self.resetaudio_menu()
        self.reboot_menu()
        self.separator_menu()
        self.preferences_menu()
        self.update_menu()
        self.about_menu()
        self.exit_menu()
        self.tray.setContextMenu(self.menu)
        self.tray.show()

        """
        This is for the search at launch
        """
        if self.searchatlaunch == 'enabled':
            self.search_cast()
            if platform == 'Darwin' and self.notifications == 'enabled':
                if os.path.exists('images/google.icns') == True:
                    noticon = 'images/google.icns'
                else:
                    noticon = 'google.icns'
                searching = ['./notifier/terminal-notifier.app/Contents/MacOS/terminal-notifier', '-group', 'cast', '-contentImage', noticon, '-title', 'mkchromecast', '-message', 'Searching for Cast Devices']
                subprocess.Popen(searching)
                if debug == True:
                    print(':::systray:::',searching)
            elif platform == 'Linux' and self.notifications == 'enabled':
                try:
                    import gi
                    gi.require_version('Notify', '0.7')
                    from gi.repository import Notify
                    Notify.init("mkchromecast")
                    found=Notify.Notification.new("mkchromecast", "Searching for Google cast devices!", "dialog-information")
                    found.show()
                except ImportError:
                    print('If you want to receive notifications in Linux, install  libnotify and python-gobject')
        """
        end
        """
        self.app.exec_()    #We start showing the system tray

    def read_config(self):
        """
        This is to load variables from configuration file
        """
        config = ConfigParser.RawConfigParser()
        configurations = config_manager()    # Class from mkchromecast.config
        configf = configurations.configf

        if os.path.exists(configf):
            print(colors.warning('Configuration file exist'))
            print(colors.warning('Using defaults set there'))
            config.read(configf)
            self.notifications = ConfigSectionMap("settings")['notifications']
            self.searchatlaunch = ConfigSectionMap("settings")['searchatlaunch']
        else:
            self.notifications = 'disabled'
            self.searchatlaunch = 'disabled'
            if debug == True:
                print(':::systray::: self.notifications '+self.notifications)
                print(':::systray::: self.searchatlaunch '+self.searchatlaunch)

    def search_menu(self):
        self.SearchAction = self.menu.addAction("Search For Google Cast Devices")
        self.SearchAction.triggered.connect(self.search_cast)

    def stop_menu(self):
        self.StopCastAction = self.menu.addAction("Stop Casting")
        self.StopCastAction.triggered.connect(self.stop_cast)

    def volume_menu(self):
        self.VolumeCastAction = self.menu.addAction("Volume")
        self.VolumeCastAction.triggered.connect(self.volume_cast)

    def separator_menu(self):
        self.menu.addSeparator()

    def populating_menu(self):
        if self.SearchAction.triggered.connect == True:
            self.cast_list()

    def resetaudio_menu(self):
        self.ResetAudioAction = self.menu.addAction("Reset Audio")
        self.ResetAudioAction.triggered.connect(self.reset_audio)

    def reboot_menu(self):
        self.rebootAction = self.menu.addAction("Reboot Cast Device")
        self.rebootAction.triggered.connect(self.reboot)

    def preferences_menu(self):
        self.preferencesAction = self.menu.addAction("Preferences...")
        self.preferencesAction.triggered.connect(self.preferences_show)

    def update_menu(self):
        self.updateAction = self.menu.addAction("Check for Updates...")
        self.updateAction.triggered.connect(self.update_show)

    def about_menu(self):
        self.AboutAction = self.menu.addAction("About mkchromecast")
        self.AboutAction.triggered.connect(self.about_show)

    def exit_menu(self):
        exitAction = self.menu.addAction("Quit")
        exitAction.triggered.connect(self.exit_all)

    """
    These are methods for interacting with the mkchromecast objects
    """

    def onIntReady(self, availablecc):
        print('availablecc received')
        self.availablecc = availablecc
        self.cast_list()

    def search_cast(self):
        if os.path.exists('images/google_working.icns') == True:
            if platform == 'Darwin':
                self.tray.setIcon(QtGui.QIcon('images/google_working.icns'))
            else:
                self.tray.setIcon(QtGui.QIcon('images/google_working.png'))
        else:
            if platform == 'Linux':
                self.tray.setIcon(QtGui.QIcon('/usr/share/mkchromecast/images/google_working.png'))
            else:
                self.tray.setIcon(QtGui.QIcon('google_working.icns'))

        """
        This catches the error caused by an empty .tmp file
        """
        if os.path.exists('/tmp/mkchromecast.tmp') == True:
            try:
                self.tf = open('/tmp/mkchromecast.tmp', 'rb')
                self.index=pickle.load(self.tf)
            except EOFError:
                os.remove('/tmp/mkchromecast.tmp')

        if self.stopped == True and os.path.exists('/tmp/mkchromecast.tmp') == True:
            os.remove('/tmp/mkchromecast.tmp')

        self.thread.start()

    def cast_list(self):

        if os.path.exists('images/google.icns') == True:
            if platform == 'Darwin':
                self.tray.setIcon(QtGui.QIcon('images/google.icns'))
            else:
                self.tray.setIcon(QtGui.QIcon('images/google.png'))
        else:
            if platform == 'Linux':
                self.tray.setIcon(QtGui.QIcon('/usr/share/mkchromecast/images/google.png'))
            else:
                self.tray.setIcon(QtGui.QIcon('google.icns'))

        if len(self.availablecc) == 0:
            self.menu.clear()
            self.search_menu()
            self.separator_menu()
            self.NodevAction = self.menu.addAction("No Cast Devices Found.")
            if os.path.exists('images/google_nodev.icns') == True:
                if platform == 'Darwin':
                    self.tray.setIcon(QtGui.QIcon('images/google_nodev.icns'))
                else:
                    self.tray.setIcon(QtGui.QIcon('images/google_nodev.png'))
            else:
                if platform == 'Linux':
                    self.tray.setIcon(QtGui.QIcon('/usr/share/mkchromecast/images/google_nodev.png'))
                else:
                    self.tray.setIcon(QtGui.QIcon('google_nodev.icns'))

            self.separator_menu()
            self.stop_menu()
            self.volume_menu()
            self.resetaudio_menu()
            self.reboot_menu()
            self.separator_menu()
            self.preferences_menu()
            self.update_menu()
            self.about_menu()
            self.exit_menu()
        else:
            self.read_config()
            if platform == 'Darwin' and self.notifications == 'enabled':
                if os.path.exists('images/google.icns') == True:
                    noticon = 'images/google.icns'
                else:
                    noticon = 'google.icns'
                found = ['./notifier/terminal-notifier.app/Contents/MacOS/terminal-notifier', '-group', 'cast', '-contentImage', noticon, '-title', 'mkchromecast', '-message', 'Cast devices found']
                subprocess.Popen(found)
                if debug == True:
                    print(':::systray:::',found)
            elif platform == 'Linux' and self.notifications == 'enabled':
                try:
                    import gi
                    gi.require_version('Notify', '0.7')
                    from gi.repository import Notify
                    Notify.init("mkchromecast")
                    found=Notify.Notification.new("mkchromecast", "Google cast devices found!", "dialog-information")
                    found.show()
                except ImportError:
                    print('If you want to receive notifications in Linux, install  libnotify and python-gobject')
            self.menu.clear()
            self.search_menu()
            self.separator_menu()
            print('Available Google Cast devices', self.availablecc)
            for index, menuentry in enumerate(self.availablecc):
                self.entries = menuentry
                self.menuentry = self.menu.addAction(str(menuentry[1]))
                self.menuentry.triggered.connect(self.play_cast)
                self.menuentry.setCheckable(True)
            self.separator_menu()
            self.stop_menu()
            self.volume_menu()
            self.resetaudio_menu()
            self.reboot_menu()
            self.separator_menu()
            self.preferences_menu()
            self.update_menu()
            self.about_menu()
            self.exit_menu()

    def pcastready(self, message):
        print('pcastready ?', message)
        if message == '_play_cast_ success':
            self.pcastfailed = False
            if os.path.exists('/tmp/mkchromecast.tmp') == True:
                self.cast = mkchromecast.tray_threading.cast
                self.ncast = self.cast
            if os.path.exists('images/google.icns') == True:
                if platform == 'Darwin':
                    self.tray.setIcon(QtGui.QIcon('images/google.icns'))
                else:
                    self.tray.setIcon(QtGui.QIcon('images/google.png'))
            else:
                if platform == 'Linux':
                    self.tray.setIcon(QtGui.QIcon('/usr/share/mkchromecast/images/google.png'))
                else:
                    self.tray.setIcon(QtGui.QIcon('google.icns'))
        else:
            self.pcastfailed = True
            if os.path.exists('images/google_nodev.icns') == True:
                if platform == 'Darwin':
                    self.tray.setIcon(QtGui.QIcon('images/google_nodev.icns'))
                else:
                    self.tray.setIcon(QtGui.QIcon('images/google_nodev.png'))
            else:
                if platform == 'Linux':
                    self.tray.setIcon(QtGui.QIcon('/usr/share/mkchromecast/images/google_nodev.png'))
                else:
                    self.tray.setIcon(QtGui.QIcon('google_nodev.icns'))
            self.stop_cast()
            pass                # This should stop the play process when there is an error in the threading _play_cast_

    def play_cast(self):
        if self.played == True:
            self.kill_child()
        self.menuentry.setChecked(True)
        if os.path.exists('images/google_working.icns') == True:
            if platform == 'Darwin':
                self.tray.setIcon(QtGui.QIcon('images/google_working.icns'))
            else:
                self.tray.setIcon(QtGui.QIcon('images/google_working.png'))
        else:
            if platform == 'Linux':
                self.tray.setIcon(QtGui.QIcon('/usr/share/mkchromecast/images/google_working.png'))
            else:
                self.tray.setIcon(QtGui.QIcon('google_working.icns'))

        print(self.entries[0], self.entries[1])
        self.index = self.entries[0]
        self.castto = self.entries[1]
        while True:
            try:
                if os.path.exists('/tmp/mkchromecast.tmp') == True:
                    self.tf = open('/tmp/mkchromecast.tmp', 'wb')
                pickle.dump(self.index, self.tf)
                self.tf.close()
            except ValueError:
                continue
            break
        self.played = True
        self.threadplay.start()

    def stop_cast(self):
        if self.stopped == False:
            pass

        if self.cast != None or self.stopped == True or self.pcastfailed == True:
            try:
                self.ncast.quit_app()
            except AttributeError:
                pass
            self.menuentry.setChecked(False)
            self.reset_audio()
            try:
                self.kill_child()
            except psutil.NoSuchProcess:
                pass
            checkmktmp()
            self.search_cast()
            while True:     # This is to retry when stopping and pychromecast.error.NotConnected raises.
                try:
                    self.ncast.quit_app()
                except pychromecast.error.NotConnected:
                    continue
                except AttributeError:
                    continue
                break
            self.stopped = True
            self.read_config()
            if platform == 'Darwin' and self.notifications == 'enabled':
                if self.pcastfailed == True:
                    stop = ['./notifier/terminal-notifier.app/Contents/MacOS/terminal-notifier', '-group', 'cast', '-title', 'mkchromecast', '-message', 'Casting process failed. Try again...']
                else:
                    stop = ['./notifier/terminal-notifier.app/Contents/MacOS/terminal-notifier', '-group', 'cast', '-title', 'mkchromecast', '-message', 'Cast stopped!']
                subprocess.Popen(stop)
                if debug == True:
                    print(':::systray::: stop', stop)
            elif platform == 'Linux' and self.notifications == 'enabled':
                try:
                    import gi
                    gi.require_version('Notify', '0.7')
                    from gi.repository import Notify
                    Notify.init("mkchromecast")
                    if self.pcastfailed == True:
                        stop=Notify.Notification.new("mkchromecast", "Casting process failed. Try again...", "dialog-information")
                    else:
                        stop=Notify.Notification.new("mkchromecast", "Cast stopped!", "dialog-information")
                    stop.show()
                except ImportError:
                    print('If you want to receive notifications in Linux, install  libnotify and python-gobject')

    def volume_cast(self):
        self.maxvolset = 40
        self.sl = QtWidgets.QSlider(Qt.Horizontal)
        self.sl.setMinimum(0)
        self.sl.setMaximum(self.maxvolset)
        self.sl.setGeometry(30*self.scale_factor, 40*self.scale_factor, 260*self.scale_factor, 70*self.scale_factor)
        self.sl.setWindowFlags(QtCore.Qt.WindowStaysOnTopHint)
        try:
            self.sl.setValue(round((self.ncast.status.volume_level*self.maxvolset), 1))
        except AttributeError:
            self.sl.setValue(2)
        self.sl.valueChanged.connect(self.valuechange)
        self.sl.setWindowTitle("Google Cast Volume")
        self.sl.show()

        """
        self.sl = QSlider(Qt.Horizontal, self)
        self.sl.setMinimum(0)
        self.sl.setMaximum(10)
        #self.sl.setFocusPolicy(Qt.NoFocus)
        self.sl.setGeometry(30, 40, 180, 20)
        try:
            self.sl.setValue(round((self.ncast.status.volume_level*10), 1))
        except AttributeError:
            self.sl.setValue(2)
        self.sl.valueChanged.connect(self.valuechange)

        #self.label = QLabel(self)
        #self.label.setPixmap(QPixmap('images/max.png'))
        #self.label.setGeometry(160, 40, 80, 30)

        self.setGeometry(300, 300, 240, 100)
        self.setWindowTitle('Google cast volume')
        self.show()
        """

    def valuechange(self, value):
        try:
            if round(self.ncast.status.volume_level, 1) == 1:
                print (colors.warning(':::systray::: Maximum volume level reached!'))
                volume = value/self.maxvolset
                self.ncast.set_volume(volume)
            else:
                volume = value/self.maxvolset
                self.ncast.set_volume(volume)
            if debug == True:
                print(':::systray::: Volume set to: '+str(volume))
        except AttributeError:
            pass
        if debug == True:
            print(':::systray::: Volume changed: '+str(value))

    def reset_audio(self):
        if platform == 'Darwin':
            inputint()
            outputint()
        else:
            remove_sink()

    def reboot(self):
        if platform == 'Darwin':
            try:
                self.host = socket.gethostbyname(self.castto+'.local')
                print('Cast device IP: '+str(self.host))
                reboot(self.host)
                self.reset_audio()
                self.stop_cast()
            except AttributeError:
                pass    # I should add a notification here
        else:
            try:
                self.host = self.cast.host
                print('Cast device IP: '+str(self.host))
                reboot(self.host)
                self.reset_audio()
                self.stop_cast()
            except AttributeError:
                pass    # I should add a notification here

    def preferences_show(self):
        self.p = mkchromecast.preferences.preferences(self.scale_factor)
        self.p.show()

    def updateready(self, message):
        print('update ready ?', message)
        updaterBox = QMessageBox()
        updaterBox.setWindowFlags(QtCore.Qt.WindowStaysOnTopHint)
        updaterBox.setIcon(QMessageBox.Information)
        updaterBox.setTextFormat(Qt.RichText)   # This option let you write rich text in pyqt5.
        if message == 'None':
            updaterBox.setText("No network connection detected!")
            updaterBox.setInformativeText("""Verify that your computer is connected to your router, and try again.""")
        elif message == 'False':
            updaterBox.setText("<b>Your installation is up-to-date!</b>")
            updaterBox.setInformativeText("<b>mkchromecast</b> v"+mkchromecast.__init__.__version__+" is currently the newest version available.")
        else:
            updaterBox.setText("New version of mkchromecast available!")
            if platform == 'Darwin':
                downloadurl = "<a href='https://github.com/muammar/mkchromecast/releases/download/"+message+"/mkchromecast_v"+message+".dmg'>"
            elif platform == 'Linux':
                downloadurl = "<a href='http://github.com/muammar/mkchromecast/releases/latest'>"
            if debug == True:
                print("Download URL:", downloadurl)
            updaterBox.setInformativeText("You can "+downloadurl+"download it by clicking here</a>.")
        updaterBox.setStandardButtons(QMessageBox.Ok)
        updaterBox.exec_()

    def update_show(self):
        self.threadupdater.start()

    def about_show(self):
        msgBox = QMessageBox()
        msgBox.setWindowFlags(QtCore.Qt.WindowStaysOnTopHint)
        msgBox.setText("""<center><img src="images/google.png" height="98" width="128" align="middle">
                <br>
                <br>
                <b>mkchromecast</b> v"""+mkchromecast.__init__.__version__)
        msgBox.setInformativeText("""
        <p align='center'>
        <a href="http://mkchromecast.com/">Visit mkchromecast's website.</a>
        <br>
        <br>
        <br>
        Created by: Muammar El Khatib.
        <br>
        <br>
        UX design: Claudia Vargas.
        <br>
        <br>
        <br>
        Copyright 2016 Muammar El Khatib.
        <br>
        <br>
        This program comes with absolutely no warranty.
        <br>
        See the <a href="https://github.com/muammar/mkchromecast/blob/master/LICENSE">MIT license</a> for details.
        </p>
                """)
        msgBox.setStandardButtons(QMessageBox.Ok)
        msgBox.exec_()

    def kill_child(self):       # Not a beautiful name, I know...
        self.parent_pid = getpid()
        self.parent = psutil.Process(self.parent_pid)
        for child in self.parent.children(recursive=True):  # or parent.children() for recursive=False
            child.kill()

    def exit_all(self):
        if self.cast == None and self.stopped == False:
            self.app.quit()
        elif self.stopped == True or self.cast != None:
            #self.stop_cast() # This was duplicated.
            self.kill_child()
            self.stop_cast()
            self.app.quit()
        else:
            self.app.quit()

def main():
    menubar()

if __name__ == '__main__':
    checkmktmp()
    main()
