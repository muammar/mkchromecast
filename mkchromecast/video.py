#!/usr/bin/env python

# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import mkchromecast.__init__
from mkchromecast.audio_devices import inputint, outputint
import mkchromecast.colors as colors
from mkchromecast.utils import terminate, is_installed, check_file_info
from mkchromecast.resolution import resolution
import psutil
import getpass
import pickle
import sys
import time
from functools import partial
from subprocess import Popen, PIPE
from flask import Flask, Response
import multiprocessing
import threading
import os
from os import getpid

appendtourl = 'stream'
USER = getpass.getuser()

chunk_size = mkchromecast.__init__.chunk_size
user_command = mkchromecast.__init__.command
platform = mkchromecast.__init__.platform
subtitles = mkchromecast.__init__.subtitles
input_file = mkchromecast.__init__.input_file
res = mkchromecast.__init__.resolution
seek = mkchromecast.__init__.seek
debug = mkchromecast.__init__.debug
sourceurl = mkchromecast.__init__.sourceurl
encoder_backend = mkchromecast.__init__.backend
screencast = mkchromecast.__init__.screencast
port = mkchromecast.__init__.port
loop = mkchromecast.__init__.loop
mtype = mkchromecast.__init__.mtype

try:
    if input_file[-3:] == 'mkv':
        mkv = True
    else:
        mkv = False
except TypeError:
    mkv = False

try:
    youtubeurl = mkchromecast.__init__.youtubeurl
except AttributeError:
    youtubeurl = None


def seeking(seek):
    seek_append = ['-ss', seek]
    for i, _ in enumerate(seek_append):
        command.insert(i + 1, _)
    return

""" This command is not working I found this:
http://stackoverflow.com/questions/12801192/client-closes-connection-when-streaming-m4v-from-apache-to-chrome-with-jplayer.
I think that the command below is sending a file that is too big and the
browser closes the connection.
"""
if youtubeurl is not None:
    command = [
        'youtube-dl',
        '-o',
        '-',
        youtubeurl
        ]

elif screencast is True:
    if res is None:
        screen_size = resolution('1080p', screencast)
    else:
        screen_size = resolution(res, screencast)
    command = [
            'ffmpeg',
            '-ac', '2',
            '-ar', '44100',
            '-frame_size', '2048',
            '-fragment_size', '2048',
            '-f', 'pulse',
            '-ac', '2',
            '-i', 'Mkchromecast.monitor',
            '-f', 'x11grab',
            '-r', '25',
            '-s', screen_size,
            '-i', ':0.0+0,0',
            '-vcodec', 'libx264',
            '-preset', 'ultrafast',
            '-tune', 'zerolatency',
            '-maxrate', '10000k',
            '-bufsize', '20000k',
            '-pix_fmt', 'yuv420p',
            '-g', '60',  # '-c:a', 'copy', '-ac', '2',
            # '-b', '900k',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe+empty_moov',
            '-ar', '44100',
            '-acodec', 'libvorbis',
            'pipe:1'
            ]
