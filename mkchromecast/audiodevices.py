#!/usr/bin/env python

# This file is part of mkchromecast.

import socket
import subprocess

"""
These functions are used to switch input/out to Soundflower back and forth.

To call them:
    from mkchromecast.audiodevices import *
    name()
"""

def inputdev():
    inputdevtosf2 = ['./bin/audiodevice input "Soundflower (2ch)"']
    subprocess.Popen(inputdevtosf2, shell=True)
    return

def outputdev():
    outputdevtosf2 = ['./bin/audiodevice output "Soundflower (2ch)"']
    subprocess.Popen(outputdevtosf2, shell=True)
    return

def inputint():
    inputinttosf2 = ['./bin/audiodevice input internal']
    subprocess.call(inputinttosf2, shell=True)
    return

def outputint():
    outputinttosf2 = ['./bin/audiodevice output internal']
    subprocess.call(outputinttosf2, shell=True)
    return
