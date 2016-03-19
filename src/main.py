#!/usr/bin/env python

from __future__ import print_function
import time
import pychromecast

import subprocess
import socket
localip = socket.gethostbyname(socket.gethostname())



#
#icetakestream = ['./nodejs/bin/streammachine-util-cmd', 'source', '--port', '8002', '--stream', 'test', '--password', 'testing', '/tmp/stream.mp3']
#subprocess.Popen(icetakestream)

listofcc = pychromecast.get_chromecasts_as_dict().keys()

print (listofcc)

cast = pychromecast.get_chromecast(friendly_name="Harman Kardon")
# Wait for cast device to be ready
cast.wait()
print(cast.device)

print(cast.status)


#soxcommand = ['sox', '-t', 'coreaudio', 'Soundflower (2ch)', '-q', '/tmp/stream.mp3']
#subprocess.Popen(soxcommand)
#
#mp3server = ['node', './mp3.js']
#subprocess.Popen(mp3server)
mc = cast.media_controller
mc.play_media('http://192.168.1.27:3000/stream.mp3', 'audio/mpeg')
print(mc.status)
#mc.pause()
#time.sleep(5)
#mc.play()
