mkchromecast
============

This is a tiny program to cast your **Mac OS X** audio to your google cast
devices. It is written in Python, and it streams using node.js for the moments.

For Linux you have a program called
[pulseaudio-dlna](https://github.com/masmu/pulseaudio-dlna) that does this
beautifully.

### Requirements:

In order to use **mkchromecast** you need the following:

* Python2 (already shipped in OS X), or Python3.
* pychromecast.
* psutil.
* mutagen.
* [Soundflower](https://github.com/mattingalls/Soundflower/).

### Installation and updating

To install **mkchromecast**, clone this repository:

```
git clone https://github.com/muammar/mkchromecast.git
```

Or you may download one of the [stable Releases
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

To get help:

```
python mkchromecast.py -h
```

To kill the application just press `Ctrl-c`.

### Notes

A **beta** system tray menu is now provided. It requires you to install
`PyQt5`. To launch it:

```
python systray.py
```

It looks like:

![Image of
working menu](https://raw.githubusercontent.com/muammar/mkchromecast/master/images/screenshot.png)

I am still working in improving it.

### TODO

* Implement multithreading in the system tray menu.
* Generate a standalone Mac OS X application.

### Contribute

If you want to contribute, help me improving this application by [reporting
issues](https://github.com/muammar/mkchromecast/issues), [creating pull
requests](https://github.com/muammar/mkchromecast/pulls), or you may also buy
me some pizza :).

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JQGD4UXPBS96U)
