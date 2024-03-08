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
