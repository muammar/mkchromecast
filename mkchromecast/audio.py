#!/usr/bin/env python

# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import mkchromecast.__init__
from mkchromecast.audiodevices import *
import mkchromecast.colors as colors
from mkchromecast.config import *
import mkchromecast.messages as msg
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

"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser # This is for Python3

backends_dict = {}


"""
In this block we check variables from __init__.py
"""
tray = mkchromecast.__init__.tray
adevice = mkchromecast.__init__.adevice
chunk_size = mkchromecast.__init__.chunk_size
segmenttime = mkchromecast.__init__.segmenttime

if debug == True:
    print(':::audio::: chunk_size: ', chunk_size)
debug = mkchromecast.__init__.debug
sourceurl = mkchromecast.__init__.sourceurl
config = ConfigParser.RawConfigParser()
configurations = config_manager()    # Class from mkchromecast.config
configf = configurations.configf
appendtourl = 'stream'

try:
    youtubeurl = mkchromecast.__init__.youtubeurl
except AttributeError:
    youtubeurl = None

# This is to take the youtube URL
if youtubeurl != None:
    print(colors.options('The Youtube URL chosen:')+' '+youtubeurl)

    try:
        import urlparse
        url_data = urlparse.urlparse(youtubeurl)
        query = urlparse.parse_qs(url_data.query)
    except ImportError:
        import urllib.parse
        url_data = urllib.parse.urlparse(youtubeurl)
        query = urllib.parse.parse_qs(url_data.query)
    video = query['v'][0]
    print(colors.options('Playing video:')+' '+video)
    command = [
        'youtube-dl',
        '-o',
        '-',
        youtubeurl
        ]
    mtype = 'audio/mp4'
