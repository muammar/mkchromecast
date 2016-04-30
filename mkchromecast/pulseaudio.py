#!/usr/bin/env python

# This file is part of mkchromecast.

def create_sink():
    pacmd load-module module-null-sink sink_name=MySink
    pacmd update-sink-proplist MySink device.description=MySink
    return

def remove_sink():
    pacmd unload-module module-null-sink
    return
