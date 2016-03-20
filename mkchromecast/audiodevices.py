#!/usr/bin/env python

# This file is part of mkchromecast.

# mkchromecast is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# mkchromecast is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with mkchromecast.  If not, see <http://www.gnu.org/licenses/>.

import socket
import subprocess

"""
These functions are used to switch input/out to Soundflower back and forth.

To call them:
    from mkchromecast.audiodevices import *
    name()
"""

def inputdev():
    inputdevtosf2 = ['../bin/audiodevice','input','"Soundflower (2ch)"']
    subprocess.Popen(inputdevtosf2, shell=True)
    return

def outputdev():
    outputdevtosf2 = ['../bin/audiodevice','output','"Soundflower (2ch)"']
    subprocess.Popen(outputdevtosf2, shell=True)
    return

def inputint():
    inputinttosf2 = ['../bin/audiodevice','input','internal']
    subprocess.Popen(inputinttosf2, shell=True)
    return

def outputint():
    outputinttosf2 = ['../bin/audiodevice','output','internal']
    subprocess.Popen(outputinttosf2, shell=True)
    return
