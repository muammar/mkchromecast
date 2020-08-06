# This file is part of mkchromecast.

import subprocess
import time
import re

_sink_num = None


def create_sink():
    global _sink_num

    sink_name = "Mkchromecast"

    create_sink = ["pactl", "load-module", "module-null-sink", "sink_name=" + sink_name, "sink_properties=device.description=" + sink_name]

    cs = subprocess.Popen(create_sink, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    csoutput, cserror = cs.communicate()
    _sink_num = csoutput[:-1]

    return


def remove_sink():

    global _sink_num

    if _sink_num is None:
        return

    if not isinstance(_sink_num, list):
        _sink_num = [_sink_num]

    for num in _sink_num:
        remove_sink = [
            "pactl", "unload-module",
            num.decode("utf-8") if type(num) == bytes else str(num)]
        rms = subprocess.run(
            remove_sink, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            timeout=60, check=True)


def check_sink():
    try:
        check_sink = ["pacmd", "list-sinks"]
        chk = subprocess.Popen(
            check_sink, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        chkoutput, chkerror = chk.communicate()
    except FileNotFoundError:
        return None

    try:
        if "Mkchromecast" in chkoutput:
            return True
        else:
            return False
    except TypeError:
        if "Mkchromecast" in chkoutput.decode("utf-8"):
            return True
        else:
            return False


def get_sink_list():
    """Get a list of sinks with a name prefix of Mkchromecast and save to _sink_num.

    Used to clear any residual sinks from previous failed actions. The number
    saved to _sink_num is the module index, which can be passed to pacmd.
    """
    global _sink_num

    cmd = ["pacmd", "list-sinks"]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60, check=True)

    pattern = re.compile(
        r"\s*?index:\s*?\d+\s*$\s*?name:\s*?<Mkchromecast.*>" +
        r"\s*?$(?:\n^.*?$)*?\n^\s*?module: (?P<module>\d+?)\s*?$",
        re.MULTILINE)
    matches = pattern.findall(result.stdout.decode("utf-8"), re.MULTILINE)

    _sink_num = [int(i) for i in matches]
