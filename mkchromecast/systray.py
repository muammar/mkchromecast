#!/usr/bin/env python

# This file is part of mkchromecast.
# brew install pyqt5 --with-python --without-python3

from __future__ import division
import mkchromecast.__init__
from mkchromecast.audio_devices import inputint, outputint
from mkchromecast.cast import casting
from mkchromecast.config import config_manager
from mkchromecast.preferences import ConfigSectionMap
import mkchromecast.preferences
import mkchromecast.colors as colors
from mkchromecast.pulseaudio import remove_sink
from mkchromecast.utils import del_tmp
import mkchromecast.tray_threading
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QThread, Qt
from PyQt5.QtWidgets import QWidget, QMessageBox
import pychromecast
import socket
from pychromecast.dial import reboot
import signal
import os.path
import psutil
import pickle
import subprocess
from os import getpid
import sys
"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser

"""
urllib is imported differently in Python3
"""
try:
    from urllib.request import urlopen
except ImportError:
    from urllib2 import urlopen

platform = mkchromecast.__init__.platform
debug = mkchromecast.__init__.debug


class menubar(QtWidgets.QMainWindow):
    def __init__(self):
        self.cc = casting()
        signal.signal(signal.SIGINT, signal.SIG_DFL)
        self.cast = None
        self.stopped = False
        self.played = False
        self.pcastfailed = False
        self.read_config()

        """
        These dictionaries are used to set icons' colors
        """
        self.google = {
                'black': 'google',
                'blue': 'google_b',
                'white': 'google_w'
                }
        self.google_working = {
                'black': 'google_working',
                'blue': 'google_working_b',
                'white': 'google_working_w'
                }
        self.google_nodev = {
                'black': 'google_nodev',
                'blue': 'google_nodev_b',
                'white': 'google_nodev_w'
                }

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
        if self.height > 1280:
            self.scale_factor = 2
        else:
            self.scale_factor = 1

        if debug is True:
            print(':::systray::: Screen resolution: ', self.width, self.height)
        # This avoid the QMessageBox to close parent processes.
        self.app.setQuitOnLastWindowClosed(False)

        if hasattr(QtCore.Qt, 'AA_UseHighDpiPixmaps'):
            self.app.setAttribute(QtCore.Qt.AA_UseHighDpiPixmaps)
            if debug is True:
                print(':::systray::: High-DPI screen detected...')

        self.w = QWidget()

        # This is useful when launching from git repo
        if os.path.exists('images/' +
                          self.google[self.colors] + '.icns') is True:
            self.icon = QtGui.QIcon()
            if platform == 'Darwin':
                self.icon.addFile(
                    'images/' +
                    self.google[self.colors] +
                    '.icns'
                    )
            else:
                self.icon.addFile(
                    'images/' +
                    self.google[self.colors] +
                    '.png'
                    )
        else:
            self.icon = QtGui.QIcon()
            if platform == 'Linux':
                self.icon.addFile(
                    '/usr/share/mkchromecast/images/' +
                    self.google[self.colors] +
                    '.png'
                    )
            else:
                self.icon.addFile(self.google[self.colors] +
                                  '.icns')
        super(QtWidgets.QMainWindow, self).__init__()
        self.createUI()

    def createUI(self):
        self.tray = QtWidgets.QSystemTrayIcon(self.icon)
        self.menu = QtWidgets.QMenu()
        self.ag = QtWidgets.QActionGroup(self, exclusive=True)
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
        self.app.exec_()    # We start showing the system tray

    def read_config(self):
        """
        This is to load variables from configuration file
        """
        config = ConfigParser.RawConfigParser()
        configurations = config_manager()    # Class from mkchromecast.config
        configf = configurations.configf

        if os.path.exists(configf):
            print(colors.warning('Configuration file exists'))
            print(colors.warning('Using defaults set there'))
            config.read(configf)
            self.notifications = ConfigSectionMap('settings')['notifications']
            self.searchatlaunch = ConfigSectionMap('settings')[
                    'searchatlaunch']
            self.colors = ConfigSectionMap('settings')['colors']
        else:
            self.notifications = 'disabled'
            self.searchatlaunch = 'disabled'
            self.colors = 'black'
            if debug is True:
                print(':::systray::: self.notifications '+self.notifications)
                print(':::systray::: self.searchatlaunch '+self.searchatlaunch)
                print(':::systray::: self.colors '+self.colors)

    def search_menu(self):
        self.SearchAction = self.menu.addAction('Search For Media '
                                                'Streaming Devices')
        self.SearchAction.triggered.connect(self.search_cast)

    def stop_menu(self):
        self.StopCastAction = self.menu.addAction('Stop Streaming')
        self.StopCastAction.triggered.connect(self.stop_cast)

    def volume_menu(self):
        self.VolumeCastAction = self.menu.addAction('Volume')
        self.VolumeCastAction.triggered.connect(self.volume_cast)

    def separator_menu(self):
        self.menu.addSeparator()

    def populating_menu(self):
        if self.SearchAction.triggered.connect is True:
            self.cast_list()

    def resetaudio_menu(self):
        self.ResetAudioAction = self.menu.addAction('Reset Audio')
        self.ResetAudioAction.triggered.connect(self.reset_audio)

    def reboot_menu(self):
        self.rebootAction = self.menu.addAction('Reboot Streaming Device')
        self.rebootAction.triggered.connect(self.reboot)

    def preferences_menu(self):
        self.preferencesAction = self.menu.addAction('Preferences...')
        self.preferencesAction.triggered.connect(self.preferences_show)

    def update_menu(self):
        self.updateAction = self.menu.addAction('Check For Updates...')
        self.updateAction.triggered.connect(self.update_show)

    def about_menu(self):
        self.AboutAction = self.menu.addAction('About Mkchromecast')
        self.AboutAction.triggered.connect(self.about_show)

    def exit_menu(self):
        exitAction = self.menu.addAction('Quit')
        exitAction.triggered.connect(self.exit_all)

    """
    These are methods for interacting with the mkchromecast objects
    """

    def onIntReady(self, availablecc):
        print('availablecc received')
        self.availablecc = availablecc
        self.cast_list()

    def set_icon_working(self):
        """docstring for fnamicon_working"""
        if self.notifications == 'enabled':
            self.search_notification()
        if os.path.exists('images/' +
                          self.google_working[self.colors]+'.icns') is True:
            if platform == 'Darwin':
                self.tray.setIcon(
                    QtGui.QIcon(
                        'images/' +
                        self.google_working[self.colors] +
                        '.icns'
                        )
                    )
            else:
                self.tray.setIcon(
                    QtGui.QIcon(
                        'images/' +
                        self.google_working[self.colors] +
                        '.png'
                        )
                    )
        else:
            if platform == 'Linux':
                self.tray.setIcon(
                    QtGui.QIcon(
                        '/usr/share/mkchromecast/images/' +
                        self.google_working[self.colors] +
                        '.png'
                        )
                    )
            else:
                self.tray.setIcon(
                    QtGui.QIcon(
                        self.google_working[self.colors] +
                        '.icns'
                        )
                    )

    def set_icon_idle(self):
        """docstring for icon_idle"""
        if os.path.exists('images/'+self.google[self.colors]+'.icns') is True:
            if platform == 'Darwin':
                self.tray.setIcon(
                    QtGui.QIcon(
                        'images/' +
                        self.google[self.colors] +
                        '.icns'
                        )
                    )
            else:
                self.tray.setIcon(
                    QtGui.QIcon(
                        'images/' +
                        self.google[self.colors] +
                        '.png'
                        )
                    )
        else:
            if platform == 'Linux':
                self.tray.setIcon(
                    QtGui.QIcon(
                        '/usr/share/mkchromecast/images/' +
                        self.google[self.colors] +
                        '.png'
                        )
                    )
            else:
                self.tray.setIcon(
                    QtGui.QIcon(
                        self.google[self.colors] +
                        '.icns'
                        )
                    )

    def set_icon_nodev(self):
        """docstring for set_ic"""
        if os.path.exists('images/' +
                          self.google_nodev[self.colors]+'.icns') is True:
            if platform == 'Darwin':
                self.tray.setIcon(
                    QtGui.QIcon(
                        'images/' +
                        self.google_nodev[self.colors] +
                        '.icns'
                        )
                    )
            else:
                self.tray.setIcon(
                    QtGui.QIcon(
                        'images/' +
                        self.google_nodev[self.colors] +
                        '.png'
                        )
                    )
        else:
            if platform == 'Linux':
                self.tray.setIcon(
                    QtGui.QIcon(
                        '/usr/share/mkchromecast/images/' +
                        self.google_nodev[self.colors] +
                        '.png'
                        )
                    )
            else:
                self.tray.setIcon(
                    QtGui.QIcon(
                        self.google_nodev[self.colors] +
                        '.icns'
                        )
                    )

    def search_cast(self):
        self.read_config()
        self.set_icon_working()
        """
        This catches the error caused by an empty .tmp file
        """
        if os.path.exists('/tmp/mkchromecast.tmp') is True:
            try:
                self.tf = open('/tmp/mkchromecast.tmp', 'rb')
                self.index = pickle.load(self.tf)
            except EOFError:
                os.remove('/tmp/mkchromecast.tmp')

        if (self.stopped is True and
           os.path.exists('/tmp/mkchromecast.tmp') is True):
            os.remove('/tmp/mkchromecast.tmp')

        self.thread.start()

    def cast_list(self):
        self.set_icon_idle()

        if len(self.availablecc) == 0:
            self.menu.clear()
            self.search_menu()
            self.separator_menu()
            self.NodevAction = self.menu.addAction(
                    'No Streaming Devices Found.')
            self.set_icon_nodev()

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
                if os.path.exists('images/' +
                   self.google[self.colors]+'.icns') is True:
                    noticon = 'images/'+self.google[self.colors]+'.icns'
                else:
                    noticon = self.google[self.colors]+'.icns'

                found = [
                    './notifier/terminal-notifier.app/Contents/MacOS/terminal-notifier',
                    '-group',
                    'cast',
                    '-contentImage',
                    noticon,
                    '-title',
                    'Mkchromecast',
                    '-message',
                    'Media Streaming Devices Found!'
                    ]
                subprocess.Popen(found)
                if debug is True:
                    print(':::systray:::', found)
            elif platform == 'Linux' and self.notifications == 'enabled':
                try:
                    import gi
                    gi.require_version('Notify', '0.7')
                    from gi.repository import Notify
                    Notify.init('Mkchromecast')
                    found = Notify.Notification.new(
                        'Mkchromecast',
                        'Media Streaming Devices Found!',
                        'dialog-information'
                        )
                    found.show()
                except ImportError:
                    print('If you want to receive notifications in Linux, '
                          'install libnotify and python-gobject')
            self.menu.clear()
            self.search_menu()
            self.separator_menu()
            print('Available Media Streaming Devices', self.availablecc)
            for index, menuentry in enumerate(self.availablecc):
                try:
                    self.a = self.ag.addAction(
                            (QtWidgets.QAction(
                                str(menuentry[1]), self, checkable=True)))
                    self.menuentry = self.menu.addAction(self.a)
                except UnicodeEncodeError:
                    self.menuentry = self.menu.addAction(str(
                        unicode(menuentry[1]).encode("utf-8")))
                # The receiver is a lambda function that passes clicked as
                # a boolean, and the clicked_item as an argument to the
                # self.clicked_cc() method. This last method, sets the correct
                # index and name of the chromecast to be used by
                # self.play_cast(). Credits to this question in stackoverflow:
                #
                # http://stackoverflow.com/questions/1464548/pyqt-qmenu-dynamically-populated-and-clicked
                receiver = lambda clicked, clicked_item=menuentry: self.clicked_cc(clicked_item)
                self.a.triggered.connect(receiver)
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

    def clicked_cc(self, clicked_item):
        if self.played is True:
            try:
                self.cast.quit_app()
            except AttributeError:
                self.cast.stop()

        if debug is True:
            print(':::tray::: clicked item: %s.' % clicked_item)
        self.index = clicked_item[0]
        self.cast_to = clicked_item[1]
        self.play_cast()

    def pcastready(self, message):
        print('pcastready ?', message)
        if message == '_play_cast_ success':
            self.pcastfailed = False
            if os.path.exists('/tmp/mkchromecast.tmp') is True:
                self.cast = mkchromecast.tray_threading.cast

            self.set_icon_idle()
        else:
            self.pcastfailed = True
            self.set_icon_nodev()
            self.stop_cast()
            # This should stop the play process when there is an error in the
            # threading _play_cast_
            pass

    def play_cast(self):
        if self.played is True:
            self.kill_child()

        self.set_icon_working()

        while True:
            try:
                if os.path.exists('/tmp/mkchromecast.tmp') is True:
                    self.tf = open('/tmp/mkchromecast.tmp', 'wb')
                pickle.dump(self.cast_to, self.tf)
                self.tf.close()
            except ValueError:
                continue
            break
        self.played = True
        self.threadplay.start()

    def stop_cast(self):
        if self.stopped is False:
            pass

        if (self.cast is not None or self.stopped is True or self.pcastfailed
           is True):
            try:
                self.cast.quit_app()
            except AttributeError:
                # This is for sonos. The thing is that if we are at this point,
                # user requested an stop or cast failed.
                self.cast.stop()
            self.reset_audio()

            try:
                self.kill_child()
            except psutil.NoSuchProcess:
                pass
            mkchromecast.__init__.checkmktmp()
            self.search_cast()

            # This is to retry when stopping and
            # pychromecast.error.NotConnected raises.
            while True:
                try:
                    self.cast.quit_app()
                except pychromecast.error.NotConnected:
                    continue
                except AttributeError:
                    # This is for sonos. The thing is that if we are at this
                    # point, user requested an stop or cast failed.
                    self.cast.stop()
                break

            self.stopped = True
            self.read_config()

            if platform == 'Darwin' and self.notifications == 'enabled':
                if self.pcastfailed is True:
                    stop = [
                        './notifier/terminal-notifier.app/Contents/MacOS/terminal-notifier',
                        '-group',
                        'cast',
                        '-title',
                        'Mkchromecast',
                        '-message',
                        'Streaming Process Failed. Try Again...'
                        ]
                else:
                    stop = [
                        './notifier/terminal-notifier.app/Contents/MacOS/terminal-notifier',
                        '-group',
                        'cast',
                        '-title',
                        'Mkchromecast',
                        '-message',
                        'Streaming Stopped!'
                        ]
                subprocess.Popen(stop)
                if debug is True:
                    print(':::systray::: stop', stop)

            elif platform == 'Linux' and self.notifications == 'enabled':
                try:
                    import gi
                    gi.require_version('Notify', '0.7')
                    from gi.repository import Notify
                    Notify.init('Mkchromecast')
                    if self.pcastfailed is True:
                        stop = Notify.Notification.new(
                            'Mkchromecast',
                            'Streaming Process Failed. Try Again...',
                            'dialog-information'
                            )
                    else:
                        stop = Notify.Notification.new(
                            'Mkchromecast',
                            'Streaming Stopped!',
                            'dialog-information'
                            )
                    stop.show()
                except ImportError:
                    print('If you want to receive notifications in Linux, '
                          'install  libnotify and python-gobject')

    def volume_cast(self):
        self.sl = QtWidgets.QSlider(Qt.Horizontal)
        self.sl.setMinimum(0)
        self.sl.setGeometry(
                30 * self.scale_factor,
                40 * self.scale_factor,
                260 * self.scale_factor,
                70 * self.scale_factor
                )
        self.sl.setWindowFlags(QtCore.Qt.WindowStaysOnTopHint)
        try:
            self.maxvolset = 100
            self.sl.setMaximum(self.maxvolset)
            self.sl.setValue(round((self.cast.status.volume_level*self.maxvolset),
                             1))
        except AttributeError:
            self.maxvolset = 100
            self.sl.setMaximum(self.maxvolset)
            if self.played is False:
                self.sl.setValue(2)
            else:
                try:
                    self.sl.setValue(self.cast.volume)
                except:
                    pass
        self.sl.valueChanged.connect(self.value_changed)
        self.sl.setWindowTitle('Device Volume')
        self.sl.show()

    def value_changed(self, value):
        try:
            """
            Chromecast volume
            """
            volume = value/self.maxvolset
            self.cast.set_volume(volume)
            if round(self.cast.status.volume_level, 1) == 1:
                print(colors.warning(
                    ':::systray::: Maximum volume level reached!'))

            if debug is True:
                print(':::systray::: Volume set to: '+str(volume))
        except AttributeError:
            pass

        try:
            """
            Sonos volume
            """
            self.maxvolset = 100
            volume = value
            self.cast.volume = volume
            self.cast.play()
            if (self.cast.volume) == 100:
                print(colors.warning(':::systray::: Maximum volume reached!'))

            if debug is True:
                print(':::systray::: Volume set to: '+str(volume))
        except AttributeError:
            pass

        if debug is True:
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
                self.cast.host_ = socket.gethostbyname(self.cast_to + '.local')
                print('Cast device IP: '+str(self.cast.host_))
                self.reset_audio()
                self.stop_cast()
                reboot(self.cast.host_)
            except socket.gaierror:
                print('Cast device IP: '+str(self.cast.host))
                self.reset_audio()
                self.stop_cast()
                reboot(self.cast.host)
            except AttributeError:
                # FIXME I should add a notification here
                pass
        else:
            try:
                print('Cast device IP: %s' % str(self.cast.host))
                self.reset_audio()
                self.stop_cast()
                reboot(self.cast.host)
            except AttributeError:
                self.reset_audio()
                self.stop_cast()
                try:
                    for device in self.availablecc:
                        if self.cast_to in device:
                            ip = device[3]
                            print('Sonos device IP: %s' % str(ip))
                    url = 'http://' + ip + ':1400/reboot'
                    urlopen(url).read()
                except AttributeError:
                    pass

    def preferences_show(self):
        self.p = mkchromecast.preferences.preferences(self.scale_factor)
        self.p.show()

    def updateready(self, message):
        print('update ready ?', message)
        updaterBox = QMessageBox()
        updaterBox.setWindowFlags(QtCore.Qt.WindowStaysOnTopHint)
        updaterBox.setIcon(QMessageBox.Information)
        # This option let you write rich text in pyqt5.
        updaterBox.setTextFormat(Qt.RichText)
        if message == 'None':
            updaterBox.setText('No network connection detected!')
            updaterBox.setInformativeText("""
                    Verify that your computer is connected to your router,
                    and try again.""")
        elif message == 'False':
            updaterBox.setText('<b>Your installation is up-to-date!</b>')
            updaterBox.setInformativeText(
                '<b>Mkchromecast</b> v' +
                mkchromecast.__init__.__version__ +
                ' is currently the newest version available.'
                )
        elif message == 'error1':
            updaterBox.setText('Problems connecting to remote file server!')
            updaterBox.setInformativeText("""Try again later.""")
        else:
            updaterBox.setText('New version of Mkchromecast available!')
            if platform == 'Darwin':
                download = (
                    '<a href="https://github.com/muammar/mkchromecast/releases/download/' +
                    message +
                    '/mkchromecast_v' +
                    message +
                    '.dmg">'
                    )
            elif platform == 'Linux':
                download = '<a href="http://github.com/muammar/mkchromecast/releases/latest">'
            if debug is True:
                print('Download URL:', download)
            updaterBox.setInformativeText(
                'You can ' +
                download +
                'download it by clicking here</a>.'
                )
        updaterBox.setStandardButtons(QMessageBox.Ok)
        updaterBox.exec_()

    def update_show(self):
        self.threadupdater.start()

    def about_show(self):
        msgBox = QMessageBox()
        msgBox.setWindowFlags(QtCore.Qt.WindowStaysOnTopHint)
        # This is useful when launching from git repo
        if os.path.exists('images/google.icns') is True:
            if platform is 'Darwin':
                self.about_icon = 'images/google.icns'
            else:
                self.about_icon = 'images/google.png'
        # This is useful for applications
        else:
            if platform is 'Linux':
                self.about_icon = '/usr/share/mkchromecast/images/google.png'
            else:
                self.about_icon = 'google.icns'

        msgsettext = (
            '<center><img src="' +
            self.about_icon +
            '" "height="98" width="128" align="middle"> <br> <br>' +
            ' <b>Mkchromecast</b> v' +
            mkchromecast.__init__.__version__
            )
        msgBox.setText(msgsettext)
        msgBox.setInformativeText("""
        <p align='center'>
        <a href="http://mkchromecast.com/">Visit Mkchromecast's website.</a>
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
        Copyright (c) 2017, Muammar El Khatib.
        <br>
        <br>
        This program comes with absolutely no warranty.
        <br>
        See the
        <a href=
        "https://github.com/muammar/mkchromecast/blob/master/LICENSE.rst">
        MIT license</a> for details.
        </p>
                """)
        msgBox.exec_()

    def kill_child(self):       # Not a beautiful name, I know...
        self.parent_pid = getpid()
        self.parent = psutil.Process(self.parent_pid)
        # or parent.children() for recursive=False
        for child in self.parent.children(recursive=True):
            child.kill()

    def exit_all(self):
        del_tmp()
        if self.cast is None and self.stopped is False:
            self.app.quit()
        elif self.stopped is True or self.cast is not None:
            self.kill_child()
            self.stop_cast()
            self.app.quit()
        else:
            self.app.quit()

    """
    Notifications
    """
    def search_notification(self):
        if platform is 'Darwin' and self.notifications is 'enabled':
            if os.path.exists('images/' +
                              self.google[self.colors] +
                              '.icns') is True:
                noticon = (
                    'images/' +
                    self.google[self.colors] +
                    '.icns'
                    )
            else:
                noticon = (
                    self.google[self.colors] +
                    '.icns'
                    )
            searching = [
                './notifier/terminal-notifier.app/Contents/MacOS/terminal-notifier',
                '-group',
                'cast',
                '-contentImage',
                noticon,
                '-title',
                'Mkchromecast',
                '-message',
                'Searching for Media Streaming Devices...'
                ]
            subprocess.Popen(searching)
            if debug is True:
                print(':::systray:::', searching)
        elif platform == 'Linux' and self.notifications == 'enabled':
            try:
                import gi
                gi.require_version('Notify', '0.7')
                from gi.repository import Notify
                Notify.init('Mkchromecast')
                found = Notify.Notification.new(
                    'Mkchromecast',
                    'Searching for Media Streaming Devices...',
                    'dialog-information'
                    )
                found.show()
            except ImportError:
                print('If you want to receive notifications in Linux, '
                      'install libnotify and python-gobject.')


def main():
    menubar()

if __name__ == '__main__':
    mkchromecast.__init__.checkmktmp()
    main()
