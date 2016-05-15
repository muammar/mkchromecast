#!/usr/bin/env python

# This file is part of mkchromecast.

import ConfigParser

config = ConfigParser.RawConfigParser()

config.add_section('backend')
config.set('backend', 'an_int', '15')
config.set('backend', 'a_bool', 'true')
config.set('backend', 'a_float', '3.1415')
config.set('backend', 'baz', 'fun')
config.set('backend', 'bar', 'Python')
config.set('backend', 'foo', '%(bar)s is %(baz)s!')

config.add_section('codec')
config.set('codec', 'an_int', '15')
config.set('codec', 'a_bool', 'true')
config.set('codec', 'a_float', '3.1415')
config.set('codec', 'baz', 'fun')
config.set('codec', 'bar', 'Python')
config.set('codec', 'foo', '%(bar)s is %(baz)s!')

config.add_section('bitrate')
config.set('bitrate', 'an_int', '15')
config.set('bitrate', 'a_bool', 'true')
config.set('bitrate', 'a_float', '3.1415')
config.set('bitrate', 'baz', 'fun')
config.set('bitrate', 'bar', 'Python')
config.set('bitrate', 'foo', '%(bar)s is %(baz)s!')

config.add_section('samplerate')
config.set('samplerate', 'an_int', '15')
config.set('samplerate', 'a_bool', 'true')
config.set('samplerate', 'a_float', '3.1415')
config.set('samplerate', 'baz', 'fun')
config.set('samplerate', 'bar', 'Python')
config.set('samplerate', 'foo', '%(bar)s is %(baz)s!')

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

print (ConfigSectionMap("backend")['baz'])
