import flask
import textwrap
from typing import Optional, Union

import mkchromecast

FlaskViewReturn = Union[str, flask.Response]

# TODO(xsdg): Consider porting to https://github.com/pallets-eco/flask-classful
# for a more natural approach to using Flask in an encapsulated way.
class FlaskServer:
    """Singleton Flask server for Chromecast audio and video casting.

    Given that Flask is module-based, this "class" encapsulates the state at a
    class level, and not at an instance level.
    """

    _app: Optional[flask.Flask] = None
    _stream_url: str = "stream"

    def __init__(self, mkcc: mkchromecast.Mkchromecast):
        FlaskServer._app = flask.Flask("mkchromecast")

        FlaskServer._app.add_url_rule("/", view_func=FlaskServer.index)
        # TODO(xsdg): Maybe just have distinct endpoints?
        if audio_mode:
            FlaskServer._

    @staticmethod
    def index() -> FlaskViewReturn:
        # TODO(xsdg): Add head and body tags?
        return textwrap.dedent(f"""\
            <!doctype html>
            <title>Play {FlaskServer._stream_url}</title>
            <audio controls autoplay >
                <source src="{FlaskServer._stream_url}" type="audio/mp3" >
                Your browser does not support this audio format.
            </audio>
            """)

    @staticmethod
    def stream_video() -> flask.Response:
        process = Popen(command, stdout=PIPE, bufsize=-1)
        read_chunk = partial(os.read, process.stdout.fileno(), _mkcc.chunk_size)
        return Response(iter(read_chunk, b""), mimetype=mtype)

    @staticmethod
    def stream_audio():
        if (
            platform == "Linux"
            and bool(backends_dict) is True
            and backends_dict[backend] == "parec"
        ):
            c_parec = [backend, "--format=s16le", "-d", "Mkchromecast.monitor"]
            parec = Popen(c_parec, stdout=PIPE)

            try:
                process = Popen(command, stdin=parec.stdout, stdout=PIPE, bufsize=-1)
            except FileNotFoundError:
                print("Failed to execute {}".format(command))
                message = "Have you installed lame, see https://github.com/muammar/mkchromecast#linux-1?"
                raise Exception(message)

        elif (
            platform == "Linux"
            and bool(backends_dict) is True
            and backends_dict[backend] == "gstreamer"
        ):
            c_gst = [
                "gst-launch-1.0",
                "-v",
                "!",
                "audioconvert",
                "!",
                "filesink",
                "location=/dev/stdout",
            ]
            if adevice is not None:
                c_gst.insert(2, "alsasrc")
                c_gst.insert(3, 'device="' + adevice + '"')
            else:
                c_gst.insert(2, "pulsesrc")
                c_gst.insert(3, 'device="Mkchromecast.monitor"')
            gst = Popen(c_gst, stdout=PIPE)
            process = Popen(command, stdin=gst.stdout, stdout=PIPE, bufsize=-1)
        else:
            process = Popen(command, stdout=PIPE, bufsize=-1)
        read_chunk = partial(os.read, process.stdout.fileno(), buffer_size)
        return Response(iter(read_chunk, b""), mimetype=mtype)
        pass
