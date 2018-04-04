# This file is part of mkchromecast.

"""
Linux/MacOS build script for mkchromecast

MacOS usage:
    python3 setup.py py2app
    cp -R /usr/local/Cellar/qt5/5.6.0/plugins \
        dist/mkchromecast.app/Contents/PlugIns
    macdeployqt dist/mkchromecast.app

On MacOS you need to install using pip3 the following:

    bs4
    google

On Linux, this is a standard distutils script supporting

   python3 setup.py build
   python3 setup.py install

etc., with standard setup.py options. Note that there are some non-python
dependencies not listed here; see README.md.
"""
import os
import platform

from glob import glob
from setuptools import setup

exec(open('mkchromecast/version.py').read())

ROOT = os.path.dirname(__file__)
ROOT = ROOT if ROOT else '.'

LINUX_DATA = [
    ('share/mkchromecast/nodejs', glob('nodejs/*')),
    ('share/mkchromecast/images', glob('images/google*.png')),
    ('share/applications/', ['mkchromecast.desktop']),
    ('share/man/man1', ['mkchromecast.1']),
]
LINUX_REQUIRES = [
    'flask',
    'mutagen',
    'netifaces',
    'psutil',
    'PyChromecast',
    'PyQt5',
    'requests'
]
LINUX_CLASSIFIERS = [
    'Development Status :: 4 - Beta',
    'Intended Audience :: End Users/Desktop',
    'License :: OSI Approved :: MIT License',
    'Programming Language :: Python :: 3.6',
]

APP = ['start_tray.py']
APP_NAME = 'Mkchromecast'
DATA_FILES = ['bin/audiodevice', 'bin/mkchromecast', 'nodejs', 'notifier']
DATA_FILES.extend(glob('images/google*.icns'))

OPTIONS = {
    'argv_emulation': True,
        'prefer_ppc': True,
    'iconfile': 'images/google.icns',
    'includes': [
        'google',
        'sip',
        'PyQt5',
        'PyQt5.QtCore',
        'PyQt5.QtGui',
        'PyQt5.QtWidgets',
        'Flask',
        'configparser'
        ],
    'packages': ['requests'],
    'plist': {
        'CFBundleName': APP_NAME,
        'CFBundleDisplayName': APP_NAME,
        'CFBundleGetInfoString': 'Cast macOS audio to your Google cast devices and Sonos speakers',
        'CFBundleIdentifier': 'com.mkchromecast.osx',
        'CFBundleVersion': __version__,
        'CFBundleShortVersionString': __version__,
        'NSHumanReadableCopyright': u'Copyright (c) 2017, Muammar El Khatib, All Rights Reserved',
        'LSPrefersPPC': True,
        'LSUIElement': True
    }
}

if platform.system() == 'Darwin':
    setup(
        name=APP_NAME,
        app=APP,
        data_files=DATA_FILES,
        packages=['Mkchromecast'],
        platforms=['i386', 'x86_64'],
        options={'py2app': OPTIONS},
        setup_requires=['py2app'],
    )

elif platform.system() == 'Linux':
    setup(
        name='mkchromecast',
        version=__version__,
        description='Cast Linux audio or video to Google Cast devices',
        long_description=open(ROOT + '/README.md').read(),
        include_package_data=True,
        license='MIT',
        url='http://mkchromecast.com/',
        author='Muammar El Khatib',
        author_email='http://muammar.me/',
        keywords=['chromecast'],
        packages=['mkchromecast'],
        scripts=['bin/mkchromecast'],
        classifiers=LINUX_CLASSIFIERS,
        data_files=LINUX_DATA,
        requires=LINUX_REQUIRES
    )
