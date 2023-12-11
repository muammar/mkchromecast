# This file is part of mkchromecast.

from typing import Any, Iterable, List

from mkchromecast import colors
from mkchromecast import constants


def print_bitrate_warning(codec: str, bitrate: str) -> None:
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


def print_samplerate_warning(codec: str) -> None:
    """Prints a warning when sample rates are set incorrectly."""
    str_rates = [
        f"{rate}Hz" for rate in constants.sample_rates_for_codec(codec)
    ]
    joined_rates = ", ".join(str_rates)
    print(colors.warning(
        f"Sample rates supported by {codec} are: {joined_rates}."
        )
    )


def print_available_devices(list_of_devices: Iterable[Any]):
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
