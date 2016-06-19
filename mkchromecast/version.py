#!/usr/bin/env python

# This file is part of mkchromecast.

__version__ = '0.2.8'

def updater():
    import requests
    url = 'https://api.github.com/repos/muammar/mkchromecast/releases/latest'
    response = requests.get(url).text.split(',')

    for e in response:
        if 'tag_name' in e:
            version = e.strip('"tag_name":')

    if version > __version__:
        print ('Version ' + version + ' is available to download')
        return True
    else:
        print ('You are up to date')
        return False
