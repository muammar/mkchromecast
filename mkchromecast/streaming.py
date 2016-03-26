#!/usr/bin/env python

# This file is part of mkchromecast.

import subprocess
import multiprocessing
import time
import sys
from .cast import *
import psutil
import os
import signal

"""
These functions are used to get up the streaming server.

To call them:
    from mkchromecast.streaming import *
    name()
"""

def streaming():
    webcast = ['./bin/node', './nodejs/node_modules/webcast-osx-audio/bin/webcast.js']
    p = subprocess.Popen(webcast)
    while p.poll() is None:
        try:
            time.sleep(0.5)
        except KeyboardInterrupt:
            print ("Ctrl-c was requested")
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
