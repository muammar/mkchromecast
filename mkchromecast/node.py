#!/usr/bin/env python

# This file is part of mkchromecast.

import mkchromecast.__init__
import subprocess
import multiprocessing
import time, sys, os, signal
from mkchromecast.audiodevices import *
import mkchromecast.colors as colors
from mkchromecast.cast import *
import psutil, pickle
from os import getpid
import os.path

"""
These functions are used to get up the streaming server using node.

To call them:
    from mkchromecast.node import *
    name()
"""

backend = mkchromecast.__init__.backend
rcodec = mkchromecast.__init__.rcodec
codec = mkchromecast.__init__.codec
bitrate = str(mkchromecast.__init__.bitrate)
samplerate = str(mkchromecast.__init__.samplerate)

try:
    youtubeurl = mkchromecast.__init__.youtubeurl
except AttributeError:
    youtubeurl = None

if youtubeurl == None:
    if backend == 'node' and rcodec != 'mp3':
        print (colors.error('Codec '+rcodec+' is not supported by the node server!'))
        print ('Using '+codec+' as default.')

    if backend == 'node':
        if int(bitrate) == 192:
            print (colors.options('Default bitrate used: ')+ bitrate+'k')
        elif int(bitrate) > 320:
                print (colors.warning('Maximum bitrate supported by '+codec+' is: ')+str(320)+'k')
                bitrate = '320'
                print ('Bitrate has been set to maximum!')
        else:
            print (colors.options('Selected bitrate: ')+bitrate+'k')

        if samplerate == '44100':
            print (colors.options('Default sample rate used: ')+ samplerate+'Hz')
        else:
            codecs_sr = ['mp3', 'ogg', 'aac', 'wav', 'flac']
            if codec in codecs_sr and int(samplerate) < 41000 and int(samplerate) > 36000:
                print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
                samplerate = '44100'
                print ('Sample rate has been set to default!')

            elif codec in codecs_sr and int(samplerate) < 36000 and int(samplerate) > 32000:
                print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
                samplerate = '32000'

            elif codec in codecs_sr and int(samplerate) < 32000 and int(samplerate) > 27050:
                print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
                samplerate = '32000'

            elif codec in codecs_sr and int(samplerate) < 27050 and int(samplerate) > 22000:
                print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
                samplerate = '22050'

            elif codec in codecs_sr and int(samplerate) > 41000:
                print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
                samplerate = '44800'
                print ('Sample rate has been set to maximum!')
            print ('Selected sample rate: ', samplerate+'Hz')

def streaming():
    if os.path.exists('./bin/node') == True:
        webcast = ['./bin/node', './nodejs/node_modules/webcast-osx-audio/bin/webcast.js', '-b', bitrate, '-s', samplerate]
    else:
        webcast = ['./nodejs/bin/node', './nodejs/node_modules/webcast-osx-audio/bin/webcast.js', '-b', bitrate, '-s', samplerate]
    p = subprocess.Popen(webcast)

    f = open('/tmp/mkcrhomecast.pid', 'rb')
    pidnumber=int(pickle.load(f))
    print ('PID of main process: ', pidnumber)

    localpid=getpid()
    print ('PID of streaming process: ', localpid)

    while p.poll() is None:
        try:
            time.sleep(0.5)
            if psutil.pid_exists(pidnumber) == False:   # With this I ensure that if the main app fails, everything
                inputint()                              # will get back to normal
                outputint()
                parent = psutil.Process(localpid)
                for child in parent.children(recursive=True):  # or parent.children() for recursive=False
                    child.kill()
                parent.kill()
        except KeyboardInterrupt:
            print ("Ctrl-c was requested")
            sys.exit(0)
        except IOError:
            print ("I/O Error")
            sys.exit(0)
        except OSError:
            print ("OSError")
            sys.exit(0)
    else:
        print ('Reconnecting streaming...')
        relaunch(stream,recasting,kill)
    return

class multi_proc(object):
    def __init__(self):
        self.proc = multiprocessing.Process(target=streaming)
        self.proc.daemon = False

    def start(self):
        self.proc.start()

def kill():
    pid=getpid()
    os.kill(pid, signal.SIGTERM)

def relaunch(func1,func2,func3):
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
