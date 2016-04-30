#!/usr/bin/env python

# This file is part of mkchromecast.

import mkchromecast.__init__
import subprocess

def create_sink():

    create_sink = ['pacmd', 'load-module', 'module-null-sink', 'sink_name=', name]
    rename_sink = ['pacmd', 'update-sink-proplist', name, 'device.description=', name]
    create_p = subprocess.Popen(create_sink)
    rename_p = subprocess.Popen(rename_sink)
    return

def remove_sink():
    remove_sink = ['pacmd', 'unload-module', 'module-null-sink']
    rename_p = subprocess.Popen(remove_sink)
    return
