#!/usr/bin/env python

# This file is part of mkchromecast.

from __future__ import print_function
import time
import pychromecast

cast = pychromecast.get_chromecast(friendly_name="CCA")
mc = cast.media_controller
mc.play_media('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'video/mp4')
time.sleep(15)
mc.stop()
