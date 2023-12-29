#!/usr/bin/env python

# This file is part of mkchromecast. It is used to build the macOS app.
from mkchromecast.utils import checkmktmp, writePidFile
import mkchromecast.systray

# TODO(xsdg): This should go through mkchromecast and shouldn't be a separate
# entrypoint.
checkmktmp()
writePidFile()
mkchromecast.systray.main()
