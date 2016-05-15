#!/usr/bin/env python

# This file is part of mkchromecast.

import ConfigParser

config = ConfigParser.RawConfigParser()

config.add_section('settings')
config.set('settings', 'backend', '15')
config.set('settings', 'codec', 'true')
config.set('settings', 'bitrate', '3.1415')
config.set('settings', 'samplerate', 'fun')

# Writing our configuration file to 'example.cfg'
with open('mkchromecast.cfg', 'wb') as configfile:
    config.write(configfile)

"""
The function below helps to map the options inside each section. Taken from:
https://wiki.python.org/moin/ConfigParserExamples
"""
def ConfigSectionMap(section):
    dict1 = {}
    options = config.options(section)
    for option in options:
        try:
            dict1[option] = config.get(section, option)
            if dict1[option] == -1:
                DebugPrint("skip: %s" % option)
        except:
            print("exception on %s!" % option)
            dict1[option] = None
    return dict1

print (ConfigSectionMap("settings")['bitrate'])
