#!/usr/bin/env python

# This file is part of mkchromecast.
from rumps import *
import urllib
from mkchromecast.cast import *


class AwesomeStatusBarApp(rumps.App):
    def __init__(self):
        self.cc = casting()
        super(AwesomeStatusBarApp, self).__init__("mkchromecast", icon='images/google.ico')
        self.menu = ["Search for Google Cast devices",
                    "Stop casting",
                    None,
                    None,
                    None,
                    "Preferences",
                    "Say hi"]

    @rumps.clicked("Search for Google Cast devices")
    def search_cast(self, _):
        args.select_cc = True
        self.cc.initialize_cast()
        self.cc.get_cc()

    @rumps.clicked("Stop casting")
    def onoff(self, sender):
        sender.state = not sender.state

    @rumps.clicked("Say hi")
    def sayhi(self, _):
        rumps.notification("Awesome title", "amazing subtitle", "hi!!1")

    @rumps.clicked("Preferences")
    def prefs(self, _):
        rumps.alert("jk! no preferences available!")

if __name__ == "__main__":

    #App('lovegun', icon='kiss.png')
    AwesomeStatusBarApp().run()
