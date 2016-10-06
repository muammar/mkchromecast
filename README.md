mkchromecast
============
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/muammar/mkchromecast/master/LICENSE)
[![PyPI](https://img.shields.io/pypi/pyversions/pychromecast.svg?maxAge=2592000)](https://github.com/muammar/mkchromecast/)
[![node](https://img.shields.io/badge/node-6.6.0-yellow.svg)](https://github.com/muammar/mkchromecast/blob/master/nodejs/)
[![Downloads](https://img.shields.io/github/downloads/muammar/mkchromecast/total.svg?maxAge=2592000?style=flat-square)](https://github.com/muammar/mkchromecast/releases)
[![GitHub release](https://img.shields.io/github/release/muammar/mkchromecast.svg)](https://github.com/muammar/mkchromecast/releases/latest)

This is a program to cast your **macOS** audio, or **Linux** audio to your
Google Cast devices.

It is written in Python, and it can stream via `node.js`, `parec` (**Linux**),
`ffmpeg`, or `avconv`.  **mkchromecast** is capable of using lossy and lossless
audio formats provided that `ffmpeg`, `avconv` (**Linux**), or `parec`
(**Linux**) are installed. It also supports [Multi-room group
playback](https://support.google.com/chromecast/answer/6329016?hl=en), and
 [24-bit/96kHz high audio resolution](https://github.com/muammar/mkchromecast#high-quality-audio).
Additionally, a system tray menu is available.

By default, **mkchromecast** streams with `node.js` (or `parec` in **Linux**)
together with `mp3` audio coding format at a sample rate of `44100Hz` and
average bitrate of `192k`.  These defaults can be changed using the
`--sample-rate` and `-b` flags. It is useful to modify these parameters when
your wireless router is not very powerful, or in the case you don't want to
degrade the sound quality. For more information visit the
[wiki](https://github.com/muammar/mkchromecast/wiki/), and the
[FAQ](https://github.com/muammar/mkchromecast/wiki/FAQ).

You can optionally install `ffmpeg` or `avconv` (the latter only supported in **Linux**,
[more information
here](https://github.com/muammar/mkchromecast#using-the-ffmpeg-backend-with-mkchromecast-installed-from-sources)).
**Linux** users also can configure [ALSA to capture
audio](https://github.com/muammar/mkchromecast/wiki/ALSA).  Note that sometimes
the lag between playing a song and hearing may be up to 8 seconds for certain
backends.

Tell me more about it
----------------------
To have an idea of using **mkchromecast** from console [check this
gif](https://github.com/muammar/mkchromecast#usage).

**mkchromecast** provides a **beta** system tray menu. It requires you to
install `PyQt5`. For more information check the
[Requirements](https://github.com/muammar/mkchromecast#requirements) and
[Install](https://github.com/muammar/mkchromecast#install) sections.

This is what the system tray menu looks like:

##### macOS

[![Example](https://raw.githubusercontent.com/muammar/mkchromecast/master/images/screencast.png)](https://www.youtube.com/embed/d9Qn_LltOjU)

##### Linux

Check these images:

* [Gnome 1](https://raw.githubusercontent.com/muammar/mkchromecast/master/images/Gnome1.png)
* [Gnome 2](https://raw.githubusercontent.com/muammar/mkchromecast/master/images/Gnome2.png)
* [KDE5 1](https://raw.githubusercontent.com/muammar/mkchromecast/master/images/Kde5_1.png)
* [KDE5 2](https://raw.githubusercontent.com/muammar/mkchromecast/master/images/Kde5_2.png)
* [Awesome WM with Blue icons](https://raw.githubusercontent.com/muammar/mkchromecast/master/images/Awesome_BI.png)

Requirements:
------------

#### macOS

In order to use **mkchromecast** you need the following software to stream with
`node.js`:

* Python2 (already shipped in OS X), or Python3.
* pychromecast.
* psutil.
* mutagen.
* [Soundflower](https://github.com/mattingalls/Soundflower/).
* PyQt5 (optional if you want to use the system tray menu).

For more control, you need `ffmpeg` as backend.  In that case install the
following:

* flask (optional).
* ffmpeg (optional).
* youtube-dl (option if you plan to cast youtube URLs).

#### Linux

* Pulseaudio.
* Pavucontrol.
* Python2 (if using the official debian package), or Python3.
* pychromecast.
* psutil.
* mutagen.
* flask.
* vorbis-tools.
* sox.
* lame.
* flac.
* faac.
* ffmpeg (optional).
* avconv (optional).
* PyQt5 (optional if you want to use the system tray menu).
* youtube-dl (option if you plan to cast youtube URLs).

For those who don't like Pulseaudio, it is possible to [cast using
ALSA](https://github.com/muammar/mkchromecast/wiki/ALSA). In that case the
requirements are:

* alsa-base
* alsa-utils
* alsa-utils
* Python2 (if using the official debian package), or Python3.
* pychromecast.
* psutil.
* mutagen.
* flask.
* vorbis-tools.
* sox.
* lame.
* flac.
* faac.
* ffmpeg.
* avconv (optional).
* PyQt5 (optional if you want to use the system tray menu).
* youtube-dl (option if you plan to cast youtube URLs).


Install
-------

There are two ways of installing this application:

1. Using the [binaries](https://github.com/muammar/mkchromecast#binaries).
2. From [sources](https://github.com/muammar/mkchromecast#from-sources).

#### Binaries

##### macOS

There is a standalone application for **macOS** users. You need to drag it to your
`/Applications/` folder.

[Download the latest dmg
here](https://github.com/muammar/mkchromecast/releases/latest/).
You need also to [install
Soundflower](https://github.com/muammar/mkchromecast#soundflower-macos-users-only).

###### Homebrew Cask

If you are using homebrew,  it is possible to install the binary as follows:

```
brew cask install mkchromecast
```

If you find any problem with the application, please [report it
here](https://github.com/muammar/mkchromecast/issues).

##### Linux

* Arch Linux: [https://aur.archlinux.org/packages/mkchromecast-git/](https://aur.archlinux.org/packages/mkchromecast-git/).
* Debian (.deb): [https://packages.debian.org/mkchromecast](https://packages.debian.org/mkchromecast).
* Ubuntu (.deb): [http://packages.ubuntu.com/search?keywords=mkchromecast](http://packages.ubuntu.com/search?keywords=mkchromecast).

**mkchromecast** is available in the [official Debian
repositories](https://packages.debian.org/mkchromecast). To install
it, just do:

```
apt-get install mkchromecast
```

Download the latest [deb package
here](https://github.com/muammar/mkchromecast/releases/), and install it as
follows:

```
sudo dpkg -i mkchromecast_$VERSION_all.deb
```

where `$VERSION = X.Y.Z-Rev`, _e.g._: `0.2.6-1`. Then, if the dependencies are
not available you have to do:

```
sudo apt-get -f install
```

This should work in Debian Unstable and Testing. I would appreciate Ubuntu
testers as well. If you find any problems, please [report it
here](https://github.com/muammar/mkchromecast/issues).

If you experience other problems related to dependencies, please [discuss them
here](https://github.com/muammar/mkchromecast/issues/9) or open a new issue.

Additionally, there are two dependency packages for pulling pulseaudio or ALSA
dependencies:

```
apt-get install mkchromecast-alsa (ALSA users)
```

or

```
apt-get install mkchromecast-pulseaudio (Pulseaudio users)
```

#### From sources

To install **mkchromecast**, clone this repository:

```
git clone https://github.com/muammar/mkchromecast.git
```

Or you may download one of the [stable releases
here](https://github.com/muammar/mkchromecast/releases), and unzip the file.

##### Python

To install python requirements use the `requirements.txt` file shipped in
this repository:

```
pip install -r requirements.txt
```

**Note**: if this step fails, maybe you need to run the installation with
`sudo` as shown below. However, before installing using this method verify why
a regular user cannot install these requirements.

```
sudo pip install -r requirements.txt
```

**Linux** users can try to install these python requirements using the package
managers coming with their distributions.

Example for Debian based distros:

```
sudo apt-get install python2.7 python-pip python-pychromecast python-flask python-psutil python-setuptools python-mutagen python-gi vorbis-tools sox lame flac faac opus-tools
```

**Note**: if `python-pychromecast` is not available in your repository,
follow instructions in [#9](https://github.com/muammar/mkchromecast/issues/9).

##### Soundflower (macOS users only)

For installing Soundflower you can check
[https://github.com/mattingalls/Soundflower/](https://github.com/mattingalls/Soundflower/)
and just download the [latest dmg
file](https://github.com/mattingalls/Soundflower/releases).

If you have [Homebrew](http://brew.sh/) you can use [brew
cask](https://caskroom.github.io/) as follows:

```
brew cask install soundflower
```

By default, the sample rate in Soundflower is set to `44100Hz`. If you desire
to stream at higher sample rates follow the [instructions in the
wiki](https://github.com/muammar/mkchromecast/wiki/Sample-rates).

**Note**: re-sampling to higher sample rates is not a good idea. It was indeed
an issue in chromecast audio devices. See [this thread](https://goo.gl/yNVODZ).
Therefore, if you want to go beyond `44100Hz` you have to [capture the sound at
a higher sample rate](https://github.com/muammar/mkchromecast/wiki/Sample-rates).

##### ffmpeg or avconv

The easiest way of installing `ffmpeg` is using a package manager, *e.g.*: brew,
macports or fink. Or in the case of **Linux**, *e.g.*: apt, yum, or pacman.

###### macOS

I will briefly describe the case of Homebrew here. First, you will need
Homebrew installed in your machine:

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Once Homebrew is ready, you can install `ffmpeg`.  As stated in the [ffmpeg
website](https://trac.ffmpeg.org/wiki/CompilationGuide/MacOSX), and for being
able to use all audio coding formats in **mkchromecast**, it is better to
install `ffmpeg` with the following options enabled:

```
brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-libass --with-libquvi --with-libvorbis --with-libvpx --with-opus --with-x265
```

**mkchromecast** does not support `avconv` in **macOS**.

###### Linux

As I use Debian, the way of installing `ffmpeg` is:

```
apt-get install ffmpeg
```

or `avconv`

```
apt-get install libav-tools
```

**Audio coding formats available with `parec`, `ffmpeg` and `avconv` backends**

**Audio coding format** | **Description**                   | **Notes**
------------------------| ----------------------------------|------------------
  `mp3`                 | MPEG Audio Layer III (default)    | Lossy compression format (default bitrate: 192k)
  `ogg`                 | Ogg Vorbis                        | Lossy compression format (default bitrate: 192k)
  `aac`                 | Advanced Audio Coding (AAC)       | Lossy compression format (default bitrate: 192k)
  `wav`                 | Waveform Audio File Format        | Lossless format (HQ sound)
  `flac`                | Free Lossless Audio Codec         | Lossless format (HQ sound)


##### PyQt5

These Python bindings are needed if you intend to use the system tray menu. As
of today April 28th, `pip` is able to install `PyQt5`. Therefore, you can do
a `pip install pyqt5`.

If this does not work for you, I suggest you to install it using a package
manager.

###### macOS

Example with Homebrew:

```
brew install pyqt5 --with-python
```

###### Linux

* **Debian**

For Python2:

```
apt-get install python-pyqt5
```

For Python3:

```
apt-get install python3-pyqt5
```

or if you desire it you can do it yourself from the sources.

Updating
--------

To update **mkchromecast** sources, just get into the cloned directory and:

```
git pull
```

or if you prefer it, you can just pass the `--update` argument to
**mkchromecast**:

```
python mkchromecast.py --update
```

If you are using the **macOS** application:

1. Click on `Check For Updates`.
2. If there are new versions, you will be prompted to [download the latest
   dmg](https://github.com/muammar/mkchromecast/releases/latest).
3. Replace the `mkchromecast.app` in your `/Applications/` directory.

**Linux** users need to either perform a `apt-get upgrade` or [download the
latest deb here](https://github.com/muammar/mkchromecast/releases/), and `dpkg
-i mkchromecast_$VERSION_all.deb`.

Usage
-----

Get into the cloned **mkchromecast** directory and execute:

```
python mkchromecast.py
```

This will launch **mkchromecast** using `node.js` (or `parec` for **Linux**
users), and will do the streaming part together with the `mp3` audio coding
format.  `node.js` works decently but the server may tend to _fail_ under certain
circumstances. In such a case, **mkchromecast** is able to restart the
_streaming/casting_ process automatically. So, some hiccups are expected.

**Note**: most of the steps described herein are the same for **macOS** and **Linux**
users. However, if you launch the command above in **Linux**, the process is
less automatized.  In **Linux**, you need to select with `pavucontrol` the sink
called `mkchromecast` to stream unless you are using [ALSA](https://github.com/muammar/mkchromecast/wiki/ALSA).  
See the [wiki for more information](https://github.com/muammar/mkchromecast/wiki/Linux). tl;dr?, just
check the gif below.

![Example of using mkchromecast](https://raw.githubusercontent.com/muammar/mkchromecast/master/images/mkchromecast_linux.gif)

**Note**: the cast process is independent from the selection of the pulseaudio
sink. This means that **mkchromecast** will tell the cast device to listen your
computer but no sound will be heard until you select the sink. For ALSA users, this 
does not apply.

##### Using the `ffmpeg` backend with **mkchromecast** installed from sources

Below an example using `mp3`:

```
python mkchromecast.py --encoder-backend ffmpeg
```

With `ffmpeg` you can modify the codec:

```
python mkchromecast.py --encoder-backend ffmpeg -c aac
```

change the bitrate and sample rate:

```
python mkchromecast.py --encoder-backend ffmpeg -c mp3 -b 128 --sample-rate 31000
```

check the section [Soundflower (macOS users
only)](https://github.com/muammar/mkchromecast#soundflower-macos-users-only)
for more about sample rates.

You also can set the host ip manually which is a useful option when having more 
than one active network connection or when the automatically ip detection fails:

```
python mkchromecast.py --host 192.168.1.1
```

##### Other examples with **mkchromecast** installed using the debian package

To cast using `parec` and `wav` audio coding format:
```
mkchromecast -c wav
```

There is also an option to change the `bitrate`, and in this case with `ffmpeg`:

```
mkchromecast --encoder-backend ffmpeg -c ogg -b 128
```

and another one to change the sampling rate:

```
mkchromecast --encoder-backend ffmpeg -c ogg -b 128 --sample-rate 48000
```

**Note**: to use `avconv` just replace from `ffmpeg` to `avconv` in the
commands above.

##### Using **mkchromecast** from the system tray

To launch it:

```
python mkchromecast.py -t
```
or

```
mkchromecast -t
```

The system tray application can perform all the actions from the aforementioned
commands. To get an idea, please check the [Youtube video
here](https://github.com/muammar/mkchromecast#macos).

#### Playing Youtube URLs in Google Cast devices

You can play Youtube URLs headlessly from the command line:

```
python mkchromecast.py -y https://www.youtube.com/watch\?v\=NVvAJhZVBT
```

To use this function, you need to install `youtube-dl`. In macOS, this can be
done with homebrew: `brew install youtube-dl`. In Debian based distros:
`apt-get install youtube-dl`.

**Note**: you may need to enclose the URL between quotation marks.

#### Playing source URLs in Google Cast devices

You can play any source URLs headlessly from the command line:

```
python mkchromecast.py --source-url SOURCE_URL
```

This option is useful for:

1. Casting using MPD in the case you have already a `http` streaming source.
2. Casting a radio station. A list of stations to try: https://ponyvillefm.com/servers

Example:

```
python mkchromecast.py --source-url http://192.99.131.205:8000/pvfm1.ogg -c ogg --volume

```

As it can be seen above, **the codec has to be specified with the `-c` flag**.

**Note**: `.m3u` or `.pls` are not yet supported.

#### Controlling the Google Cast's volume

You can control the volume of your Google Cast device by launching
**mkchromecast** with the option `--volume`:

```
python mkchromecast.py --encoder-backend ffmpeg -c ogg -b 320 --volume
```

This will allow you to press <kbd>u</kbd> and <kbd>d</kbd> keys for `volume up`
and `volume down` respectively.

The system tray has a window with a volume slider to do `volume up` and `volume down`.

#### High quality audio

**mkchromecast** lets you cast using `24-bit/96kHz` high audio resolution. This
is the *maximum chromecast audio capability*. The supported codecs are: `wav`
and `flac`. In spite of the fact that `aac` can use `96000Hz` sample rate, the
bitrate corresponds to that of a lossy data compression format. Therefore, the
following combinations can achieve this `24-bit/96kHz` capability:

* `wav` + `96000Hz` sample rate.
* `flac` + `96000Hz` sample rate.

References:
* [#11](https://github.com/muammar/mkchromecast/issues/11).
* [Lossless formats](https://github.com/muammar/mkchromecast/wiki/Audio-Quality#lossless-formats).

Killing the application
-----------------------

To kill **mkchromecast** when you run it from console, just press
<kbd>Ctrl-C</kbd> or <kbd>q</kbd> key to quit (when `--volume` flag is passed).

When launching from system tray, use the `Quit` button in the system tray.

More help
---------

To get more help:

```
python mkchromecast.py -h
```

or when installing the debian package:

```
mkchromecast -h
```

Known issues
------------
##### General

No new issues reported.

##### macOS

No new issues reported.

##### Linux

* When using `parec` and `lame` encoder, the delay between audio played and
  listened can be up to 8 seconds. I suggest you to use something different
  than mp3.

You can also check the [FAQ](https://github.com/muammar/mkchromecast/wiki/FAQ)
for more information.

TODO
----

* Verify all exceptions when the system tray menu fails.
* More eye candy.
* [Video](https://github.com/muammar/mkchromecast/milestone/1)?.

Contribute
----------

If you want to contribute, help me improving this application by [reporting
issues](https://github.com/muammar/mkchromecast/issues), [creating pull
requests](https://github.com/muammar/mkchromecast/pulls), or you may also buy
me some pizza :).

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JQGD4UXPBS96U)
