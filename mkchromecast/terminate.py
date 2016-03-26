#!/usr/bin/env python

# This file is part of mkchromecast.

from os import getpid
import psutil

"""
These functions are used to kill main processes and child.

To call them:
    from mkchromecast.terminate import *
    name()
"""

def terminate():
    parent_pid = getpid()
    parent = psutil.Process(parent_pid)
    for child in parent.children(recursive=True):  # or parent.children() for recursive=False
        child.kill()
    parent.kill()
