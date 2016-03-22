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

import subprocess
import threading
import time
import sys

"""
These functions are used to get up the streaming server.

To call them:
    from mkchromecast.streaming import *
    name()
"""

def stream():
    def launch_server():
        webcast = ['./bin/node', './nodejs/node_modules/webcast-osx-audio/bin/webcast.js']
        p = subprocess.Popen(webcast)
        while p.poll() is None:
            try:
                time.sleep(0.5)
            except KeyboardInterrupt:
                print ("Ctrl-c was requested")
                sys.exit(0)

        else:
                launch_server()
    thread = threading.Thread(target=launch_server)
    thread.start()
    return
