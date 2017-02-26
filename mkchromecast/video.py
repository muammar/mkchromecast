#!/usr/bin/env python

# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import mkchromecast.__init__
from mkchromecast.audio_devices import *
import mkchromecast.colors as colors
from mkchromecast.config import *
from mkchromecast.preferences import ConfigSectionMap
import psutil
import pickle
import sys
import time
from functools import partial
from subprocess import Popen, PIPE
from flask import Flask, Response, request
import multiprocessing
import threading
import os
from os import getpid

chunk_size = mkchromecast.__init__.chunk_size
appendtourl = 'stream'
platform = mkchromecast.__init__.platform
subtitles = mkchromecast.__init__.subtitles
input_file = mkchromecast.__init__.input_file
res = mkchromecast.__init__.resolution
seek = mkchromecast.__init__.seek

try:
    youtubeurl = mkchromecast.__init__.youtubeurl
except AttributeError:
    youtubeurl = None

def resolution(res):
    if res.lower() == '480p':
        insert = ['-vf', 'scale=853:-1']
        return insert
    if res.lower() == '720p':
        insert = ['-vf', 'scale=1280:-1']
        return insert
    if res.lower() == '1080p':
        insert = ['-vf', 'scale=1920:-1']
        return insert
    if res.lower() == '2k':
        insert = ['-vf', 'scale=2048:-1']
        return insert
    if res.lower() == 'uhd':
        insert = ['-vf', 'scale=3840:-1']
        return insert
    if res.lower() == '4k':
        insert = ['-vf', 'scale=4096:-1']
        return insert

def seeking(seek):
    seek_append = ['-ss', seek]
    for i, _ in enumerate(seek_append):
       command.insert(i + 1, _)

""" This command is not working I found this:
http://stackoverflow.com/questions/12801192/client-closes-connection-when-streaming-m4v-from-apache-to-chrome-with-jplayer.
I think that the command below is sending a file that is too big and the
browser closes the connection.
"""
if youtubeurl != None:
    command = [
        'youtube-dl',
        '-o',
        '-',
        youtubeurl
        ]
    mtype = 'video/mp4'

else:
    """
    The blocks shown below are related to input_files
    """
    if input_file != None and subtitles == None:
        """
        command = [
            'ffmpeg',
            '-re',
            '-loglevel', 'panic',
            '-i', input_file,
            '-preset', 'ultrafast',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe',
            'pipe:1'
         ]
        """
        # Command taken from https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#Streamingafile
        command = [
            'ffmpeg',
            '-re',
            '-loglevel', 'panic',
            '-i', input_file,
            '-vcodec', 'libx264',
            '-preset', 'ultrafast',
            '-tune', 'zerolatency',
            '-maxrate', '10000k',
            '-bufsize', '20000k',
            '-pix_fmt', 'yuv420p',
            '-g', '60', #'-c:a', 'copy', '-ac', '2',
            #'-b', '900k',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe',
            'pipe:1'
        ]
        if seek != None:
            seeking(seek)

    elif input_file != None and subtitles != None:
        """
        command = [
            'ffmpeg',
            '-re',
            '-loglevel', 'panic',
            '-i', input_file,
            '-preset', 'ultrafast',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe',
            '-vf', 'subtitles='+subtitles,
            'pipe:1'
        ]
        """
        # Command taken from https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#Streamingafile
        command = [
            'ffmpeg',
            '-re',
            '-loglevel', 'panic',
            '-i', input_file,
            '-vcodec', 'libx264',
            '-preset', 'ultrafast',
            '-tune', 'zerolatency',
            '-maxrate', '10000k',
            '-bufsize', '20000k',
            '-pix_fmt', 'yuv420p',
            '-g', '60', #'-c:a', 'copy', '-ac', '2',
            #'-b', '900k',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe',
            '-vf', 'subtitles='+subtitles,
            'pipe:1'
        ]
        if seek != None:
            seeking(seek)

    mtype = 'video/mp4'
    if res != None:
        cindex = command.index(input_file)
        res_elements = resolution(res)
        for element in res_elements:
            command.insert(-cindex, element)

app = Flask(__name__)

if debug == True:
    print(':::ffmpeg::: command '+str(command))

@app.route('/')
def index():
    return """<!doctype html>
<title>Play {appendtourl}</title>
<video controls autoplay>
    <source src="{appendtourl}" type="video/mp4" >
    Your browser does not support this video format.
</video>""".format(appendtourl=appendtourl)


"""
The code below is supposed to kill the Flask server. I don't know if it would
be useful later.
"""
"""
def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@app.route('/shutdown', methods=['POST'])
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

"""
@app.route('/' + appendtourl)
def stream():
    process = Popen(command, stdout=PIPE, bufsize=-1)
    read_chunk = partial(os.read, process.stdout.fileno(), chunk_size)
    return Response(iter(read_chunk, b''), mimetype=mtype)

def start_app():
    monitor_daemon = monitor()
    monitor_daemon.start()
    app.run(host= '0.0.0.0', threaded = True)

class multi_proc(object):       # I launch ffmpeg in a different process
    def __init__(self):
        self.proc = multiprocessing.Process(target=start_app)
        self.proc.daemon = True

    def start(self):
        self.proc.start()
"""
I create a class to launch a thread in this process that monitors if main
application stops.
A normal running of mkchromecast will have 2 threads in the streaming process
when ffmpeg is used.
"""
class monitor(object):
    def __init__(self):
        self.monitor_d = threading.Thread(target=monitor_daemon)
        self.monitor_d.daemon = True

    def start(self):
        self.monitor_d.start()

def monitor_daemon():
    f = open('/tmp/mkchromecast.pid', 'rb')
    pidnumber=int(pickle.load(f))
    print(colors.options('PID of main process:')+' '+str(pidnumber))

    localpid=getpid()
    print(colors.options('PID of streaming process:')+' '+str(localpid))

    while psutil.pid_exists(localpid) == True:
        try:
            time.sleep(0.5)
            if psutil.pid_exists(pidnumber) == False:   # With this I ensure that if the main app fails, everything
                if platform == 'Darwin':                # will get back to normal
                    inputint()
                    outputint()
                else:
                    from mkchromecast.pulseaudio import remove_sink
                    remove_sink()
                parent = psutil.Process(localpid)
                for child in parent.children(recursive=True):  # or parent.children() for recursive=False
                    child.kill()
                parent.kill()
        except KeyboardInterrupt:
            print('Ctrl-c was requested')
            sys.exit(0)
        except IOError:
            print('I/O Error')
            sys.exit(0)
        except OSError:
            print('OSError')
            sys.exit(0)

def main():
    st = multi_proc()
    st.start()
