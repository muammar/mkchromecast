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

    if args.youtube == None and args.video == False:
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
            import mkchromecast.audio
            mkchromecast.audio.main()

    elif args.youtube == None and args.video == True:
        print('video')
        import mkchromecast.video
        mkchromecast.video.main()

    elif args.youtube == True and args.video == True:
        print('video')
        import mkchromecast.video
        mkchromecast.video.main()

    else: # When casting audio from youtube url, we do it through the audio module
        import mkchromecast.audio
        mkchromecast.audio.main()

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
            print(colors.options('Quit the application:')+' q or Ctrl-C')
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
                elif(key == '\x03'):
                    raise KeyboardInterrupt
                    atexit.register(terminateapp)
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
