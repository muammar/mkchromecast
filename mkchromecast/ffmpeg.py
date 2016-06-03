#!/usr/bin/env python

# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import mkchromecast.__init__
from mkchromecast.audiodevices import *
import mkchromecast.colors as colors
from mkchromecast.config import *
from mkchromecast.preferences import ConfigSectionMap
import os, sys, time
from functools import partial
from subprocess import Popen, PIPE
from flask import Flask, Response, request
import multiprocessing, threading
import psutil, pickle
from os import getpid
"""
Configparser is imported differently in Python3
"""
try:
    import ConfigParser
except ImportError:
    import configparser as ConfigParser # This is for Python3

tray = mkchromecast.__init__.tray
debug = mkchromecast.__init__.debug
config = ConfigParser.RawConfigParser()
configurations = config_manager()    # Class from mkchromecast.config
configf = configurations.configf

if os.path.exists(configf) and tray == True:
    configurations.verify_config()
    config.read(configf)
    backend = ConfigSectionMap("settings")['backend']
    codec= ConfigSectionMap("settings")['codec']
    bitrate = ConfigSectionMap("settings")['bitrate']
    samplerate= ConfigSectionMap("settings")['samplerate']
    if debug == True:
        print (':::ffmpeg::: tray ='+str(tray))
        print(colors.warning('Configuration file exist'))
        print(colors.warning('Using defaults set there'))
        print(backend,codec,bitrate,samplerate)
else:
    backend = mkchromecast.__init__.backend
    codec = mkchromecast.__init__.codec
    bitrate = str(mkchromecast.__init__.bitrate)
    samplerate = str(mkchromecast.__init__.samplerate)

backends = ['ffmpeg', 'avconv', 'parec']
backends_dict = { }
if tray == True and backend in backends:
    import os, getpass
    import subprocess
    USER = getpass.getuser()
    PATH ='./bin:./nodejs/bin:/Users/'+str(USER)+'/bin:/usr/local/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/X11/bin:/usr/games:'+ os.environ['PATH']
    iterate = PATH.split(':')
    for item in iterate:
        verifyif = str(item+'/'+backend)
        if os.path.exists(verifyif) == False:
            continue
        else:
            backends_dict[verifyif] = backend
            backend = verifyif
            if debug == True:
                print (':::ffmpeg::: Program '+str(backend)+' found in '+str(verifyif))
                print (':::ffmpeg::: backend dictionary '+str(backends_dict))

appendtourl = 'stream'

if  codec == 'mp3':
    appendmtype = 'mpeg'
elif codec == 'aac':
    appendmtype = 'mp4' #This is the container used for aac
else:
    appendmtype = codec

mtype = 'audio/'+appendmtype

print (colors.options('Selected backend:')+' '+ backend)
print (colors.options('Selected audio codec:')+' '+ codec)

if backend != 'node':
    if bitrate == '192':
        bitrate = bitrate+'k'
        print (colors.options('Default bitrate used:')+' '+ bitrate)
    elif bitrate == 'None':
        print (colors.warning('The '+codec+' codec does not require the bitrate argument.'))
    else:
        if codec == 'mp3' and int(bitrate) > 320:
            print (colors.warning('Maximum bitrate supported by '+codec+' is: '+str(320)+'k.'))
            print (colors.warning('You may try lossless audio coding formats.'))
            bitrate = '320'
            print (colors.warning('Bitrate has been set to maximum!'))

        if codec == 'ogg' and int(bitrate) > 500:
            print (colors.warning('Maximum bitrate supported by '+codec+' is: '+str(500)+'k.'))
            print (colors.warning('You may try lossless audio coding formats.'))
            bitrate = '500'
            print (colors.warning('Bitrate has been set to maximum!'))

        if codec == 'aac' and int(bitrate) > 500:
            print (colors.warning('Maximum bitrate supported by '+codec+' is: '+str(500)+'k.'))
            print (colors.warning('At about 128-256k is already considered as "transparent" for '+codec+'.'))
            print (colors.warning('You may try lossless audio coding formats.'))
            bitrate = '500'
            print (colors.warning('Bitrate has been set to maximum!'))

        bitrate = bitrate+'k'
        print (colors.options('Selected bitrate:')+' '+ bitrate)

    if samplerate == '44100':
        print (colors.options('Default sample rate used:')+' '+ samplerate+'Hz')
    else:
        codecs_sr = ['mp3', 'ogg', 'aac', 'wav', 'flac']
        if codec in codecs_sr and int(samplerate) < 41000 and int(samplerate) > 36000:
            print (colors.warning('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz'))
            samplerate = '44100'
            print (colors.warning('Sample rate has been set to default!'))

        elif codec in codecs_sr and int(samplerate) < 36000 and int(samplerate) > 32000:
            print (colors.warning('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz'))
            samplerate = '32000'

        elif codec in codecs_sr and int(samplerate) < 32000 and int(samplerate) > 27050:
            print (colors.warning('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz'))
            samplerate = '32000'

        elif codec in codecs_sr and int(samplerate) < 27050 and int(samplerate) > 22000:
            print (colors.warning('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz'))
            samplerate = '22050'

        elif codec in codecs_sr and int(samplerate) > 41000:
            print (colors.warning('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz'))
            samplerate = '44800'
            print (colors.warning('Sample rate has been set to maximum!'))

        print (colors.options('Sample rate set to:')+' '+samplerate+'Hz')

