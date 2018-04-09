
# This file is part of mkchromecast.

import subprocess
import os.path

"""
These functions are used to switch input/out to Soundflower back and forth.

To call them:
    from mkchromecast.audio_devices import *
    name()
"""


def inputdev():
    if os.path.exists('./bin/audiodevice') is True:
        inputdevtosf2 = ['./bin/audiodevice input "Soundflower (2ch)"']
    else:
        inputdevtosf2 = ['./audiodevice input "Soundflower (2ch)"']
    subprocess.Popen(inputdevtosf2, shell=True)
    return


def outputdev():
    if os.path.exists('./bin/audiodevice') is True:
        outputdevtosf2 = ['./bin/audiodevice output "Soundflower (2ch)"']
    else:
        outputdevtosf2 = ['./audiodevice output "Soundflower (2ch)"']
    subprocess.Popen(outputdevtosf2, shell=True)
    return


def inputint():
    if os.path.exists('./bin/audiodevice') is True:
        inputinttosf2 = ['./bin/audiodevice input "Internal Microphone"']
    else:
        inputinttosf2 = ['./audiodevice input "Internal Microphone"']
    subprocess.call(inputinttosf2, shell=True)
    return


def outputint():
    if os.path.exists('./bin/audiodevice') is True:
        outputinttosf2 = ['./bin/audiodevice output "Internal Speakers"']
    else:
        outputinttosf2 = ['./audiodevice output "Internal Speakers"']
    subprocess.call(outputinttosf2, shell=True)
    return
