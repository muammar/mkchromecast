#!/usr/bin/env python

# This file is part of mkchromecast.

from __future__ import print_function
from .__init__ import *
import time
import pychromecast
import socket
from .terminate import *
from .audiodevices import *
import os.path
import pickle


class casting(object):
    def __init__(self): ## __init__ to call the self.ip
        self.ip = socket.gethostbyname(socket.gethostname())

    def initialize_cast(self):
        from pychromecast import socket_client
        self.cclist = list(pychromecast.get_chromecasts_as_dict().keys())

        if len(self.cclist) != 0 and args.select_cc == False:
            print(' ')
            print('List of Google cast devices available in your network.')
            for index,device in enumerate(self.cclist):
                print(str(index)+': ', str(device))
            print(' ')
            print('We will cast to first device in this list:')
            print(' ')
            self.castto = self.cclist[0]
            print(self.castto)
            print(' ')

        elif len(self.cclist) != 0 and args.select_cc == True:
            if os.path.exists('/tmp/mkcrhomecast.tmp') == False:
                tf = open('/tmp/mkcrhomecast.tmp', 'wb')
                print(' ')
                print('List of Google cast devices available in your network:')
                print(' ')
                for index,device in enumerate(self.cclist):
                    print(str(index)+': ', str(device))

                print(' ')
                print('Please, select the number of the Google cast device that you want to use:')
                index = input()
                pickle.dump(index, tf)
                tf.close()
                self.castto = self.cclist[int(index)]
                print(' ')
                print('Casting to: ', self.castto)
                print(' ')
            else:
                tf = open('/tmp/mkcrhomecast.tmp', 'rb')
                index=pickle.load(tf)
                self.castto = self.cclist[int(index)]
                print(' ')
                print('Casting to: ', self.castto)
                print(' ')

        else:
            print('No devices found!')
            inputint()
            outputint()
            terminate()
            exit()

    def get_cc(self):
            self.cast = pychromecast.get_chromecast(self.castto)
            # Wait for cast device to be ready
            self.cast.wait()
            print(self.cast.device)
            print(self.cast.status)

    def play_cast(self):
        start = casting()
        localip = start.ip
        print (localip)
        ncast = self.cast
        ncast.play_media('http://'+localip+':3000/stream.mp3', 'audio/mpeg')
        print(ncast.status)

    def stop_cast(self):
        ncast = self.cast
        ncast.quit_app()
