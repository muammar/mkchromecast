#!/usr/bin/env python

# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import mkchromecast.__init__
from mkchromecast.audiodevices import *
import os, sys, time
from functools import partial
from subprocess import Popen, PIPE
from flask import Flask, Response
import multiprocessing, threading
import psutil, pickle
from os import getpid

mp3file = 'stream'

backend = mkchromecast.__init__.backend
codec = mkchromecast.__init__.codec
bitrate = str(mkchromecast.__init__.bitrate)
samplerate = str(mkchromecast.__init__.samplerate)

if  codec == 'mp3':
    appendmtype = 'mpeg'
elif codec == 'aac':
    appendmtype = 'mp4' #This is the container used
else:
    appendmtype = codec

mtype = 'audio/'+appendmtype

print ('Selected backend: ', backend)
print ('Selected audio codec: ', codec)

if backend != 'node':
    if bitrate == '192':
        bitrate = bitrate+'k'
        print ('Default bitrate used: ', bitrate)
    elif bitrate == 'None':
        print ('The '+codec+' codec does not require the bitrate argument')
    else:
        if codec == 'mp3' and int(bitrate) > 320:
            print ('Maximum bitrate supported by '+codec+' is: '+str(320)+'k')
            bitrate = '320'
            print ('Bitrate has been set to maximum!')

        if codec == 'ogg' and int(bitrate) > 500:
            print ('Maximum bitrate supported by '+codec+' is: '+str(500)+'k')
            bitrate = '500'
            print ('Bitrate has been set to maximum!')

        if codec == 'aac' and int(bitrate) > 500:
            print ('Maximum bitrate supported by '+codec+' is: '+str(500)+'k')
            print ('Note that about 128-256k is considered "transparent" for '+codec)
            bitrate = '500'
            print ('Bitrate has been set to maximum!')

        bitrate = bitrate+'k'
        print ('Selected bitrate: ', bitrate)

    if samplerate == '44100':
        print ('Default sample rate used: ', samplerate+'Hz')
    else:
        codecs_sr = ['mp3', 'ogg', 'aac', 'wav', 'flac']
        if codec in codecs_sr and int(samplerate) < 41000 and int(samplerate) > 36000:
            print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
            samplerate = '44100'
            print ('Sample rate has been set to default!')

        elif codec in codecs_sr and int(samplerate) < 36000 and int(samplerate) > 32000:
            print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
            samplerate = '32000'

        elif codec in codecs_sr and int(samplerate) < 32000 and int(samplerate) > 27050:
            print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
            samplerate = '32000'

        elif codec in codecs_sr and int(samplerate) < 27050 and int(samplerate) > 22000:
            print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
            samplerate = '22050'

        elif codec in codecs_sr and int(samplerate) > 41000:
            print ('Sample rates supported by '+codec+' are: '+str(22050)+'Hz, '+', '+str(32000)+'Hz, '+str(44100)+'Hz or '+str(44800)+'Hz')
            samplerate = '44800'
            print ('Sample rate has been set to maximum!')
        print ('Selected sample rate: ', samplerate+'Hz')



platform = mkchromecast.__init__.platform
debug = mkchromecast.__init__.debug

def debug_command():
    command.insert(1, '-loglevel')
    command.insert(2, 'panic')
    return

"""
MP3 192k
"""
if  codec == 'mp3':

    if platform == 'Linux':
        command = [backend, '-re', '-ac', '2', '-ar', '44100', '-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'libmp3lame', '-f', 'mp3', '-ac', '2', '-ar', samplerate, '-b:a', bitrate,'pipe:']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'libmp3lame', '-f', 'mp3', '-ac', '2', '-ar', samplerate, '-b:a', bitrate,'pipe:']
    if debug == False:
        debug_command()

"""
OGG 192k
"""
if  codec == 'ogg':
    if platform == 'Linux':
        command = [backend, '-re', '-ac', '2', '-ar', '44100','-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'libvorbis', '-f', 'ogg', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'pipe:']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'libvorbis', '-f', 'ogg', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'pipe:']
    if debug == False:
        debug_command()

"""
AAC > 128k for Stereo, Default sample rate: 44100kHz
"""
if  codec == 'aac':
    if platform == 'Linux':
        command = [backend, '-re', '-ac', '2', '-ar', '44100','-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'aac', '-f', 'adts', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'-cutoff', '18000', 'pipe:']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'libfdk_aac', '-f', 'adts', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'-cutoff', '18000', 'pipe:']
    if debug == False:
        debug_command()

"""
WAV 24-Bit
"""
if  codec == 'wav':
    if platform == 'Linux':
        command = [backend, '-re', '-ac', '2', '-ar', '44100','-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'pcm_s24le', '-f', 'wav', '-ac', '2', '-ar', samplerate, 'pipe:']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'pcm_s24le', '-f', 'wav', '-ac', '2', '-ar', samplerate, 'pipe:']
    if debug == False:
        debug_command()

"""
FLAC 24-Bit (values taken from: https://trac.ffmpeg.org/wiki/Encode/HighQualityAudio)
"""
if  codec == 'flac':
    if platform == 'Linux':
        command = [backend, '-re', '-ac', '2', '-ar', '44100','-f', 'pulse', '-i', 'mkchromecast.monitor', \
                    '-acodec', 'flac', '-f', 'flac','-ac', '2', '-ar', samplerate, 'pipe:']
    else:
        command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                    '-acodec', 'flac', '-f', 'flac','-ac', '2', '-ar', samplerate, 'pipe:']
                    #'-acodec', 'flac', '-f', 'flac','-ac', '2', '-ar', samplerate, '-q:a', '330', '-cutoff', '15000', 'pipe:']
    if debug == False:
        debug_command()

app = Flask(__name__)

@app.route('/')
def index():
    return """<!doctype html>
<title>Play {mp3file}</title>
<audio controls autoplay >
    <source src="{mp3file}" type="audio/mp3" >
    Your browser does not support this audio format.
</audio>""".format(mp3file=mp3file)


@app.route('/' + mp3file)
def stream():
    process = Popen(command, stdout=PIPE, bufsize=-1)
    read_chunk = partial(os.read, process.stdout.fileno(), 1024)
    return Response(iter(read_chunk, b''), mimetype=mtype)

def start_app():
    monitor_daemon = monitor()
    monitor_daemon.start()
    app.run(host= '0.0.0.0')

class multi_proc(object):
    def __init__(self):
        self.proc = multiprocessing.Process(target=start_app)
        self.proc.daemon = True
        self.monitor_d = threading.Thread(target=monitor)
        self.monitor_d.daemon = True

    def start(self):
        self.proc.start()
        self.monitor_d.start()

class monitor(object):
    def __init__(self):
        self.monitor_d = threading.Thread(target=monitor_daemon)
        self.monitor_d.daemon = True

    def start(self):
        self.monitor_d.start()

def monitor_daemon():
    f = open('/tmp/mkcrhomecast.pid', 'rb')
    pidnumber=int(pickle.load(f))
    print ('PID of main process: ', pidnumber)

    localpid=getpid()
    print ('PID of streaming process: ', localpid)

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
