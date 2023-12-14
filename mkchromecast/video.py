# This file is part of mkchromecast.

"""
Google Cast device has to point out to http://ip:5000/stream
"""

import getpass
import pickle
from subprocess import Popen
import os

import mkchromecast
from mkchromecast import stream_infra
from mkchromecast import utils
import mkchromecast.colors as colors
from mkchromecast.utils import terminate, is_installed, check_file_info
from mkchromecast.resolution import resolution

appendtourl = "stream"
USER = getpass.getuser()

# TODO(xsdg): Encapsulate this so that we don't do this work on import.
_mkcc = mkchromecast.Mkchromecast()

user_command = _mkcc.command
mtype = _mkcc.mtype

ip = utils.get_effective_ip(_mkcc.platform, host_override=_mkcc.host, fallback_ip="0.0.0.0")

mkv: bool
try:
    if _mkcc.input_file[-3:] == "mkv":
        mkv = True
    else:
        mkv = False
except TypeError:
    mkv = False


def seeking(seek):
    seek_append = ["-ss", seek]
    for i, _ in enumerate(seek_append):
        command.insert(i + 1, _)
    return


""" This command is not working I found this:
http://stackoverflow.com/questions/12801192/client-closes-connection-when-streaming-m4v-from-apache-to-chrome-with-jplayer.
I think that the command below is sending a file that is too big and the
browser closes the connection.
"""
if _mkcc.youtube_url is not None:
    command = ["youtube-dl", "-o", "-", _mkcc.youtube_url]

elif _mkcc.screencast is True:
    if _mkcc.resolution is None:
        screen_size = resolution("1080p", _mkcc.screencast)
    else:
        screen_size = resolution(_mkcc.resolution, _mkcc.screencast)
    command = [
        "ffmpeg",
        "-ac",
        "2",
        "-ar",
        "44100",
        "-frame_size",
        "2048",
        "-fragment_size",
        "2048",
        "-f",
        "pulse",
        "-ac",
        "2",
        "-i",
        "Mkchromecast.monitor",
        "-f",
        "x11grab",
        "-r",
        _mkcc.fps,
        "-s",
        screen_size,
        "-i",
        "{}+0,0".format(_mkcc.display),
        "-vcodec",
        _mkcc.vcodec,
    ]
    if _mkcc.vcodec != "h264_nvenc":
        command.append("-preset")
        command.append("veryfast")
    command.extend(
        [
            "-tune",
            "zerolatency",
            "-maxrate",
            "10000k",
            "-bufsize",
            "20000k",
            "-pix_fmt",
            "yuv420p",
            "-g",
            "60",  # '-c:a', 'copy', '-ac', '2',
            # '-b', '900k',
            "-f",
            "mp4",
            "-movflags",
            "frag_keyframe+empty_moov",
            "-ar",
            "44100",
            "-acodec",
            "libvorbis",
            "pipe:1",
        ]
    )
