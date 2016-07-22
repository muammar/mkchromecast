#!/usr/bin/env python

# This file is part of mkchromecast.

import mkchromecast.__init__
from mkchromecast.version import __version__
from mkchromecast.audiodevices import *
from mkchromecast.cast import *
from mkchromecast.pulseaudio import *
from mkchromecast.terminate import *
import os.path
import time
import atexit
import mkchromecast.colors as colors

platform = mkchromecast.__init__.platform

print(colors.bold('mkchromecast ')+'v'+__version__)

if args.tray == False:

    cc = casting()
    checkmktmp()
    writePidFile()

    if cc.ip == '127.0.0.1':        # We verify the local IP.
        print(colors.error('Your computer is not connected to any network'))
        terminate()

    if args.youtube == None:
        if platform == 'Linux':
            print('Creating pulseaudio sink...')
            print(colors.warning('Open pavucontrol and select the mkchromecast sink.'))
            create_sink()

        print(colors.important('Starting local streaming server'))
        print(colors.success('[Done]'))

        if args.encoder_backend == 'node' and platform == 'Darwin':
            from mkchromecast.node import *
            stream()

        backends = [
            'ffmpeg',
            'avconv',
            'parec'
            ]
        if args.encoder_backend in backends:
            import mkchromecast.ffmpeg
            mkchromecast.ffmpeg.main()
    else: # When casting youtube url, we do it throught the ffmpeg module
        import mkchromecast.ffmpeg
        mkchromecast.ffmpeg.main()

    cc.initialize_cast()

    if args.select_cc == True: # This is done for the case that -s is passed
        cc.sel_cc()
        cc.inp_cc()
        cc.get_cc()
        if platform == 'Darwin':
            print('Switching to soundflower...')
            inputdev()
            outputdev()
            print(colors.success('[Done]'))
        cc.play_cast()
    else:
        cc.get_cc()
        if platform == 'Darwin' and args.youtube == None:
            print('Switching to soundflower...')
            inputdev()
            outputdev()
            print(colors.success('[Done]'))
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
        from mkchromecast.getch import getch, pause

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
                    cc.volume_up()
                    if args.encoder_backend == 'ffmpeg':
                        if debug == True:
                            controls_msg()
                elif(key == 'd'):
                    cc.volume_down()
                    if args.encoder_backend == 'ffmpeg':
                        debug = mkchromecast.__init__.debug
                        if debug == True:
                            controls_msg()
                elif(key == 'q'):
                    print(colors.error('Quitting application...'))
                    terminateapp()
        except KeyboardInterrupt:
            terminateapp()

    else:
        if platform == 'Linux':
            print(colors.warning('Remember to open pavucontrol and select the mkchromecast sink.'))
        print('')
        print(colors.error('Ctrl-C to kill the application at any time'))
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
