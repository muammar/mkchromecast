#!/usr/bin/env python

# This file is part of mkchromecast.
"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser # This is for Python3
import os, getpass

class config_manager(object):
    def __init__(self):
        user = getpass.getuser()
        config = ConfigParser.RawConfigParser()
        platform = 'Darwin'

        config.add_section('settings')

        # Writing our configuration file

        """
        Depeding the platform we create the configuration directory in different
        locations.
        """
        if platform == 'Darwin':
            directory = '/Users/'+user+'/Library/Application Support/mkchromecast/'
        else:
            directory = '/home/'+user+'/.config/mkchromecast/'      #Linux

        """
        Verify that the directory set before exists.
        """
        if not os.path.exists(directory):
            os.makedirs(directory)

        """
        Creation of the configuration file.
        """
        configf = directory+'mkchromecast.cfg'
        if not os.path.exists(configf):
            if platform == 'Darwin':
                config.set('settings', 'backend', 'node')
                config.set('settings', 'codec', 'mp3')
                config.set('settings', 'bitrate', '192')
                config.set('settings', 'samplerate', '41000')
            else:
                config.set('settings', 'backend', 'ffmpeg')
                config.set('settings', 'codec', 'mp3')
                config.set('settings', 'bitrate', '192')
                config.set('settings', 'samplerate', '41000')

            with open(configf, 'w') as configfile:
                config.write(configfile)


"""
The function below helps to map the options inside each section. Taken from:
https://wiki.python.org/moin/ConfigParserExamples
import ConfigParser
config = ConfigParser.RawConfigParser()
config.read(configf)

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

print (platform)
print (ConfigSectionMap("settings")['bitrate'])
"""
