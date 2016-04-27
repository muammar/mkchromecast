#!/usr/bin/env python

# This file is part of mkchromecast.

from __future__ import print_function
import pychromecast
from mkchromecast.audiodevices import *
from mkchromecast.node import *
from mkchromecast.terminate import *
import atexit

print('Switching to soundflower')
inputdev()
outputdev()
stream()

import time
import pychromecast

pychromecast.get_chromecasts_as_dict().keys()

cast = pychromecast.get_chromecast(friendly_name="Harman Kardon")
cast.wait()
print(cast.device)

print(cast.status)

mc = cast.media_controller
mc.play_media('http://192.168.1.27:3000/stream.mp3', 'audio/mpeg')
print(mc.status)

print('Ctrl-c to kill the application')

def terminateapp():
    inputint()
    outputint()
