#!/usr/bin/env python

# This file is part of mkchromecast.

import subprocess
import multiprocessing
import time, sys, os, signal
from .audiodevices import *
from .cast import *
import psutil, pickle

"""
These functions are used to get up the streaming server.

To call them:
    from mkchromecast.streaming import *
    name()
"""

def streaming():
    webcast = ['./bin/node', './nodejs/node_modules/webcast-osx-audio/bin/webcast.js']
    p = subprocess.Popen(webcast)

    f = open('/tmp/mkcrhomecast.pid', 'rb')
    pidnumber=int(pickle.load(f))
    print ('PID of streaming process: ', pidnumber)

    localpid=getpid()

    while p.poll() is None:
        try:
            time.sleep(0.5)
            if psutil.pid_exists(pidnumber) == False:   # With this if I ensure that if main app fails, everything
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
