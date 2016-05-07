#!/usr/bin/env python

# This file is part of mkchromecast.

import socket
import subprocess
import os.path

"""
These functions are used to switch input/out to Soundflower back and forth.

To call them:
    from mkchromecast.audiodevices import *
    name()
"""

def inputdev():
    if os.path.exists('./bin/audiodevice') == True:
        inputdevtosf2 = ['./bin/audiodevice input "Soundflower (2ch)"']
    else:
        inputdevtosf2 = ['./audiodevice input "Soundflower (2ch)"']
    subprocess.Popen(inputdevtosf2, shell=True)
    return

def outputdev():
    if os.path.exists('./bin/audiodevice') == True:
        outputdevtosf2 = ['./bin/audiodevice output "Soundflower (2ch)"']
    else:
        outputdevtosf2 = ['./audiodevice output "Soundflower (2ch)"']
    subprocess.Popen(outputdevtosf2, shell=True)
    return

def inputint():
    if os.path.exists('./bin/audiodevice') == True:
        inputinttosf2 = ['./bin/audiodevice input internal']
    else:
        inputinttosf2 = ['./audiodevice input internal']
    subprocess.call(inputinttosf2, shell=True)
    return

def outputint():
    if os.path.exists('./bin/audiodevice') == True:
        outputinttosf2 = ['./bin/audiodevice output internal']
    else:
        outputinttosf2 = ['./audiodevice output internal']
    subprocess.call(outputinttosf2, shell=True)
    return
