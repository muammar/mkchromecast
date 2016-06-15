#!/usr/bin/env python

# This file is part of mkchromecast. It is used to build the macOS app.

import mkchromecast.__init__
from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from mkchromecast.terminate import *
import os.path, time
import mkchromecast.systray

checkmktmp()
writePidFile()
mkchromecast.systray.main()
