mkchromecast
============

This is a program to cast your **Mac OS X** audio to your Google Cast devices.

It is written in Python, and it streams via `node.js`, or `ffmpeg`.
**mkchromecast** is capable of using lossy and lossless audio formats provided
that `ffmpeg` is installed. Additionally, a system tray menu is also available.

By default, **mkchromecast** streams with `node.js` together with `mp3` audio
coding format at a sample rate of `44100Hz` and average bitrate of `192k`.
These defaults can be changed using the `--sample-rate` and `-b` flags. It is
useful to modify these parameters when your wireless router is not very
powerful like mine, or in the case you don't want to degrade the sound quality.
For more information [visit the
wiki](https://github.com/muammar/mkchromecast/wiki/).

For Linux, you have a program called
[pulseaudio-dlna](https://github.com/masmu/pulseaudio-dlna) that does this
beautifully.

### Requirements:

In order to use **mkchromecast** you need the following software to stream with
`node.js`:

* Python2 (already shipped in OS X), or Python3.
* pychromecast.
* psutil.
* mutagen.
* [Soundflower](https://github.com/mattingalls/Soundflower/).
* PyQt5 (optional if you want to use the system tray menu).

If you want more control, you may want to use `ffmpeg` as backend. In that case
you need the following:

* flask (optional).
* ffmpeg (optional).

### Installing and updating

To install **mkchromecast**, clone this repository:

```
git clone https://github.com/muammar/mkchromecast.git
```

Or you may download one of the [stable releases
here](https://github.com/muammar/mkchromecast/releases), and unzip the file.

#### Python

To install the python requirements use the `requirements.txt` file shipped in
this repository:

```
pip install -r requirements.txt
```

_Note_: if this step fails, maybe you will need to run the installation with
`sudo` as shown below. However, before installing using this method verify why
a regular user cannot install the requirements.

```
sudo pip install -r requirements.txt
```

#### Soundflower

For Soundflower you can check
[https://github.com/mattingalls/Soundflower/](https://github.com/mattingalls/Soundflower/)
or if you have [Homebrew](http://brew.sh/) you can use [brew
cask](https://caskroom.github.io/) to install it as follows:

```
brew cask install soundflower
```

Or just download the [latest dmg
file](https://github.com/mattingalls/Soundflower/releases).

By default, the sample rate in Soundflower is set to `44100Hz`. If you desire
to stream at higher sample rates follow the [instructions in the wiki here](https://github.com/muammar/mkchromecast/wiki/Soundflower).

#### ffmpeg

The easiest way of installing `ffmpeg` is using a package manager, *e.g.*: brew,
macports or fink.

I will briefly describe the case of Homebrew here. First, you will need to
install Homebrew:

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Once Homebrew is ready, you can install `ffmpeg` as follows:

```
brew install ffmpeg
```

As stated in the [ffmpeg
website](https://trac.ffmpeg.org/wiki/CompilationGuide/MacOSX), it is better to
install some additional `ffmpeg`'s options:

```
brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-libass --with-libquvi --with-libvorbis --with-libvpx --with-opus --with-x265
```

When using `ffmpeg`, the following audio coding formats are available:

**Audio coding format** | **Description**                   | **Notes**
------------------------| ----------------------------------|------------------
  `mp3`                 | MPEG Audio Layer III (default)    | Lossy compression format (default bitrate: 192k)
  `ogg`                 | Ogg Vorbis                        | Lossy compression format (default bitrate: 192k)
  `aac`                 | Advanced Audio Coding (AAC)       | Lossy compression format (default bitrate: 192k)
  `wav`                 | Waveform Audio File Format        | Lossless format (HQ sound)
  `flac`                | Free Lossless Audio Codec         | Lossless format (HQ sound)

Example using wav:

```
python mkchromecast.py --encoder-backend ffmpeg -c wav
```

There is also an option to change the `bitrate`. See example below:

```
python mkchromecast.py --encoder-backend ffmpeg -c ogg -b 128
```

#### PyQt5

These Python bindings are needed if you intend to use the system tray menu.  As
previously said, I also suggest you to install it using Homebrew:

```
brew install pyqt5 --with-python
```

or if you desire it you can do it yourself from the sources.

#### Updating

To update **mkchromecast**, just get into the cloned directory and:

```
git pull
```

### How to execute it

Get into the cloned **mkchromecast** directory and execute:

```
python mkchromecast.py
```

This will launch **mkchromecast** using `node.js` for doing the streaming part
together with the `mp3` audio coding format.  This works decently, **however**
I would like to point out that the node version of this implementation is
ancient. Moreover, the `node.js` server tends to _fail_, and some
disconnections are expected. In such a case, **mkchromecast** is able to
restart the streaming/casting process automatically. So, some hiccups are
expected.

#### Using the `ffmpeg` backend

Below an example using `mp3` with `ffmpeg`:

```
python mkchromecast.py --encoder-backend ffmpeg
```

This is way more stable than the `node` implementation. With `ffmpeg` you can
modify the codec:

```
python mkchromecast.py --encoder-backend ffmpeg -c aac
```

You can change the bitrate:

```
python mkchromecast.py --encoder-backend ffmpeg -c mp3 -b 128
```

#### Playing Youtube URLs in Google Cast TV

You can play Youtube URLs headlessly from the command line:

```
python mkchromecast.py -y https://www.youtube.com/watch\?v\=NVvAJhZVBT
```

**Note**: you may need to enclose the URL between quotation marks.

To get more help:

```
python mkchromecast.py -h
```

### Killing the application

To kill **mkchromecast** when you run it from console, just press `Ctrl-c`.

### Notes

A **beta** system tray menu is now provided. It requires you to install
`PyQt5`. To launch it:

```
python mkchromecast.py -t
```

It looks like:

![Image of
working menu](https://raw.githubusercontent.com/muammar/mkchromecast/master/images/screenshot.png)

**Note**: you can pass the options when using `ffmpeg` as backend and adding `-t`
to launch the system tray. I am still working on improving all of this.

### TODO

* Control the Google Cast volume `up` and `down`.
* Verify all exceptions when the system tray menu fails.
* Check that the index of the cast selected is correctly passed in the
system tray.
* Generate a standalone Mac OS X application.
* Video?.

### Contribute

If you want to contribute, help me improving this application by [reporting
issues](https://github.com/muammar/mkchromecast/issues), [creating pull
requests](https://github.com/muammar/mkchromecast/pulls), or you may also buy
me some pizza :).

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JQGD4UXPBS96U)
