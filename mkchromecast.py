#!/usr/bin/env python

# This file is part of mkchromecast.

from mkchromecast.audiodevices import *
from mkchromecast.streaming import *
from mkchromecast.cast import *
from mkchromecast.terminate import *
import atexit


cc = casting()

if cc.ip == '127.0.0.1' or None:        # We verify the local IP.
    print ('Your computer is not connected to any network')
    terminate()

print('Switching to soundflower')

inputdev()
outputdev()
stream()
cc.initialize_cast()
cc.get_cc()
cc.play_cast()

print('Ctrl-c to kill the application')

def terminateapp():
    cc.stop_cast()
    inputint()
    outputint()
    terminate()
    return

try:
    input()
except KeyboardInterrupt:
    atexit.register(terminateapp)
