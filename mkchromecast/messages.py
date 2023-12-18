# This file is part of mkchromecast.

from typing import Any, Iterable, List

from mkchromecast import colors
from mkchromecast import constants


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
