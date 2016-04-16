#!/usr/bin/env python

# This file is part of mkchromecast.

from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from mkchromecast.ffmpeg import *
from mkchromecast.streaming import *
from mkchromecast.terminate import *
import mkchromecast.systray
import os.path

import atexit

if args.tray == False:

    cc = casting()
    checkmktmp()
    writePidFile()

    if cc.ip == '127.0.0.1' or None:        # We verify the local IP.
        print ('Your computer is not connected to any network')
        terminate()

    print('Switching to soundflower...')

    inputdev()
    outputdev()

    print('Done!')

    print('Starting local streaming server')
    if args.encoder_backend == 'node':
        stream()

    if args.encoder_backend == 'ffmpeg':
        mkchromecast.ffmpeg.main()

    cc.initialize_cast()

    if args.select_cc == True: # This is done for the case that -s is passed
        cc.sel_cc()
        cc.inp_cc()
        cc.get_cc()
        cc.play_cast()
    else:
        cc.get_cc()
        cc.play_cast()

    print('Ctrl-C to kill the application at any time')
    print('')

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
else:
    checkmktmp()
    writePidFile()
    mkchromecast.systray.main()
