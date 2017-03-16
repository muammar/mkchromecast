#!/usr/bin/env python

# This file is part of mkchromecast.

import mkchromecast.__init__
from mkchromecast.version import __version__
from mkchromecast.audio_devices import *
from mkchromecast.cast import *
import mkchromecast.colors as colors
from mkchromecast.pulseaudio import *
from mkchromecast.terminate import *
import subprocess
import os.path
import time
import atexit

platform = mkchromecast.__init__.platform
adevice = mkchromecast.__init__.adevice
ccname = mkchromecast.__init__.ccname
videoarg = mkchromecast.__init__.videoarg
youtubeurl = mkchromecast.__init__.youtubeurl

print(colors.bold('mkchromecast ')+'v'+__version__)

if args.tray == False:

    cc = casting()
    checkmktmp()
    writePidFile()

    if cc.ip == '127.0.0.1':        # We verify the local IP.
        print(colors.error('Your computer is not connected to any network'))
        terminate()
    elif cc.ip != '127.0.0.1' and args.discover == True:
        cc.initialize_cast()
        terminate()

    if youtubeurl == None and videoarg == False and args.source_url == None:
        if platform == 'Linux' and adevice == None:
            print('Creating pulseaudio sink...')
            print(colors.warning('Open pavucontrol and select the mkchromecast sink.'))
            create_sink()

        print(colors.important('Starting local streaming server'))
        print(colors.success('[Done]'))

        if args.encoder_backend == 'node' and platform == 'Darwin' and args.source_url == None:
            from mkchromecast.node import *
            stream()

        backends = [
            'ffmpeg',
            'avconv',
            'parec',
            'gstreamer'
            ]
        if args.encoder_backend in backends and args.source_url == None:
            import mkchromecast.audio
            mkchromecast.audio.main()

    elif youtubeurl == None and videoarg == True:
        print('video')
        import mkchromecast.video
        mkchromecast.video.main()

    elif youtubeurl != None and videoarg == True:
        print('video')
        import mkchromecast.video
        mkchromecast.video.main()

    elif youtubeurl != None and videoarg == False: # When casting youtube url, we do it throught the audio module
        import mkchromecast.audio
        mkchromecast.audio.main()

    cc.initialize_cast()

    if args.select_cc == True: # This is done for the case that -s is passed
        cc.sel_cc()
        cc.inp_cc()
        cc.get_cc()
        if platform == 'Darwin' and args.source_url == None and videoarg == False:
            print('Switching to soundflower...')
            inputdev()
            outputdev()
            print(colors.success('[Done]'))
        cc.play_cast()
    else:
        cc.get_cc()
        if platform == 'Darwin' and youtubeurl == None and args.source_url == None and videoarg == False:
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
        elif platform == 'Linux' and adevice == None:
            remove_sink()
        terminate()
        return

    try:
        control = mkchromecast.__init__.control
    except AttributeError:
        control = False

    if control == True:
        from mkchromecast.getch import getch, pause

        def controls_msg():
            print('')
            print(colors.important('Controls:'))
            print(colors.important('========='))
            print('')
            print(colors.options(           'Volume up:')+' u')
            print(colors.options(         'Volume down:')+' d')
            if videoarg == True:
                print(colors.options(       'Pause casting:')+' p')
                print(colors.options(      'Resume casting:')+' r')
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
                elif(key == 'p'):
                    if videoarg == True:
                        print('Pausing casting process...')
                        subprocess.call(['pkill', '-STOP', '-f', 'ffmpeg'])
                        if args.encoder_backend == 'ffmpeg':
                            debug = mkchromecast.__init__.debug
                            if debug == True:
                                controls_msg()
                    else:
                        pass
                elif(key == 'r'):
                    if videoarg == True:
                        print('Resuming casting process...')
                        subprocess.call(['pkill', '-CONT', '-f', 'ffmpeg'])
                        if args.encoder_backend == 'ffmpeg':
                            debug = mkchromecast.__init__.debug
                            if debug == True:
                                controls_msg()
                    else:
                        pass
                elif(key == 'q'):
                    print(colors.error('Quitting application...'))
                    terminateapp()
                elif(key == '\x03'):
                    raise KeyboardInterrupt
                    atexit.register(terminateapp)
        except KeyboardInterrupt:
            terminateapp()

    else:
        if platform == 'Linux' and adevice == None:
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
