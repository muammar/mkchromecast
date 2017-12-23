#!/usr/bin/env python

# This file is part of mkchromecast.
"""
These functions are used to get up the streaming server using node.

To call them:
    from mkchromecast.node import *
    name()
"""

import mkchromecast.__init__
from mkchromecast.audio_devices import inputint, outputint
import mkchromecast.colors as colors
from mkchromecast.cast import casting
from mkchromecast.config import config_manager
import mkchromecast.messages as msg
from mkchromecast.preferences import ConfigSectionMap
import subprocess
import multiprocessing
import time
import sys
import signal
import psutil
import pickle
import os
from os import getpid
import os.path
"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    # This is for Python3
    import configparser as ConfigParser


def streaming():
    """
    Configuration files
    """
    platform = mkchromecast.__init__.platform
    tray = mkchromecast.__init__.tray
    debug = mkchromecast.__init__.debug
    config = ConfigParser.RawConfigParser()
    # Class from mkchromecast.config
    configurations = config_manager()
    configf = configurations.configf

    if os.path.exists(configf) and tray is True:
        configurations.chk_config()
        print(colors.warning('Configuration file exists'))
        print(colors.warning('Using defaults set there'))
        config.read(configf)
        backend = ConfigSectionMap('settings')['backend']
        rcodec = ConfigSectionMap('settings')['codec']
        bitrate = ConfigSectionMap('settings')['bitrate']
        samplerate = ConfigSectionMap('settings')['samplerate']
        notifications = ConfigSectionMap('settings')['notifications']
    else:
        backend = mkchromecast.__init__.backend
        rcodec = mkchromecast.__init__.rcodec
        codec = mkchromecast.__init__.codec
        bitrate = str(mkchromecast.__init__.bitrate)
        samplerate = str(mkchromecast.__init__.samplerate)
        notifications = mkchromecast.__init__.notifications

    print(colors.options('Selected backend:') + ' ' + backend)

    if debug is True:
        print(':::node::: variables %s, %s, %s, %s, %s' %
              (backend, rcodec, bitrate, samplerate, notifications))

    try:
        youtubeurl = mkchromecast.__init__.youtubeurl
    except AttributeError:
        youtubeurl = None

    if youtubeurl is None:
        if backend == 'node' and rcodec != 'mp3':
            print(colors.warning('Codec ' +
                  rcodec + ' is not supported by the node server!'))
            print('Using ' + codec + ' as default.')

        if backend == 'node':
            if int(bitrate) == 192:
                print(colors.options('Default bitrate used:') +
                      ' ' + bitrate + 'k.')
            elif int(bitrate) > 500:
                    print(colors.warning('Maximum bitrate supported by ' +
                          codec + ' is:') + ' ' + str(500) + 'k.')
                    bitrate = '500'
                    print(colors.warning('Bitrate has been set to maximum!'))
            else:
                print(colors.options('Selected bitrate: ') + bitrate + 'k.')

            if samplerate == '44100':
                print(colors.options('Default sample rate used:') +
                      ' ' + samplerate + 'Hz.')
            else:
                codecs_sr = [
                    'mp3',
                    'ogg',
                    'aac',
                    'wav',
                    'flac'
                    ]

                '''
                The codecs below do not support 96000Hz
                '''
                no96k = [
                    'mp3',
                    'ogg'
                    ]

                if (codec in codecs_sr and int(samplerate) > 22000 and
                        int(samplerate) <= 27050):
                    samplerate = '22050'
                    msg.samplerate_no96(codec)

                if (codec in codecs_sr and int(samplerate) > 27050 and
                        int(samplerate) <= 32000):
                    samplerate = '32000'
                    msg.samplerate_no96(codec)

                elif (codec in codecs_sr and int(samplerate) > 32000 and
                        int(samplerate) <= 36000):
                    samplerate = '32000'
                    msg.samplerate_no96(codec)

                elif (codec in codecs_sr and int(samplerate) > 36000 and
                        int(samplerate) <= 43000):
                    samplerate = '44100'
                    msg.samplerate_no96(codec)
                    print(colors.warning('Sample rate has been set to \
                        default!'))

                elif (codec in codecs_sr and int(samplerate) > 43000 and
                        int(samplerate) <= 72000):
                    samplerate = '48000'
                    msg.samplerate_no96(codec)

                elif codec in codecs_sr and int(samplerate) > 72000:
                    if codec in no96k:
                        msg.samplerate_no96(codec)
                        samplerate = '48000'
                    print(colors.warning('Sample rate has been set to \
                        maximum!'))

                print(colors.options('Sample rate set to:') +
                      ' ' + samplerate + 'Hz.')

    """
    Node section
    """
    if os.path.exists('./bin/node') is True:
        webcast = [
            './bin/node',
            './nodejs/node_modules/webcast-osx-audio/bin/webcast.js',
            '-b',
            bitrate,
            '-s',
            samplerate,
            '-p',
            '5000',
            '-u',
            'stream'
            ]
    else:
        webcast = [
            './nodejs/bin/node',
            './nodejs/node_modules/webcast-osx-audio/bin/webcast.js',
            '-b',
            bitrate,
            '-s',
            samplerate,
            '-p',
            '5000',
            '-u',
            'stream'
            ]
    p = subprocess.Popen(webcast)
    if debug is True:
        print(':::node::: node command: %s.' % webcast)

    f = open('/tmp/mkchromecast.pid', 'rb')
    pidnumber = int(pickle.load(f))
    print(colors.options('PID of main process:') + ' ' + str(pidnumber))

    localpid = getpid()
    print(colors.options('PID of streaming process:') + ' ' + str(localpid))

    while p.poll() is None:
        try:
            time.sleep(0.5)
            # With this I ensure that if the main app fails, everything
            # will get back to normal
            if psutil.pid_exists(pidnumber) is False:
                inputint()
                outputint()
                parent = psutil.Process(localpid)
                # or parent.children() for recursive=False
                for child in parent.children(recursive=True):
                    child.kill()
                parent.kill()
        except KeyboardInterrupt:
            print('Ctrl-c was requested')
            sys.exit(0)
        except IOError:
            print('I/O Error')
            sys.exit(0)
        except OSError:
            print('OSError')
            sys.exit(0)
    else:
        print(colors.warning('Reconnecting node streaming...'))
        if platform == 'Darwin' and notifications == 'enabled':
            if os.path.exists('images/google.icns') is True:
                noticon = 'images/google.icns'
            else:
                noticon = 'google.icns'
        if debug is True:
            print(':::node::: platform, tray, notifications: %s, %s, %s.'
                  % (platform, tray, notifications))

        if (platform == 'Darwin' and tray is True and notifications ==
                'enabled'):
            reconnecting = [
                './notifier/terminal-notifier.app/Contents/MacOS/terminal-notifier',
                '-group',
                'cast',
                '-contentImage',
                noticon,
                '-title',
                'mkchromecast',
                '-subtitle',
                'node server failed',
                '-message',
                'Reconnecting...'
                ]
            subprocess.Popen(reconnecting)

            if debug is True:
                print(':::node::: reconnecting notifier command: %s.'
                      % reconnecting)
        relaunch(stream, recasting, kill)
    return


class multi_proc(object):
    def __init__(self):
        self.proc = multiprocessing.Process(target=streaming)
        self.proc.daemon = False

    def start(self):
        self.proc.start()


def kill():
    pid = getpid()
    os.kill(pid, signal.SIGTERM)
    return


def relaunch(func1, func2, func3):
    func1()
    func2()
    func3()
    return


def recasting():
    start = casting()
    start.initialize_cast()
    start.get_cc()
    start.play_cast()
    return


def stream():
    st = multi_proc()
    st.start()
