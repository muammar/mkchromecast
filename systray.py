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
                    "Reset audio",
                    "Preferences",
                    "About"]

    @rumps.clicked("Search for Google Cast devices")
    def search_cast(self, _):
        args.select_cc = True
        self.cc.initialize_cast()
        self.cc.get_cc()

    @rumps.clicked("Stop casting")
    def stop_cast(self, _):
        print('Print algo')

   # @rumps.clicked("Select casting")
   # def onoff(self, sender):
   #     sender.state = not sender.state

    @rumps.clicked("Reset audio")
    def reset(self, _):
        rumps.alert("jk! no preferences available!")

    @rumps.clicked("Preferences")
    def prefs(self, _):
        rumps.alert("jk! no preferences available!")

    @rumps.clicked("About")
    def about(self, _):
        rumps.alert("mkchromecast <Muammar El Khatib 2006>")

if __name__ == "__main__":

    #App('lovegun', icon='kiss.png')
    AwesomeStatusBarApp().run()