else:
    if os.path.exists(configf) and tray == True:
        configurations.chk_config()
        config.read(configf)
        backend = ConfigSectionMap('settings')['backend']
        backends_dict[backend] = backend
        codec= ConfigSectionMap('settings')['codec']
        bitrate = ConfigSectionMap('settings')['bitrate']
        samplerate= ConfigSectionMap('settings')['samplerate']
        adevice = ConfigSectionMap('settings')['alsadevice']
        if debug == True:
            print(':::audio::: tray ='+str(tray))
            print(colors.warning('Configuration file exists'))
            print(colors.warning('Using defaults set there'))
            print(backend, codec, bitrate, samplerate, adevice)
    else:
        backend = mkchromecast.__init__.backend
        backends_dict[backend] = backend
        codec = mkchromecast.__init__.codec
        bitrate = str(mkchromecast.__init__.bitrate)
        samplerate = str(mkchromecast.__init__.samplerate)

    backends = [
        'ffmpeg',
        'avconv',
        'parec'
        ]
    if tray == True and backend in backends:
        import os, getpass
        import subprocess
        USER = getpass.getuser()
        PATH = './bin:./nodejs/bin:/Users/' \
        +str(USER) \
        +'/bin:/usr/local/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/X11/bin:/usr/games:' \
        +os.environ['PATH']

        iterate = PATH.split(':')
        for item in iterate:
            verifyif = str(item+'/'+backend)
            if os.path.exists(verifyif) == False:
                continue
            else:
                backends_dict[verifyif] = backend
                backend = verifyif
                if debug == True:
                    print(':::audio::: Program '+str(backend)+' found in '+str(verifyif))
                    print(':::audio::: backend dictionary '+str(backends_dict))

    if codec == 'mp3':
        appendmtype = 'mpeg'
    elif codec == 'aac':
        appendmtype = 'mp4' #This is the container used for aac
    else:
        appendmtype = codec

    mtype = 'audio/'+appendmtype

    if sourceurl == None:
        print(colors.options('Selected backend:')+' '+ backend)
        print(colors.options('Selected audio codec:')+' '+ codec)

    if backend != 'node':
        if bitrate == '192':
            bitrate = bitrate+'k'
            msg.bitrate_default(bitrate)
        elif bitrate == 'None':
            msg.no_bitrate(codec)
        else:
            if codec == 'mp3' and int(bitrate) > 320:
                bitrate = '320'
                msg.maxbitrate(codec, bitrate)
            elif codec == 'ogg' and int(bitrate) > 500:
                bitrate = '500'
                msg.maxbitrate(codec, bitrate)
            elif codec == 'aac' and int(bitrate) > 500:
                bitrate = '500'
                msg.maxbitrate(codec, bitrate)
            else:
                bitrate = bitrate+'k'

            if sourceurl == None:
                print(colors.options('Selected bitrate:')+' '+ bitrate)

        if samplerate == '44100':
            msg.samplerate_default(samplerate)
        else:
            codecs_sr = [
                'mp3',
                'ogg',
                'aac',
                'wav',
                'flac'
                ]

            """
            The codecs below do not support 96000Hz
            """
            no96k = [
                'mp3',
                'ogg'
                ]

            if codec in codecs_sr and int(samplerate) > 22000 and int(samplerate) <= 27050:
                samplerate = '22050'
                if codec in no96k:
                    msg.samplerate_no96(codec)
                else:
                    msg.samplerate_info(codec)

            if codec in codecs_sr and int(samplerate) > 27050 and int(samplerate) <= 32000:
                samplerate = '32000'
                if codec in no96k:
                    msg.samplerate_no96(codec)
                else:
                    msg.samplerate_info(codec)

            elif codec in codecs_sr and int(samplerate) > 32000 and int(samplerate) <= 36000:
                samplerate = '32000'
                if codec in no96k:
                    msg.samplerate_no96(codec)
                else:
                    msg.samplerate_info(codec)

            elif codec in codecs_sr and int(samplerate) > 36000 and int(samplerate) <= 43000:
                samplerate = '44100'
                if codec in no96k:
                    msg.samplerate_no96(codec)
                else:
                    msg.samplerate_info(codec)
                if sourceurl == None:
                    print(colors.warning('Sample rate has been set to default!'))

            elif codec in codecs_sr and int(samplerate) > 43000 and int(samplerate) <= 72000:
                samplerate = '48000'
                if codec in no96k:
                    msg.samplerate_no96(codec)
                else:
                    msg.samplerate_info(codec)

            elif codec in codecs_sr and int(samplerate) > 72000:
                if codec in no96k:
                    samplerate = '48000'
                    msg.samplerate_no96(codec)
                else:
                    samplerate = '96000'
                    msg.samplerate_info(codec)

                if sourceurl == None:
                    print(colors.warning('Sample rate has been set to maximum!'))

            if sourceurl == None:
                print(colors.options('Sample rate set to:')+' '+samplerate+'Hz')

    """
    We verify platform and other options
    """
    platform = mkchromecast.__init__.platform

    def debug_command():                # This function add some more flags to the ffmpeg command
        command.insert(1, '-loglevel')  # when user passes --debug option.
        command.insert(2, 'panic')
        return

    def modalsa():
        command[command.index('pulse')] = 'alsa'
        command[command.index('mkchromecast.monitor')] = adevice
        print (command)
        return

    def setsegmenttime():
        string = [ '-f', 'segment', '-segment_time', str(segmenttime) ]
        for element in string:
            command.insert(-9, element)
        return

    """
    MP3 192k
    """
    if  codec == 'mp3':

        if platform == 'Linux' and backends_dict[backend] != 'parec' and backends_dict[backend] != 'gstreamer':
            command = [
                backend,
                '-ac', '2',
                '-ar', '44100',
                '-f', 'pulse',
                '-i', 'mkchromecast.monitor',
                '-acodec', 'libmp3lame',
                '-f', 'mp3',
                '-ac', '2',
                '-ar', samplerate,
                '-b:a', bitrate,
                'pipe:'
                ]
            if adevice != None:
                modalsa()

            if segmenttime != None:
                setsegmenttime()

        elif platform == 'Linux' and backends_dict[backend] == 'parec' or backends_dict[backend] == 'gstreamer':
            command = [
                'lame',
                '-b', bitrate[:-1],
                '-r',
                '-'
                ]
            """
        This command dumps to file correctly, but does not work for stdout.
        elif platform == 'Linux' and backends_dict[backend] == 'gstreamer':
            command = [
                'gst-launch-1.0',
                '-v',
                '!',
                'audioconvert',
                '!',
                'audio/x-raw,rate='+samplerate,
                '!',
                'lamemp3enc',
                'target=bitrate',
                'bitrate='+bitrate[:-1],
                'cbr=true',
                '!',
                'mpegaudioparse',
                '!',
                'filesink', 'location=/dev/stdout'
                ]
            if adevice != None:
                command.insert(2, 'alsasrc')
                command.insert(3, 'device="'+adevice+'"')
            else:
                command.insert(2, 'pulsesrc')
                command.insert(3, 'device="mkchromecast.monitor"')
            """
        else:
            command = [
                backend,
                '-f', 'avfoundation',
                '-audio_device_index', '0',
                '-i', '',
                '-acodec', 'libmp3lame',
                '-f', 'mp3',
                '-ac', '2',
                '-ar', samplerate,
                '-b:a', bitrate,
                'pipe:'
                ]
            if segmenttime != None:
                setsegmenttime()

    """
    OGG 192k
    """
    if  codec == 'ogg':
        if platform == 'Linux' and backends_dict[backend] != 'parec' and backends_dict[backend] != 'gstreamer':
            command = [
                backend,
                '-ac', '2',
                '-ar', '44100',
                '-f', 'pulse',
                '-i', 'mkchromecast.monitor',
                '-acodec', 'libvorbis',
                '-f', 'ogg',
                '-ac', '2',
                '-ar', samplerate,
                '-b:a', bitrate,
                'pipe:'
                ]
            if adevice != None:
                modalsa()

            if segmenttime != None:
                setsegmenttime()

        elif platform == 'Linux' and backends_dict[backend] == 'parec' or backends_dict[backend] == 'gstreamer':
            command = [
                'oggenc',
                '-b', bitrate[:-1],
                '-Q',
                '-r',
                '--ignorelength',
                '-'
                ]
            """
        This command dumps to file correctly, but does not work for stdout.
        elif platform == 'Linux' and backends_dict[backend] == 'gstreamer':
            command = [
                'gst-launch-1.0',
                '!',
                'audioconvert',
                '!',
                'audioresample',
                '!',
                'vorbisenc',
                #'bitrate='+str(int(bitrate[:-1])*1000),
                '!',
                'vorbisparse',
                '!',
                'oggmux',
                '!',
                'filesink', 'location=/dev/stdout'
                #gst-launch-1.0 pulsesrc device="mkchromecast.monitor" ! audioconvert ! audioresample ! vorbisenc ! oggmux ! filesink
                ]
            if adevice != None:
                command.insert(1, 'alsasrc')
                command.insert(2, 'device="'+adevice+'"')
            else:
                command.insert(1, 'pulsesrc')
                command.insert(2, 'device="mkchromecast.monitor"')
            """
        else:
            command = [
                backend,
                '-f', 'avfoundation',
                '-audio_device_index', '0',
                '-i', '',
                '-acodec', 'libvorbis',
                '-f', 'segment', '-segment_time', '2',
                '-f', 'ogg',
                '-ac', '2',
                '-ar', samplerate,
                '-b:a', bitrate,
                'pipe:'
                ]

    """
    AAC > 128k for Stereo, Default sample rate: 44100kHz
    """
    if  codec == 'aac':
        if platform == 'Linux' and backends_dict[backend] != 'parec' and backends_dict[backend] != 'gstreamer':
            command = [
                backend,
                '-ac', '2',
                '-ar', '44100',
                '-f', 'pulse',
                '-i', 'mkchromecast.monitor',
                '-acodec', 'aac',
                '-f', 'adts',
                '-ac', '2',
                '-ar', samplerate,
                '-b:a', bitrate,
                '-cutoff', '18000',
                'pipe:'
                ]
            if adevice != None:
                modalsa()

            if segmenttime != None:
                setsegmenttime()

        elif platform == 'Linux' and backends_dict[backend] == 'parec' or backends_dict[backend] == 'gstreamer':
            command = [
                'faac',
                '-b', bitrate[:-1],
                '-X',
                '-P',
                '-c','18000',
                '-o',
                '-',
                '-'
                ]
            """
        This command dumps to file correctly, but does not work for stdout.
        elif platform == 'Linux' and backends_dict[backend] == 'gstreamer':
            command = [
                'gst-launch-1.0',
                '-v',
                '!',
                'audioconvert',
                '!',
                'audio/x-raw,rate='+samplerate,
                '!',
                'voaacenc',
                #'bitrate='+bitrate[:-1],
                '!',
                'aacparse',
                '!',
                'filesink', 'location=/dev/stdout'
                ]
            if adevice != None:
                command.insert(2, 'alsasrc')
                command.insert(3, 'device="'+adevice+'"')
            else:
                command.insert(2, 'pulsesrc')
                command.insert(3, 'device="mkchromecast.monitor"')
            """
        else:
            command = [
                backend,
                '-f', 'avfoundation',
                '-audio_device_index', '0',
                '-i', '',
                '-acodec', 'libfdk_aac',
                '-f', 'adts',
                '-ac', '2',
                '-ar', samplerate,
                '-b:a', bitrate,
                '-cutoff', '18000',
                'pipe:'
                ]
            if segmenttime != None:
                setsegmenttime()

    """
    WAV 24-Bit
    """
    if  codec == 'wav':
        if platform == 'Linux' and backends_dict[backend] != 'parec':
            command = [
                backend,
                '-ac', '2',
                '-ar', '44100',
                '-f', 'pulse',
                '-i', 'mkchromecast.monitor',
                '-acodec', 'pcm_s24le',
                '-f', 'wav',
                '-ac', '2',
                '-ar', samplerate,
                'pipe:'
                ]
            if adevice != None:
                modalsa()

            if segmenttime != None:
                setsegmenttime()

        elif platform == 'Linux' and backends_dict[backend] == 'parec' or backends_dict[backend] == 'gstreamer':
            command = [
                'sox',
                '-t', 'raw',
                '-b', '16',
                '-e', 'signed',
                '-c', '2',
                '-r', samplerate,
                '-',
                '-t', 'wav',
                '-b', '16',
                '-e', 'signed',
                '-c', '2',
                '-r', samplerate,
                '-L', '-'
                ]
        else:
            command = [
                backend,
                '-f', 'avfoundation',
                '-audio_device_index', '0',
                '-i', '',
                '-acodec', 'pcm_s24le',
                '-f', 'wav',
                '-ac', '2',
                '-ar', samplerate,
                'pipe:'
                ]
            if segmenttime != None:
                setsegmenttime()

    """
    FLAC 24-Bit (values taken from: https://trac.ffmpeg.org/wiki/Encode/HighQualityAudio) except for parec.
    """
    if  codec == 'flac':
        if platform == 'Linux' and backends_dict[backend] != 'parec':
            command = [
                backend,
                '-ac', '2',
                '-ar', '44100',
                '-f', 'pulse',
                '-i', 'mkchromecast.monitor',
                '-acodec', 'flac',
                '-f', 'flac',
                '-ac', '2',
                '-ar', samplerate,
                'pipe:'
                ]
            if adevice != None:
                modalsa()

            if segmenttime != None:
                setsegmenttime()

        elif platform == 'Linux' and backends_dict[backend] == 'parec' or backends_dict[backend] == 'gstreamer':
            command = [
                'flac',
                '-',
                '-c',
                '--channels', '2',
                '--bps', '16',
                '--sample-rate', samplerate,
                '--endian', 'little',
                '--sign', 'signed',
                '-s'
                ]
        else:
            command = [
                backend,
                '-f', 'avfoundation',
                '-audio_device_index', '0',
                '-i', '',
                '-acodec', 'flac',
                '-f', 'flac',
                '-ac', '2',
                '-ar', samplerate,
                'pipe:'
                ]
            if segmenttime != None:
                setsegmenttime()

