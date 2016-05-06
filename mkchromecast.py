#!/usr/bin/env python

# This file is part of mkchromecast.

import mkchromecast.__init__
from mkchromecast.version import __version__
from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from mkchromecast.terminate import *
import os.path, time
import atexit
import mkchromecast.colors as colors

platform = mkchromecast.__init__.platform

print('mkchromecast v'+__version__)

if args.tray == False:

    cc = casting()
    checkmktmp()
    writePidFile()

    if cc.ip == '127.0.0.1' or None:        # We verify the local IP.
        print (colors.error('Your computer is not connected to any network'))
        terminate()

    if args.youtube == None:
        if platform == 'Darwin':
            print('Switching to soundflower...')
            inputdev()
            outputdev()
            print(colors.success('[Done]'))
        else:
            print('Creating pulseaudio sink...')
            print('Open pavucontrol and select the mkchromecast sink.')
            from mkchromecast.pulseaudio import *
            create_sink()

        print(colors.important('Starting local streaming server'))
        print(colors.success('[Done]'))

        if args.encoder_backend == 'node' and platform == 'Darwin':
            from mkchromecast.node import *
            stream()

        if args.encoder_backend == 'ffmpeg':
            import mkchromecast.ffmpeg
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

    def terminateapp():
        cc.stop_cast()
        if platform == 'Darwin':
            inputint()
            outputint()
        else:
            remove_sink()
        terminate()
        return

    try:
        volumearg = mkchromecast.__init__.volumearg
    except AttributeError:
        volumearg = False

    if volumearg == True:
        try:
            from getch import getch, pause
        except ImportError:
            print ('You need to install the module py_getch to control the volume of your Google cast.')
            print (' ')
            volumearg = False

    if volumearg == True:
        def controls_msg():
            print('')
            print(colors.important('Controls:'))
            print(colors.important('========='))
            print('')
            print(colors.options('Volume up:')+' u')
            print(colors.options('Volume down:')+' d')
            print(colors.options('Quit the application:')+' q')
            print('')
            return
        controls_msg()
        try:
            while(True):
                key = getch()
                if(key == 'u'):
                    print('')
                    print('Increasing volume...')
                    cc.volume_up()
                    if args.encoder_backend == 'ffmpeg':
                        if debug == True:
                            controls_msg()
                elif(key == 'd'):
                    print('')
                    print('Decreasing volume...')
                    cc.volume_down()
                    if args.encoder_backend == 'ffmpeg':
                        debug = mkchromecast.__init__.debug
                        if debug == True:
                            controls_msg()
                elif(key == 'q'):
                    print('Quitting application...')
                    terminateapp()
        except KeyboardInterrupt:
            terminateapp()

    else:
        print('Ctrl-C to kill the application at any time')
        print('')
        try:
            input()
        except KeyboardInterrupt:
            atexit.register(terminateapp)
else:
    import mkchromecast.systray
    checkmktmp()
    writePidFile()
    mkchromecast.systray.main()
