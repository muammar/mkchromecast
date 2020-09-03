#!/usr/bin/env python

# This file is part of mkchromecast.

from __future__ import print_function
import time
import pychromecast

cast = pychromecast.get_chromecast(friendly_name="CCA")
print("Connected to Chromecast")
mc = cast.media_controller
print("Playing BigBuckBunny.mp4 (video)")
mc.play_media(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "video/mp4",
)
time.sleep(15)
print("Stopping video and sleeping for 5 secs")
mc.stop()
time.sleep(5)
print("Playing Canon mp3 (audio)")
mc.play_media("http://www.stephaniequinn.com/Music/Canon.mp3", "audio/mp3")
time.sleep(15)
print("Stopping audio and quitting app")
mc.stop()
cast.quit_app()
