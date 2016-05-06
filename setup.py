#!/usr/bin/env python

# This file is part of mkchromecast.

"""
py2app build script for MyApplication

Usage:
    python3 setup.py py2app --packages=PyQt5
    cp -R /usr/local/Cellar/qt5/5.6.0/plugins dist/mkchromecast.app/Contents/PlugIns
    macdeployqt dist/mkchromecast.app

"""
from setuptools import setup


version = '0.2.3'

APP = ['start_tray.py']
APP_NAME = "mkchromecast"
DATA_FILES = ['images/google.icns', 'images/google_working.icns', 'bin/audiodevice', 'nodejs']

OPTIONS = {
    'argv_emulation': True,
    'iconfile': 'images/google.icns',
    'includes': ['google', 'sip', 'PyQt5', 'PyQt5.QtCore', 'PyQt5.QtGui', 'PyQt5.QtWidgets'],
    'plist': {
        'CFBundleName': APP_NAME,
        'CFBundleDisplayName': APP_NAME,
        'CFBundleGetInfoString': "Cast mac os x audio to your google cast devices",
        'CFBundleIdentifier': "com.mkchromecast.osx",
        'CFBundleVersion': version,
        'CFBundleShortVersionString': version,
        'NSHumanReadableCopyright': u"Copyright (c) 2016, Muammar El Khatib, All Rights Reserved"
    }
}

setup(
    name=APP_NAME,
    app=APP,
    data_files=DATA_FILES,
    package='mkchromecast',
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
