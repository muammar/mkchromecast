# This file is part of mkchromecast.

from typing import Any, Iterable, List

import mkchromecast
from mkchromecast import colors

# TODO(xsdg): The list of codecs and their requirements should be stored in some
# centralized location instead of being passed across modules like this.
_NO96K_CODECS = {"ogg", "mp3"}

def bitrate_default(mkcc: mkchromecast.Mkchromecast, bitrate: str) -> None:
    """Prints a default bitrate message."""
    if not mkcc.source_url:
        print(colors.options("Default bitrate used:") + f" {bitrate}")


def no_bitrate(mkcc: mkchromecast.Mkchromecast, codec: str) -> None:
    """Prints a message that a bitrate is not needed."""
    if not mkcc.source_url:
        print(colors.warning(
            f"The {codec} codec does not require the bitrate argument."
            )
        )


def maxbitrate(mkcc: mkchromecast.Mkchromecast, codec: str, bitrate: str) -> None:
    if not mkcc.source_url:
        print(colors.warning(
            f"Maximum bitrate supported by {codec} is: {bitrate}k."
            )
        )

        if codec == "aac":
            print(colors.warning(
                "128-256k is already considered sufficient for maximum quality "
                f"using {codec}."
                )
            )
            print(colors.warning(
                "Consider a lossless audio codec for higher quality."
                )
            )


def samplerate_default(mkcc: mkchromecast.Mkchromecast, samplerate: str) -> None:
    """Prints a default sample rate message."""
    if not mkcc.source_url:
        print(colors.options("Default sample rate used:") + f" {samplerate}Hz.")


def print_samplerate_warning(mkcc: mkchromecast.Mkchromecast, codec: str) -> None:
    """Prints a warning when sample rates are set incorrectly."""
    if mkcc.source_url:
        return

    int_rates = [22050, 32000, 44100, 48000]
    if codec not in _NO96K_CODECS:
        int_rates.extend([96000, 192000])

    str_rates = [f"{rate}Hz" for rate in int_rates]
    joined_rates = ", ".join(str_rates)
    print(colors.warning(
        f"Sample rates supported by {codec} are: {joined_rates}."
        )
    )


def print_available_devices(mkcc: mkchromecast.Mkchromecast, list_of_devices: Iterable[Any]):
    """Prints a list of available devices."""
    print(colors.important("List of Devices Available in Network:"))
    print(colors.important("-------------------------------------\n"))
    print(colors.important("Index   Types   Friendly Name "))
    print(colors.important("=====   =====   ============= "))
    for device in list_of_devices:
        device_index = device[0]
        device_name = device[1]
        device_type = device[2]
        print("%s \t%s \t%s" % (device_index, device_type, device_name))
