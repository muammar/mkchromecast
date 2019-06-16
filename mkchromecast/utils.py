# This file is part of mkchromecast.

import psutil
import pickle
from os import getpid
import os.path
import mkchromecast.colors as colors
import subprocess
import socket
import json

try:
    from urlparse import urlparse
except:
    from urllib.parse import urlparse

"""
To call them:
    from mkchromecast.terminate import name
    name()
"""


def terminate():
    del_tmp()
    parent_pid = getpid()
    parent = psutil.Process(parent_pid)
    for child in parent.children(recursive=True):
        child.kill()
    parent.kill()
    return


def del_tmp():
    """Delete files created in /tmp/"""
    delete_me = ["/tmp/mkchromecast.tmp", "/tmp/mkchromecast.pid"]

    print(colors.important("Cleaning up /tmp/..."))

    for f in delete_me:
        if os.path.exists(f) is True:
            os.remove(f)

    print(colors.success("[Done]"))
    return


def is_installed(name, path, debug):
    PATH = path
    iterate = PATH.split(":")
    for item in iterate:
        verifyif = str(item + "/" + name)
        if os.path.exists(verifyif) is False:
            continue
        else:
            if debug is True:
                print("Program %s found in %s." % (name, verifyif))
            return True
    return


def check_url(url):
    """Check if a URL is correct"""
    try:
        result = urlparse(url)
        return True if [result.scheme, result.netloc, result.path] else False
    except Exception as e:
        return False


def writePidFile():
    # This is to verify that pickle tmp file exists
    if os.path.exists("/tmp/mkchromecast.pid") is True:
        os.remove("/tmp/mkchromecast.pid")
    pid = str(os.getpid())
    f = open("/tmp/mkchromecast.pid", "wb")
    pickle.dump(pid, f)
    f.close()
    return


def checkmktmp():
    # This is to verify that pickle tmp file exists
    if os.path.exists("/tmp/mkchromecast.tmp") is True:
        os.remove("/tmp/mkchromecast.tmp")
    return


def check_file_info(name, what=None):
    """Check things about files"""

    command = [
        "ffprobe",
        "-show_format",
        "-show_streams",
        "-loglevel",
        "quiet",
        "-print_format",
        "json",
        name,
    ]

    info = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    info_out, info_error = info.communicate()
    d = json.loads(info_out)

    if what == "bit-depth":
        bit_depth = d["streams"][0]["pix_fmt"]
        return bit_depth
    elif what == "resolution":
        resolution = d["streams"][0]["height"]
        resolution = str(resolution) + "p"
        return resolution


def get_effective_ip(platform, host_override=None, fallback_ip="127.0.0.1"):
    if host_override is None:
        return resolve_ip(platform, fallback_ip=fallback_ip)
    else:
        return host_override


def resolve_ip(platform, fallback_ip):
    if platform == "Linux":
        resolved_ip = _resolve_ip_linux()
    else:
        resolved_ip = _resolve_ip_nonlinux()
    if resolved_ip is None:
        resolved_ip = fallback_ip
    return resolved_ip


def _resolve_ip_linux():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    try:
        s.connect(("8.8.8.8", 80))
    except socket.error:
        return None
    return s.getsockname()[0]


def _resolve_ip_nonlinux():
    try:
        return socket.gethostbyname(socket.gethostname())
    except socket.gaierror:
        return _get_first_network_ip_by_netifaces()


def _get_first_network_ip_by_netifaces():
    import netifaces

    interfaces = netifaces.interfaces()
    for interface in interfaces:
        if interface == "lo":
            continue
        iface = netifaces.ifaddresses(interface).get(netifaces.AF_INET)
        if iface is not None and iface[0]["addr"] is not "127.0.0.1":
            for e in iface:
                return str(e["addr"])
