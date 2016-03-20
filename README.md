mkchromecast
============

This is a tiny program to cast your **Mac OSX** audio to your chromecast. It is
written in Python, and it streams using node.js for the moments. For linux you
have a program called
[pulseaudio-dnla](https://github.com/masmu/pulseaudio-dlna) that does this
beautifully.

## Requirements:

In order to use mkchromecast you need the following:

* Python (already shipped in OS X).
* pychromecast.
* psutil.
* [Soundflower](https://github.com/mattingalls/Soundflower/).


## Installation

Clone this repository:

```
git clone https://github.com/muammar/mkchromecast.git
```

#### Python

To install the python requirements use the `requirements.txt` file shipped in
this repository:

```
pip install -r requirements.txt
```

_Note_: if this step fails, maybe you will need to run the installation with
`sudo`:

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

Or just download the latest [dmg
file](https://github.com/mattingalls/Soundflower/releases)


## How to execute it

Just get into the cloned `mkchromecast` directory and execute:

```
python mkchromecast.py
```

To kill the application just `Ctrl-c`.

## Contribute


#### Notes

This will cast to the first chromecast found in the list.
