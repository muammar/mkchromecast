#!/usr/bin/env python

# This file is part of mkchromecast.

# mkchromecast is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# mkchromecast is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with mkchromecast.  If not, see <http://www.gnu.org/licenses/>.

from __future__ import print_function
import time
import pychromecast

import socket

def cast():

    localip = socket.gethostbyname(socket.gethostname())

    listofcc = pychromecast.get_chromecasts_as_dict().keys()

    if len(listofcc) != 0:
        print(listofcc)
        # For the moments it casts to the first device in the list
        cast = pychromecast.get_chromecast(listofcc[0])
        # Wait for cast device to be ready
        cast.wait()
        print(cast.device)
        print(cast.status)
    else:
        print('No devices found!')
        exit()

    mc = cast.media_controller
    mc.play_media('http://'+localip+':3000/stream.mp3', 'audio/mpeg')
    print(mc.status)
    #mc.pause()
    #time.sleep(5)
    #mc.play()