else:
    """
    The blocks shown below are related to input_files
    """

    if input_file is not None and subtitles is None and mkv is False:
        # Command taken from
        # https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#Streamingafile
        command = [
            'ffmpeg',
            '-re',
            '-i', input_file,
            '-map_chapters', '-1',
            '-vcodec', 'libx264',
            '-preset', 'ultrafast',
            '-tune', 'zerolatency',
            '-maxrate', '10000k',
            '-bufsize', '20000k',
            '-pix_fmt', 'yuv420p',
            '-g', '60',
            # '-b', '900k',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe+empty_moov',
            'pipe:1'
        ]

    elif input_file is not None and subtitles is None and mkv is True:
        # Command taken from
        # https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#Streamingafile
        command = [
            'ffmpeg',
            '-re',
            '-i', input_file,
            '-map_chapters', '-1',
            '-vcodec', 'copy',
            '-acodec', 'libmp3lame',
            '-q:a', '0',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe+empty_moov',
            'pipe:1'
        ]

        bit_depth = check_file_info(input_file, what='bit-depth')
        if bit_depth == 'yuv420p10le':
            vcodec_index = command.index('-vcodec') + 1
            command[vcodec_index] = 'libx264'

    elif input_file is not None and subtitles is not None and mkv is False:
        # Command taken from
        # https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#Streamingafile
        command = [
            'ffmpeg',
            '-re',
            '-i', input_file,
            '-map_chapters', '-1',
            '-vcodec', 'libx264',
            '-preset', 'ultrafast',
            '-tune', 'zerolatency',
            '-maxrate', '10000k',
            '-bufsize', '20000k',
            '-pix_fmt', 'yuv420p',
            '-g', '60',
            # '-b', '900k',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe+empty_moov',
            '-vf', 'subtitles=' + subtitles,
            'pipe:1'
        ]

    elif input_file is not None and subtitles is not None and mkv is True:
        print(colors.warning('Subtitles with mkv are not supported yet.'))
        command = [
            'ffmpeg',
            '-re',
            '-i', input_file,
            '-i', subtitles,
            #'-map_chapters', '-1',
            '-c:v', 'copy',
            '-c:a', 'copy',
            '-c:s', 'mov_text',
            '-map', '0:0',
            '-map', '0:1',
            '-map', '1:0',
            '-preset', 'ultrafast',
            '-tune', 'zerolatency',
            '-maxrate', '10000k',
            '-bufsize', '20000k',
            '-pix_fmt', 'yuv420p',
            '-g', '60',
            '-f', 'mp4',
            '-max_muxing_queue_size', '9999',
            '-movflags', 'frag_keyframe+empty_moov',
            'pipe:1'
        ]

    if user_command is not None:
        command = user_command

    if seek is not None:
        seeking(seek)

    if debug is False and sourceurl is None:
        try:
            command.insert(command.index('-i'), 'panic')
            command.insert(command.index('panic'),  '-loglevel')
        except ValueError:
            pass

    if loop is True:
        command.insert(1, '-stream_loop')
        command.insert(2, '-1')

    if res is not None:
        cindex = command.index(input_file)
        res_elements = resolution(res, screencast)
        for element in res_elements:
            command.insert(-cindex, element)

if mtype is None:
    mtype = 'video/mp4'

app = Flask(__name__)

if debug is True:
    print(':::ffmpeg::: command: %s.' % command)


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
    app.run(host='0.0.0.0', port=port, threaded=True)


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
    pidnumber = int(pickle.load(f))
    print(colors.options('PID of main process:') + ' ' + str(pidnumber))

    localpid = getpid()
    print(colors.options('PID of streaming process:') + ' ' + str(localpid))

    while psutil.pid_exists(localpid) is True:
        try:
            time.sleep(0.5)
            # With this I ensure that if the main app fails, everything# With
            # this I ensure that if the main app fails, everything
            # will get back to normal
            if psutil.pid_exists(pidnumber) is False:
                if platform == 'Darwin':
                    inputint()
                    outputint()
                else:
                    from mkchromecast.pulseaudio import remove_sink
                    remove_sink()
                parent = psutil.Process(localpid)
                for child in parent.children(recursive=True):
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
    if encoder_backend != 'node':
        st = multi_proc()
        st.start()
    else:
        print('Starting Node')
        if platform == 'Darwin':
            PATH = './bin:./nodejs/bin:/Users/' + \
                   str(USER) + \
                   '/bin:/usr/local/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/X11/bin:/usr/games:' + \
                   os.environ['PATH']
        else:
            PATH = os.environ['PATH']

        if debug is True:
            print('PATH = %s.' % PATH)

        if platform == 'Darwin' and os.path.exists('./bin/node') is True:
            webcast = [
                './bin/node',
                './nodejs/html5-video-streamer.js',
                input_file
                ]
        elif platform == 'Linux':
            node_names = ['node', 'nodejs']
            nodejs_dir = ['./nodejs/', '/usr/share/mkchromecast/nodejs/']
            for name in node_names:
                if is_installed(name, PATH, debug) is True:
                    for path in nodejs_dir:
                        if os.path.isdir(path):
                            path = path + 'html5-video-streamer.js'
                            webcast = [
                                name,
                                path,
                                input_file
                                ]
                            break
        try:
            Popen(webcast)
        except:
            print(colors.warning('Nodejs is not installed in your system. '
                  'Please, install it to use this backend.'))
            print(colors.warning('Closing the application...'))
            terminate()
