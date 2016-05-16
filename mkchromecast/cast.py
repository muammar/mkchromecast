#!/usr/bin/env python

# This file is part of mkchromecast.

from __future__ import print_function
from mkchromecast.__init__ import *
from mkchromecast.audiodevices import *
import mkchromecast.colors as colors
from mkchromecast.config import *
from mkchromecast.preferences import ConfigSectionMap
from mkchromecast.terminate import *
import time
import pychromecast
from pychromecast.dial import reboot
import socket
import os.path
import pickle
import subprocess
import mkchromecast.colors as colors
"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser # This is for Python3

class casting(object):
    def __init__(self): ## __init__ to call the self.ip
        import mkchromecast.__init__        # This is to verify against some needed variables
        self.platform = mkchromecast.__init__.platform
        self.tray = mkchromecast.__init__.tray
        self.backend = mkchromecast.__init__.backend
        if self.platform == 'Linux':
            hostname = subprocess.Popen(['hostname', '-I'], stdout=subprocess.PIPE)
            self.ip = hostname.stdout.read().decode('utf-8').strip()
        else:
            self.ip = socket.gethostbyname(socket.gethostname())

    def initialize_cast(self):
        from pychromecast import socket_client
        import mkchromecast.__init__        # This is to verify against some needed variables
        self.cclist = list(pychromecast.get_chromecasts_as_dict().keys())

        try:
            self.youtubeurl = mkchromecast.__init__.youtubeurl
        except AttributeError:
            self.youtubeurl = None

        if len(self.cclist) != 0 and args.select_cc == False:
            print (' ')
            print (colors.important('List of Google Cast devices available in your network:'))
            print (colors.important('------------------------------------------------------'))
            print (' ')
            print (colors.important('Index   Friendly name'))
            print (colors.important('=====   ============= '))
            for self.index,device in enumerate(self.cclist):
                print (str(self.index)+'      ', str(device))
            print (' ')
            print (colors.important('We will cast to first device in the list above!'))
            print (' ')
            self.castto = self.cclist[0]
            print (colors.success(self.castto))
            print (' ')

        elif len(self.cclist) != 0 and args.select_cc == True:
            if os.path.exists('/tmp/mkchromecast.tmp') == False:
                self.tf = open('/tmp/mkchromecast.tmp', 'wb')
                print (' ')
                print (colors.important('List of Google Cast devices available in your network:'))
                print (colors.important('------------------------------------------------------'))
                print (' ')
                print (colors.important('Index   Friendly name'))
                print (colors.important('=====   ============= '))
                self.availablecc=[]
                for self.index,device in enumerate(self.cclist):
                    print (str(self.index)+'      ',str(device))
                    toappend = [self.index,device]
                    self.availablecc.append(toappend)
                #print ('Array')
                #print (availablecc)

            else:
                self.tf = open('/tmp/mkchromecast.tmp', 'rb')
                self.index=pickle.load(self.tf)
                self.castto = self.cclist[int(self.index)]
                print (' ')
                print (colors.options('Casting to:')+' '+colors.success(self.castto))
                print (' ')

        elif len(self.cclist) != 0 and args.select_cc == False and self.tray == True:
                self.tf = open('/tmp/mkchromecast.tmp', 'rb')
                self.index=pickle.load(self.tf)
                self.castto = self.cclist[int(self.index)]
                print (' ')
                print (colors.options('Casting to:')+' '+colors.success(self.castto))

        elif len(self.cclist) == 0 and self.tray == False:
            print (colors.error('No devices found!'))
            if platform == 'Linux':
                import mkchromecast.pulseaudio
                mkchromecast.pulseaudio.remove_sink()
            else:
                inputint()
                outputint()
            terminate()
            exit()

        elif len(self.cclist) == 0 and self.tray == True:
            print (colors.error('No devices found!'))
            self.availablecc = []

    def sel_cc(self):
            print (' ')
            print ('Please, select the '+colors.important('Index')+' of the Google Cast device that you want to use:')
            self.index = input()

    def inp_cc(self):
            pickle.dump(self.index, self.tf)
            self.tf.close()
            self.castto = self.cclist[int(self.index)]
            print (' ')
            print (colors.options('Casting to:')+' '+colors.success(self.castto))
            print (' ')

    def get_cc(self):
            self.cast = pychromecast.get_chromecast(self.castto)
            # Wait for cast device to be ready
            self.cast.wait()
            print (' ')
            print (colors.important('Information about ')+' '+colors.success(self.castto))
            print (' ')
            print (self.cast.device)
            print (' ')
            print (colors.important('Status of device ')+' '+colors.success(self.castto))
            print (' ')
            print (self.cast.status)
            print (' ')

    def play_cast(self):
        localip = self.ip

        if platform == 'Darwin':
            self.host = socket.gethostbyname(self.castto+'.local')

        print (colors.options('The IP of ')+colors.success(self.castto)+colors.options(' is:')+' '+self.host)
        print (colors.options('Your local IP is:')+' '+localip)

        if self.youtubeurl != None:
            print (colors.options('The Youtube URL chosen:')+' '+self.youtubeurl)
            import pychromecast.controllers.youtube as youtube
            yt = youtube.YouTubeController()
            self.cast.register_handler(yt)

            try:
                import urlparse
                url_data = urlparse.urlparse(self.youtubeurl)
                query = urlparse.parse_qs(url_data.query)
            except ImportError:
                import urllib.parse
                url_data = urllib.parse.urlparse(self.youtubeurl)
                query = urllib.parse.parse_qs(url_data.query)
            video = query["v"][0]
            print (colors.options('Playing video:')+' '+video)
            yt.play_video(video)
        else:
            ncast = self.cast

            if self.tray == True:
                config = ConfigParser.RawConfigParser()
                configurations = config_manager()    # Class from mkchromecast.config
                configf = configurations.configf

                if os.path.exists(configf) and tray == True:
                    print (tray)
                    print(colors.warning('Configuration file exist'))
                    print(colors.warning('Using defaults set there'))
                    config.read(configf)
                    self.backend = ConfigSectionMap("settings")['backend']

            if self.backend == 'ffmpeg' or self.backend == 'avconv':
                import mkchromecast.ffmpeg
                mtype = mkchromecast.ffmpeg.mtype
                print (' ')
                print (colors.options('The media type string used is:')+' '+mtype)
                ncast.play_media('http://'+localip+':5000/stream', mtype)
            else:
                print (' ')
                print (colors.options('The media type string used is:')+' '+  'audio/mpeg')
                ncast.play_media('http://'+localip+':3000/stream.mp3', 'audio/mpeg')
            print (' ')
            print (colors.important('Cast media controller status'))
            print (' ')
            print (ncast.status)
            print (' ')

    def stop_cast(self):
        ncast = self.cast
        ncast.quit_app()

    def volume_up(self):
        """ Increment volume by 0.1 unless it is already maxed.
        Returns the new volume.
        """
        print ('Increasing volume...')
        print (' ')
        ncast = self.cast
        volume = round(ncast.status.volume_level, 1)
        return ncast.set_volume(volume + 0.1)

    def volume_down(self):
        """ Decrement the volume by 0.1 unless it is already 0.
        Returns the new volume.
        """
        print ('Decreasing volume...')
        print (' ')
        ncast = self.cast
        volume = round(ncast.status.volume_level, 1)
        return ncast.set_volume(volume - 0.1)

    def reboot(self):
        if platform == 'Darwin':
            self.host = socket.gethostbyname(self.castto+'.local')
            reboot(self.host)
        else:
            print (colors.error('This method is not supported in Linux yet.'))