if debug == False and backends_dict[backend] != 'parec' and backends_dict[backend] != 'gstreamer':
    debug_command()

app = Flask(__name__)

if debug == True:
    print(':::audio::: command '+str(command))

@app.route('/')
def index():
    return """<!doctype html>
<title>Play {appendtourl}</title>
<audio controls autoplay >
    <source src="{appendtourl}" type="audio/mp3" >
    Your browser does not support this audio format.
</audio>""".format(appendtourl=appendtourl)


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
    if platform == 'Linux' and bool(backends_dict) == True \
            and backends_dict[backend] == 'parec':
        c_parec = [
            backend,
            '--format=s16le',
            '-d', 'mkchromecast.monitor'
            ]
        parec = Popen(c_parec, stdout=PIPE)
        process = Popen(command, stdin=parec.stdout, stdout=PIPE, bufsize=-1)
    elif platform == 'Linux' and bool(backends_dict) == True \
            and backends_dict[backend] == 'gstreamer':
        c_gst = [
            'gst-launch-1.0',
            '-v',
            '!',
            'audioconvert',
            '!',
            'filesink', 'location=/dev/stdout'
            ]
        if adevice != None:
            c_gst.insert(2, 'alsasrc')
            c_gst.insert(3, 'device="'+adevice+'"')
        else:
            c_gst.insert(2, 'pulsesrc')
            c_gst.insert(3, 'device="mkchromecast.monitor"')
        gst = Popen(c_gst, stdout=PIPE)
        process = Popen(command, stdin=gst.stdout, stdout=PIPE, bufsize=-1)
    else:
        process = Popen(command, stdout=PIPE, bufsize=-1)
    read_chunk = partial(os.read, process.stdout.fileno(), chunk_size)
    return Response(iter(read_chunk, b''), mimetype=mtype)

def start_app():
    monitor_daemon = monitor()
    monitor_daemon.start()
    app.run(host= '0.0.0.0')

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
