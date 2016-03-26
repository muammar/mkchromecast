#!/usr/bin/env python

# This file is part of mkchromecast.

from __future__ import print_function
import time
import pychromecast
import socket
from .terminate import *
from .audiodevices import *

class casting(object):

    def __init__(self): ## __init__ to call the self.ip
        self.ip = socket.gethostbyname(socket.gethostname())

    def initialize_cast(self):
        from pychromecast import socket_client
        self.listofcc = list(pychromecast.get_chromecasts_as_dict().keys())

        if len(self.listofcc) != 0:
            print('List of CC in your network')
            print(self.listofcc)
        else:
            print('No devices found!')
            inputint()
            outputint()
            terminate()
            exit()

    def get_cc(self):
            # For the moments it casts to the first device in the list
            self.cast = pychromecast.get_chromecast(self.listofcc[0])
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
