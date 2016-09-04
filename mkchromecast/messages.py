#!/usr/bin/env python

# This file is part of mkchromecast.
import mkchromecast.colors as colors

"""
Bitrate messages
"""
def bitrate_default(bitrate):
    """Printing default bitrate message"""
    print(colors.options('Default bitrate used:')+' '+ bitrate)
    return

def no_bitrate(codec):
    print(colors.warning('The '+codec+' codec does not require the bitrate argument.'))
    return

def maxbitrate(codec, bitrate):
    print(colors.warning('Maximum bitrate supported by '+codec+' is: '+bitrate+'k.'))
    if codec == 'aac':
        print(colors.warning('At about 128-256k is already considered as "transparent" for '+codec+'.'))
    print(colors.warning('You may try lossless audio coding formats.'))
    print(colors.warning('Bitrate has been set to maximum!'))
    return

"""
Sample rate messages
"""
def samplerate_default(samplerate):
    """Printing default sample rate message"""
    print(colors.options('Default sample rate used:')+' '+ samplerate+'Hz')
    return

def samplerate_info(codec):
    """This prints warning when sample rates are set incorrectly"""
    print(colors.warning('Sample rates supported by '+codec+' are: '
        +str(22050)+'Hz, '
        +str(32000)+'Hz, '
        +str(44100)+'Hz, '
        +str(48000)+'Hz or '
        +str(96000)+'Hz')
        )
    return

def samplerate_no96(codec):
    """This prints warning when sample rates are set incorrectly and no 96k"""
    print(colors.warning('sample rates supported by '+codec+' are: '
        +str(22050)+'hz, '
        +str(32000)+'hz, '
        +str(44100)+'hz or, '
        +str(48000)+'hz')
        )
    return
