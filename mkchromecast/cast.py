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
    def __init__(self):                     # __init__ to call the self.ip
        import mkchromecast.__init__        # This is to verify against some needed variables
        self.platform = mkchromecast.__init__.platform
        self.tray = mkchromecast.__init__.tray
        self.select_cc = mkchromecast.__init__.select_cc
        self.debug = mkchromecast.__init__.debug
        self.backend = mkchromecast.__init__.backend

        if self.platform == 'Linux':
            self.getnetworkip()
            try:
                self.ip = self.discovered_ip
            except AttributeError:
                self.ip = '127.0.0.1'
        else:
            try:
                self.ip = socket.gethostbyname(socket.gethostname())
                if self.debug == True:
                    print(':::cast::: sockets method', self.ip)
            except socket.gaierror:
                self.netifaces_ip()
                try:
                    self.ip = self.discovered_ip
                except AttributeError:
                    self.ip = '127.0.0.1'

    """
    Methods to discover local IP
    """
    def getnetworkip(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        s.connect(('<broadcast>', 0))
        self.discovered_ip = s.getsockname()[0]
        if self.debug == True:
            print(':::cast::: sockets method', self.discovered_ip)

    def netifaces_ip(self):
        import netifaces
        interfaces = netifaces.interfaces()
        for interface in interfaces:
            if interface == 'lo':
                continue
            iface = netifaces.ifaddresses(interface).get(netifaces.AF_INET)
            if iface != None and iface[0]['addr'] != '127.0.0.1':
                for e in iface:
                    self.discovered_ip = str(e['addr'])
                    if self.debug == True:
                        print(':::cast::: netifaces method', self.discovered_ip)

    """
    Cast processes
    """
    def initialize_cast(self):
        import mkchromecast.__init__            # This is to verify against some needed variables.
        from pychromecast import socket_client  # This fixes the `No handlers could be found for logger "pychromecast.socket_client` warning"`.
                                                # See commit 18005ebd4c96faccd69757bf3d126eb145687e0d.
        self.cclist = list(pychromecast.get_chromecasts_as_dict().keys())
        if self.debug == True:
            print('self.cclist', self.cclist)

        """
        This block was used for casting youtube with pychromecast, but it does not work
        """
        """
        try:
            self.youtubeurl = mkchromecast.__init__.youtubeurl
        except AttributeError:
            self.youtubeurl = None
        """

        if len(self.cclist) != 0 and self.select_cc == False:
            if self.debug == True:
                print('if len(self.cclist) != 0 and self.select_cc == False:')
            print(' ')
            print(colors.important('List of Google Cast devices available in your network:'))
            print(colors.important('------------------------------------------------------'))
            print(' ')
            print(colors.important('Index   Friendly name'))
            print(colors.important('=====   ============= '))
            for self.index,device in enumerate(self.cclist):
                try:
                    print(str(self.index)+'      ', str(device))
                except UnicodeEncodeError:
                    print(str(self.index)+'      ', str(unicode(device).encode("utf-8")))
            print(' ')
            print(colors.important('We will cast to first device in the list above!'))
            print(' ')
            self.castto = self.cclist[0]
            print(colors.success(self.castto))
            print(' ')

        elif len(self.cclist) != 0 and self.select_cc == True and self.tray == False:
            if self.debug == True:
                print('elif len(self.cclist) != 0 and self.select_cc == True and self.tray == False:')
            if os.path.exists('/tmp/mkchromecast.tmp') == False:
                self.tf = open('/tmp/mkchromecast.tmp', 'wb')
                print(' ')
                print(colors.important('List of Google Cast devices available in your network:'))
                print(colors.important('------------------------------------------------------'))
                print(' ')
                print(colors.important('Index   Friendly name'))
                print(colors.important('=====   ============= '))
                self.availablecc()
                """
                self.availablecc=[]
                for self.index,device in enumerate(self.cclist):
                    print(str(self.index)+'      ',str(device))
                    toappend = [self.index,device]
                    self.availablecc.append(toappend)
                """
            else:
                if self.debug == True:
                    print('else:')
                self.tf = open('/tmp/mkchromecast.tmp', 'rb')
                self.index=pickle.load(self.tf)
                self.castto = self.cclist[int(self.index)]
                print(' ')
                print(colors.options('Casting to:')+' '+colors.success(self.castto))
                print(' ')

        elif len(self.cclist) != 0 and self.select_cc == True and self.tray == True:
            if self.debug == True:
                print('elif len(self.cclist) != 0 and self.select_cc == True and self.tray == True:')
            if os.path.exists('/tmp/mkchromecast.tmp') == False:
                self.tf = open('/tmp/mkchromecast.tmp', 'wb')
                print(' ')
                print(colors.important('List of Google Cast devices available in your network:'))
                print(colors.important('------------------------------------------------------'))
                print(' ')
                print(colors.important('Index   Friendly name'))
                print(colors.important('=====   ============= '))
                self.availablecc()
                """
                self.availablecc=[]
                for self.index,device in enumerate(self.cclist):
                    print(str(self.index)+'      ',str(device))
                    toappend = [self.index,device]
                    self.availablecc.append(toappend)
                """
            else:
                if self.debug == True:
                    print('else:')
                self.tf = open('/tmp/mkchromecast.tmp', 'rb')
                self.index=pickle.load(self.tf)
                self.castto = self.cclist[int(self.index)]
                self.availablecc()
                print(' ')
                print(colors.options('Casting to:')+' '+colors.success(self.castto))
                print(' ')

        elif len(self.cclist) == 0 and self.tray == False:
            if self.debug == True:
                print('elif len(self.cclist) == 0 and self.tray == False:')
            print(colors.error('No devices found!'))
            if self.platform == 'Linux':
                from mkchromecast.pulseaudio import remove_sink
                remove_sink()
            else:
                inputint()
                outputint()
            terminate()
            exit()

        elif len(self.cclist) == 0 and self.tray == True:
            print(colors.error(':::Tray::: No devices found!'))
            self.availablecc = []

    def sel_cc(self):
        print(' ')
        print('Please, select the '+colors.important('Index')+' of the Google Cast device that you want to use:')
        self.index = input()

    def inp_cc(self):
        while True:
            try:
                pickle.dump(self.index, self.tf)
                self.tf.close()
                self.castto = self.cclist[int(self.index)]
                print(' ')
                print(colors.options('Casting to:')+' '+colors.success(self.castto))
                print(' ')
            except IndexError:
                checkmktmp()
                self.tf = open('/tmp/mkchromecast.tmp', 'wb')
                self.sel_cc()
                continue
            break

    def get_cc(self):
        if self.debug == True:
            print('def get_cc(self):')
        try:
            self.cast = pychromecast.get_chromecast(friendly_name=self.castto)
            # Wait for cast device to be ready
            self.cast.wait()
            print(' ')
            print(colors.important('Information about ')+' '+colors.success(self.castto))
            print(' ')
            print(self.cast.device)
            print(' ')
            print(colors.important('Status of device ')+' '+colors.success(self.castto))
            print(' ')
            print(self.cast.status)
            print(' ')
        except pychromecast.error.NoChromecastFoundError:
            print(colors.error('No Chromecasts matching filter critera were found!'))
            if self.platform == 'Darwin':
                inputint()
                outputint()
            elif self.platform == 'Linux':
                from mkchromecast.pulseaudio import remove_sink
                remove_sink()
            if self.tray == False:  # In the case that the tray is used, we don't kill the application
                print(colors.error('Finishing the application...'))
                terminate()
                exit()
            else:
                self.stop_cast()

    def play_cast(self):
        if self.debug == True:
            print('def play_cast(self):')
        localip = self.ip
        #if platform == 'Darwin':
        #   self.host = socket.gethostbyname(self.castto+'.local')
        self.host = self.cast.host

        print(colors.options('The IP of ')+colors.success(self.castto)+colors.options(' is:')+' '+self.host)
        print(colors.options('Your local IP is:')+' '+localip)

        """
        if self.youtubeurl != None:
            print(colors.options('The Youtube URL chosen:')+' '+self.youtubeurl)
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
            print(colors.options('Playing video:')+' '+video)
            yt.play_video(video)
        else:
        """
        ncast = self.cast

        if self.tray == True:
            config = ConfigParser.RawConfigParser()
            configurations = config_manager()    # Class from mkchromecast.config
            configf = configurations.configf

            if os.path.exists(configf) and self.tray == True:
                print(tray)
                print(colors.warning('Configuration file exist'))
                print(colors.warning('Using defaults set there'))
                config.read(configf)
                self.backend = ConfigSectionMap('settings')['backend']

        if self.backend == 'ffmpeg' or self.backend == 'avconv' or self.backend == 'parec':
            import mkchromecast.audio
            mtype = mkchromecast.audio.mtype
            print(' ')
            print(colors.options('The media type string used is:')+' '+mtype)
            ncast.play_media('http://'+localip+':5000/stream', mtype)
        else:
            print(' ')
            print(colors.options('The media type string used is:')+' '+  'audio/mpeg')
            ncast.play_media('http://'+localip+':3000/stream.mp3', 'audio/mpeg')
        print(' ')
        print(colors.important('Cast media controller status'))
        print(' ')
        print(ncast.status)
        print(' ')

    def stop_cast(self):
        ncast = self.cast
        ncast.quit_app()

    def volume_up(self):
        """ Increment volume by 0.1 unless it is already maxed.
        Returns the new volume.
        """
        print('Increasing volume...')
        print(' ')
        ncast = self.cast
        volume = round(ncast.status.volume_level, 1)
        return ncast.set_volume(volume + 0.1)

    def volume_down(self):
        """ Decrement the volume by 0.1 unless it is already 0.
        Returns the new volume.
        """
        print('Decreasing volume...')
        print(' ')
        ncast = self.cast
        volume = round(ncast.status.volume_level, 1)
        return ncast.set_volume(volume - 0.1)

    def reboot(self):
        if self.platform == 'Darwin':
            self.host = socket.gethostbyname(self.castto+'.local')
            reboot(self.host)
        else:
            print(colors.error('This method is not supported in Linux yet.'))

    def availablecc(self):
        """This method is used for populating the self.availablecc array
        needed for the system tray.
        """
        self.availablecc=[]
        for self.index,device in enumerate(self.cclist):
            try:
                print(str(self.index)+'      ', str(device))
            except UnicodeEncodeError:
                print(str(self.index)+'      ', str(unicode(device).encode("utf-8")))
            toappend = [self.index,device]
            self.availablecc.append(toappend)