"""
We verify platform and other options
"""
platform = mkchromecast.__init__.platform

def debug_command():                # This function add some more flags to the ffmpeg command
    command.insert(1, '-loglevel')  # when user passes --debug option.
    command.insert(2, 'panic')
    return

"""
MP3 192k
"""
if  codec == 'mp3':

    if platform == 'Linux' and backends_dict[backend] != 'parec':
        command = [backend, '-re', '-ac', '2', '-ar', '44100', '-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'libmp3lame', '-f', 'mp3', '-ac', '2', '-ar', samplerate, '-b:a', bitrate,'pipe:']
    elif platform == 'Linux' and backends_dict[backend] == 'parec':
        command = ['lame', '-b', bitrate[:-1], '-r', '-']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'libmp3lame', '-f', 'mp3', '-ac', '2', '-ar', samplerate, '-b:a', bitrate,'pipe:']
    if debug == False and backend != 'parec':
        debug_command()

"""
OGG 192k
"""
if  codec == 'ogg':
    if platform == 'Linux' and backends_dict[backend] != 'parec':
        command = [backend, '-re', '-ac', '2', '-ar', '44100','-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'libvorbis', '-f', 'ogg', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'pipe:']
    elif platform == 'Linux' and backends_dict[backend] == 'parec':
        command = ['oggenc', '-b', bitrate[:-1], '-Q', '-r', '--ignorelength', '-']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'libvorbis', '-f', 'ogg', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'pipe:']
    if debug == False:
        debug_command()

"""
AAC > 128k for Stereo, Default sample rate: 44100kHz
"""
if  codec == 'aac':
    if platform == 'Linux' and backends_dict[backend] != 'parec':
        command = [backend, '-re', '-ac', '2', '-ar', '44100','-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'aac', '-f', 'adts', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'-cutoff', '18000', 'pipe:']
    elif platform == 'Linux' and backends_dict[backend] == 'parec':
        command = ['faac', '-b', bitrate[:-1], '-X', '-P', '-o', '-', '-']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'libfdk_aac', '-f', 'adts', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'-cutoff', '18000', 'pipe:']
    if debug == False:
        debug_command()

"""
WAV 24-Bit
"""
if  codec == 'wav':
    if platform == 'Linux' and backends_dict[backend] != 'parec':
        command = [backend, '-re', '-ac', '2', '-ar', '44100','-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'pcm_s24le', '-f', 'wav', '-ac', '2', '-ar', samplerate, 'pipe:']
    elif platform == 'Linux' and backends_dict[backend] == 'parec':
        command = ['sox', '-t', 'raw', '-b', '16', '-e', 'signed', '-c', '2', '-r', samplerate, '-', '-t', 'wav', \
                    '-b', '16', '-e', 'signed', '-c', '2', '-r', samplerate, '-L', '-']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'pcm_s24le', '-f', 'wav', '-ac', '2', '-ar', samplerate, 'pipe:']
    if debug == False:
        debug_command()

"""
FLAC 24-Bit (values taken from: https://trac.ffmpeg.org/wiki/Encode/HighQualityAudio) except for parec.
"""
if  codec == 'flac':
    if platform == 'Linux' and backends_dict[backend] != 'parec':
        command = [backend, '-re', '-ac', '2', '-ar', '44100','-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'flac', '-f', 'flac','-ac', '2', '-ar', samplerate, 'pipe:']
    elif platform == 'Linux' and backends_dict[backend] == 'parec':
        command = ['flac', '-', '-c', '--channels', '2', '--bps', '16', '--sample-rate', samplerate, \
                    '--endian', 'little', '--sign', 'signed', '-s']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'flac', '-f', 'flac','-ac', '2', '-ar', samplerate, 'pipe:']
    if debug == False:
        debug_command()

app = Flask(__name__)

if debug == True:
    print (':::ffmpeg::: command '+str(command))

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
    if platform == 'Linux' and backends_dict[backend] == 'parec':
        c_parec = [backend, '--format=s16le', '-d', 'mkchromecast.monitor']
        parec = Popen(c_parec, stdout=PIPE)
        process = Popen(command, stdin=parec.stdout, stdout=PIPE, bufsize=-1)
    else:
        process = Popen(command, stdout=PIPE, bufsize=-1)
    read_chunk = partial(os.read, process.stdout.fileno(), 1024)
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
    print (colors.options('PID of main process:')+' '+str(pidnumber))

    localpid=getpid()
    print (colors.options('PID of streaming process:')+' '+str(localpid))

    while psutil.pid_exists(localpid) == True:
        try:
            time.sleep(0.5)
            if psutil.pid_exists(pidnumber) == False:   # With this I ensure that if the main app fails, everything
                inputint()                              # will get back to normal
                outputint()
                parent = psutil.Process(localpid)
                for child in parent.children(recursive=True):  # or parent.children() for recursive=False
                    child.kill()
                parent.kill()
        except KeyboardInterrupt:
            print ("Ctrl-c was requested")
            sys.exit(0)
        except IOError:
            print ("I/O Error")
            sys.exit(0)
        except OSError:
            print ("OSError")
            sys.exit(0)

def main():
    st = multi_proc()
    st.start()
