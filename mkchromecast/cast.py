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
            for self.index,device in enumerate(self.cclist):
                print(str(self.index)+': ', str(device))
            print(' ')
            print('We will cast to first device in the list above!')
            print(' ')
            self.castto = self.cclist[0]
            print(self.castto)
            print(' ')

        elif len(self.cclist) != 0 and args.select_cc == True:
            if os.path.exists('/tmp/mkcrhomecast.tmp') == False:
                self.tf = open('/tmp/mkcrhomecast.tmp', 'wb')
                print(' ')
                print('List of Google cast devices available in your network:')
                print(' ')
                self.availablecc=[]
                for self.index,device in enumerate(self.cclist):
                    print(str(self.index)+': ', str(device))
                    toappend = [self.index,device]
                    self.availablecc.append(toappend)
                #print ('Array')
                #print (availablecc)

            else:
                self.tf = open('/tmp/mkcrhomecast.tmp', 'rb')
                self.index=pickle.load(self.tf)
                self.castto = self.cclist[int(self.index)]
                print(' ')
                print('Casting to: ', self.castto)
                print(' ')

        elif len(self.cclist) != 0 and args.select_cc == False and args.tray == True :
                self.tf = open('/tmp/mkcrhomecast.tmp', 'rb')
                self.index=pickle.load(self.tf)
                self.castto = self.cclist[int(self.index)]
                print(' ')
                print('Casting to: ', self.castto)

        elif len(self.cclist) == 0 and args.tray == False:
            print('No devices found!')
            inputint()
            outputint()
            terminate()
            exit()

        elif len(self.cclist) == 0 and args.tray == True:
            print('No devices found!')
            self.availablecc = []

    def sel_cc(self):
            print(' ')
            print('Please, select the number of the Google cast device that you want to use:')
            self.index = input()

    def inp_cc(self):
            pickle.dump(self.index, self.tf)
            self.tf.close()
            self.castto = self.cclist[int(self.index)]
            print(' ')
            print('Casting to: ', self.castto)
            print(' ')

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
