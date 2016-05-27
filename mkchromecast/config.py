#!/usr/bin/env python

# This file is part of mkchromecast.
"""
Configparser is imported differently in Python3
"""
import mkchromecast.__init__        # This is to verify against some needed variables
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser # This is for Python3
import os, getpass

platform = mkchromecast.__init__.platform

class config_manager(object):
    def __init__(self):
        self.user = getpass.getuser()
        self.config = ConfigParser.RawConfigParser()

        self.config.add_section('settings')

        # Writing our configuration file

        """
        Depeding the platform we create the configuration directory in different
        locations.
        """
        if platform == 'Darwin':
            self.directory = '/Users/'+self.user+'/Library/Application Support/mkchromecast/'
        else:
            self.directory = '/home/'+self.user+'/.config/mkchromecast/'      #Linux
        self.configf = self.directory+'mkchromecast.cfg'

    def config_defaults(self):
        """
        Verify that the directory set before exists.
        """
        if not os.path.exists(self.directory):
            os.makedirs(self.directory)

        """
        Creation of the configuration file.
        """
        if not os.path.exists(self.configf):
            if platform == 'Darwin':
                self.config.set('settings', 'backend', 'node')
                self.config.set('settings', 'codec', 'mp3')
                self.config.set('settings', 'bitrate', '192')
                self.config.set('settings', 'samplerate', '44100')
                self.config.set('settings', 'notifications', 'enabled')
            else:
                self.config.set('settings', 'backend', 'ffmpeg')
                self.config.set('settings', 'codec', 'mp3')
                self.config.set('settings', 'bitrate', '192')
                self.config.set('settings', 'samplerate', '44100')
                self.config.set('settings', 'notifications', 'enabled')

            with open(self.configf, 'w') as configfile:
                self.config.write(configfile)

    def verify_config(self):
        from mkchromecast.preferences import ConfigSectionMap
        self.config.read(self.configf)
        backend = ConfigSectionMap("settings")['backend']
        codec= ConfigSectionMap("settings")['codec']
        bitrate = ConfigSectionMap("settings")['bitrate']
        samplerate= ConfigSectionMap("settings")['samplerate']
        notifications = ConfigSectionMap("settings")['notifications']
        codecs = ['mp3','ogg', 'aac']
        if os.path.exists(self.configf):
            """
            Reading the codec from config file
            """
            if codec in codecs and bitrate == 'None':
                self.config.set('settings', 'backend', str(backend))
                self.config.set('settings', 'codec', str(codec))
                self.config.set('settings', 'bitrate', '192')
                self.config.set('settings', 'samplerate', str(samplerate))
                self.config.set('settings', 'notifications', str(notifications))

            with open(self.configf, 'w') as configfile:
                self.config.write(configfile)

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
