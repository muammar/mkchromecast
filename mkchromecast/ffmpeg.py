#!/usr/bin/env python

# This file is part of mkchromecast.

"""
Google cast device has to point out to http://ip:5000/stream
"""

import mkchromecast.__init__
import os
from functools import partial
from subprocess import Popen, PIPE
from flask import Flask, Response
import multiprocessing

mp3file = 'stream'

backend = mkchromecast.__init__.backend
codec = mkchromecast.__init__.codec
bitrate = str(mkchromecast.__init__.bitrate)+'k'
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
    if bitrate == '192k':
        print ('Default bitrate used: ', bitrate)
    else:
        print ('Selected bitrate: ', bitrate)

    if samplerate == '44100':
        print ('Default sample rate used: ', samplerate+'Hz')
    else:
        print ('Selected sample rate: ', samplerate+'Hz')

"""
MP3 192k
"""
if  codec == 'mp3':
    command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                '-acodec', 'libmp3lame', '-f', 'mp3', '-ac', '2', '-ar', samplerate, '-b:a', bitrate,'pipe:']

"""
OGG 192k
"""
if  codec == 'ogg':
    command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                '-acodec', 'libvorbis', '-f', 'ogg', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'pipe:']

"""
AAC > 128k for Stereo, Default sample rate: 44100kHz
"""
if  codec == 'aac':
    command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                '-acodec', 'libfdk_aac', '-f', 'adts', '-ac', '2', '-ar', samplerate,'-b:a', bitrate,'pipe:']

"""
WAV 24-Bit
"""
if  codec == 'wav':
    command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                '-acodec', 'pcm_s24le', '-f', 'wav', '-ac', '2', '-ar', samplerate, 'pipe:']

"""
FLAC 24-Bit (values taken from: https://trac.ffmpeg.org/wiki/Encode/HighQualityAudio)
"""
if  codec == 'flac':
    command = [backend, '-re', '-f', 'avfoundation', '-audio_device_index', '0', '-i', '', \
                '-acodec', 'flac', '-f', 'flac','-ac', '2', '-ar', samplerate, '-q:a', '330', '-cutoff', '15000', 'pipe:']

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
    app.run(host= '0.0.0.0')

class multi_proc(object):
    def __init__(self):
        self.proc = multiprocessing.Process(target=start_app)
        self.proc.daemon = True

    def start(self):
        self.proc.start()

def main():
    st = multi_proc()
    st.start()
