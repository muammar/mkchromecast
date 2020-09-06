"""\
py-getch
--------

Portable getch() for Python.

:copyright: (c) 2013-2015 by Joe Esposito.
:license: MIT, see LICENSE for more details.
"""

__version__ = "1.0.1"

from .getch import getch
from .pause import pause, pause_exit


__all__ = ["__version__", "getch", "pause", "pause_exit"]
