# This file is part of mkchromecast.

import mkchromecast
import mkchromecast.colors as colors

# TODO(xsdg): Encapsulate this so that we don't do this work on import.
_mkcc = mkchromecast.Mkchromecast()


def bitrate_default(bitrate):
    """Bitrate messages
    Printing default bitrate message
    """
    if _mkcc.source_url is None:
        print(colors.options("Default bitrate used:") + " " + bitrate)
    return


def no_bitrate(codec):
    if _mkcc.source_url is None:
        print(
            colors.warning(
                "The " + codec + " codec does not require the bitrate argument."
            )
        )
    return


def maxbitrate(codec, bitrate):
    if _mkcc.source_url is None:
        print(
            colors.warning(
                "Maximum bitrate supported by " + codec + " is: " + bitrate + "k."
            )
        )
    if codec == "aac" and _mkcc.source_url is None:
        print(
            colors.warning(
                "At about 128-256k is already considered as "
                '"transparent" for ' + codec + "."
            )
        )
        print(colors.warning("You may try lossless audio coding formats."))
        print(colors.warning("Bitrate has been set to maximum!"))
    return


def samplerate_default(samplerate):
    """Sample rate messages
    Printing default sample rate message"""
    if _mkcc.source_url is None:
        print(colors.options("Default sample rate used:") + " " + samplerate + "Hz.")
    return


def samplerate_info(codec):
    """This prints warning when sample rates are set incorrectly"""
    if _mkcc.source_url is None:
        print(
            colors.warning(
                "Sample rates supported by "
                + codec
                + " are: "
                + str(22050)
                + "Hz, "
                + str(32000)
                + "Hz, "
                + str(44100)
                + "Hz, "
                + str(48000)
                + "Hz  "
                + str(96000)
                + "Hz or "
                + str(192000)
                + "Hz."
            )
        )
    return


def samplerate_no96(codec):
    """This prints warning when sample rates are set incorrectly and no 96k"""
    if _mkcc.source_url is None:
        print(
            colors.warning(
                "Sample rates supported by "
                + codec
                + " are: "
                + str(22050)
                + "Hz, "
                + str(32000)
                + "Hz, "
                + str(44100)
                + "Hz or, "
                + str(48000)
                + "Hz."
            )
        )
    return


def print_available_devices(list_of_devices):
    """docstring for print_available_devices"""
    print(colors.important("List of Devices Available in Network:"))
    print(colors.important("-------------------------------------\n"))
    print(colors.important("Index   Types   Friendly Name "))
    print(colors.important("=====   =====   ============= "))
    for device in list_of_devices:
        device_index = device[0]
        device_name = device[1]
        device_type = device[2]
        print("%s \t%s \t%s" % (device_index, device_type, device_name))