else:
    """
    The blocks shown below are related to input_files
    """
    # file_resolution = check_file_info(_mkcc.input_file, what='resolution')

    if _mkcc.resolution is None and _mkcc.subtitles is None and user_command is None:
        command = [
            "ffmpeg",
            "-re",
            "-i",
            _mkcc.input_file,
            "-vcodec",
            "copy",
            "-acodec",
            "copy",
            #'-preset', 'veryfast',
            #'-tune', 'zerolatency',
            #'-maxrate', '10000k',
            #'-bufsize', '20000k',
            #'-pix_fmt', 'yuv420p',
            #'-g', '60',
            "-f",
            "mp4",
            "-movflags",
            "frag_keyframe+empty_moov",
            "pipe:1",
        ]
    elif _mkcc.resolution is None and _mkcc.subtitles is not None and user_command is None:
        command = [
            "ffmpeg",
            "-re",
            "-i",
            _mkcc.input_file,
            "-i",
            _mkcc.subtitles,
            "-vcodec",
            "copy",
            "-acodec",
            "copy",
            #'-preset', 'veryfast',
            #'-tune', 'zerolatency',
            #'-maxrate', '10000k',
            #'-bufsize', '20000k',
            #'-pix_fmt', 'yuv420p',
            #'-g', '60',
            "-f",
            "mp4",
            "-movflags",
            "frag_keyframe+empty_moov",
            "pipe:1",
        ]
    else:
        if _mkcc.input_file is not None and _mkcc.subtitles is None and mkv is False:
            # Command taken from
            # https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#Streamingafile
            command = [
                "ffmpeg",
                "-re",
                "-i",
                _mkcc.input_file,
                "-map_chapters",
                "-1",
                "-vcodec",
                "libx264",
                "-preset",
                "veryfast",
                "-tune",
                "zerolatency",
                "-maxrate",
                "10000k",
                "-bufsize",
                "20000k",
                "-pix_fmt",
                "yuv420p",
                "-g",
                "60",
                # '-b', '900k',
                "-f",
                "mp4",
                "-movflags",
                "frag_keyframe+empty_moov",
                "pipe:1",
            ]

        elif _mkcc.input_file is not None and _mkcc.subtitles is None and mkv is True:
            # Command taken from
            # https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#Streamingafile
            command = [
                "ffmpeg",
                "-re",
                "-i",
                _mkcc.input_file,
                "-map_chapters",
                "-1",
                "-vcodec",
                "copy",
                "-acodec",
                "libmp3lame",
                "-q:a",
                "0",
                "-f",
                "mp4",
                "-movflags",
                "frag_keyframe+empty_moov",
                "pipe:1",
            ]

            bit_depth = check_file_info(_mkcc.input_file, what="bit-depth")
            if bit_depth == "yuv420p10le":
                vcodec_index = command.index("-vcodec") + 1
                command[vcodec_index] = "libx264"
                add = [
                    "-preset",
                    "ultrafast",
                    "-tune",
                    "zerolatency",
                    "-maxrate",
                    "10000k",
                    "-bufsize",
                    "20000k",
                    "-pix_fmt",
                    "yuv420p",
                    "-g",
                    "60",
                ]
                for a in add:
                    vcodec_index += 1
                    command.insert(vcodec_index, a)

        elif _mkcc.input_file is not None and _mkcc.subtitles is not None and mkv is False:
            # Command taken from
            # https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#Streamingafile
            command = [
                "ffmpeg",
                "-re",
                "-i",
                _mkcc.input_file,
                "-map_chapters",
                "-1",
                "-vcodec",
                "libx264",
                "-preset",
                "ultrafast",
                "-tune",
                "zerolatency",
                "-maxrate",
                "10000k",
                "-bufsize",
                "20000k",
                "-pix_fmt",
                "yuv420p",
                "-g",
                "60",
                # '-b', '900k',
                "-f",
                "mp4",
                "-movflags",
                "frag_keyframe+empty_moov",
                "-vf",
                "subtitles=" + _mkcc.subtitles,
                "pipe:1",
            ]

        elif _mkcc.input_file is not None and _mkcc.subtitles is not None and mkv is True:
            print(colors.warning("Subtitles with mkv are not supported yet."))
            command = [
                "ffmpeg",
                "-re",
                "-i",
                _mkcc.input_file,
                "-i",
                _mkcc.subtitles,
                "-c:v",
                "copy",
                "-c:a",
                "copy",
                "-c:s",
                "mov_text",
                "-map",
                "0:0",
                "-map",
                "0:1",
                "-map",
                "1:0",
                "-preset",
                "ultrafast",
                "-tune",
                "zerolatency",
                "-maxrate",
                "10000k",
                "-bufsize",
                "20000k",
                "-pix_fmt",
                "yuv420p",
                "-g",
                "60",
                "-f",
                "mp4",
                "-max_muxing_queue_size",
                "9999",
                "-movflags",
                "frag_keyframe+empty_moov",
                "pipe:1",
            ]

        if user_command is not None:
            # TODO(xsdg): This should probably be [user_command].
            command = user_command

        if _mkcc.debug is False and _mkcc.source_url is None:
            try:
                command.insert(command.index("-i"), "panic")
                command.insert(command.index("panic"), "-loglevel")
            except ValueError:
                pass

        if _mkcc.loop is True:
            command.insert(1, "-stream_loop")
            command.insert(2, "-1")

        if _mkcc.resolution is not None:
            command_index = command.index(_mkcc.input_file)
            res_elements = resolution(_mkcc.resolution, _mkcc.screencast)
            for element in res_elements:
                command.insert(-command_index, element)

    if _mkcc.seek is not None:
        seeking(_mkcc.seek)

if mtype is None:
    mtype = "video/mp4"

if _mkcc.debug is True:
    print(":::ffmpeg::: command: %s." % command)


def _flask_init():
    stream_infra.FlaskServer.init_video(
        chunk_size=_mkcc.chunk_size,
        command=command,
        media_type=mtype)


def main():
    if _mkcc.backend != "node":
        pipeline = stream_infra.PipelineProcess(_flask_init, ip, _mkcc.port, _mkcc.platform)
        pipeline.start()
    else:
        print("Starting Node")
        if _mkcc.platform == "Darwin":
            PATH = (
                "./bin:./nodejs/bin:/Users/"
                + str(USER)
                + "/bin:/usr/local/bin:/usr/local/sbin:"
                + "/usr/bin:/bin:/usr/sbin:"
                + "/sbin:/opt/X11/bin:/usr/X11/bin:/usr/games:"
                + os.environ["PATH"]
            )
        else:
            PATH = os.environ["PATH"]

        if _mkcc.debug is True:
            print("PATH = %s." % PATH)

        node_names = ["node"]
        nodejs_dir = ["./nodejs/"]

        if _mkcc.platform == "Linux":
            node_names.append("nodejs")
            nodejs_dir.append("/usr/share/mkchromecast/nodejs/")

        for name in node_names:
            if is_installed(name, PATH, _mkcc.debug) is True:
                for path in nodejs_dir:
                    if os.path.isdir(path):
                        path = path + "html5-video-streamer.js"
                        webcast = [name, path, _mkcc.input_file]
                        break

        if _mkcc.input_file == None:
            print(colors.warning("Please specify an input file with -i"))
            print(colors.warning("Closing the application..."))
            terminate()

        try:
            Popen(webcast)
        except:
            print(
                colors.warning(
                    "Nodejs is not installed in your system. "
                    "Please, install it to use this backend."
                )
            )
            print(colors.warning("Closing the application..."))
            terminate()
