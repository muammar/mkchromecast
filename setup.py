#!/usr/bin/env python

# This file is part of mkchromecast.

"""
py2app build script for mkchromecast

Usage:
    python3 setup.py py2app
    cp -R /usr/local/Cellar/qt5/5.6.0/plugins dist/mkchromecast.app/Contents/PlugIns
    macdeployqt dist/mkchromecast.app

You need to install using pip3 the following:

    bs4
    google
"""
from setuptools import setup

version=open("mkchromecast/version.py").readlines()[-1].split()[-1].strip("\"'")

APP = ['start_tray.py']
APP_NAME = "mkchromecast"
DATA_FILES = ['images/google.icns', 'images/google_working.icns', 'images/google_nodev.icns', 'bin/audiodevice', 'nodejs', 'notifier']

OPTIONS = {
    'argv_emulation': True,
        'prefer_ppc': True,
    'iconfile': 'images/google.icns',
    'includes': ['google', 'sip', 'PyQt5', 'PyQt5.QtCore', 'PyQt5.QtGui', 'PyQt5.QtWidgets', 'Flask', 'configparser'],
    'plist': {
        'CFBundleName': APP_NAME,
        'CFBundleDisplayName': APP_NAME,
        'CFBundleGetInfoString': "Cast Mac OS X audio to your Google cast devices",
        'CFBundleIdentifier': "com.mkchromecast.osx",
        'CFBundleVersion': version,
        'CFBundleShortVersionString': version,
        'NSHumanReadableCopyright': u"Copyright (c) 2016, Muammar El Khatib, All Rights Reserved",
        'LSPrefersPPC': True
    }
}

setup(
    name=APP_NAME,
    app=APP,
    data_files=DATA_FILES,
    package='mkchromecast',
    platforms=['i386', 'x86_64'],
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
