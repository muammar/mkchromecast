#!/usr/bin/env python

# This file is part of mkchromecast.

import subprocess, time

def create_sink():
    name = 'mkchromecast'

    create_sink = ['pactl', 'load-module', 'module-null-sink', 'sink_name='+name]
    #print (create_sink)
    rename_sink = ['pacmd', 'update-sink-proplist', name, 'device.description='+name]
    #print (rename_sink)
    subprocess.Popen(create_sink)
    time.sleep(1)
    subprocess.Popen(rename_sink)
    return

def remove_sink():
    remove_sink = ['pactl', 'unload-module', 'module-null-sink']
    subprocess.Popen(remove_sink)
    return
