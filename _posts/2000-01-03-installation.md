---
title: "Install"
bg: orange
color: black
fa-icon: toggle-on
---

## macOS app

[Download the dmg](#download), and drag **mkchromecast** to your
`/Applications/` folder.  Note that for the moments `node` is the only backend
supported. You also need to install Soundflower as shown below. If you use
homebrew, you can install **mkchromecast** with one command line:

```
brew cask install mkchromecast
```

This will install the latest dmg and will install the Soundflower dependency.

### Installing Soundflower (macOS users only)

For Soundflower you can check
[https://github.com/mattingalls/Soundflower/](https://github.com/mattingalls/Soundflower/)
or if you have [Homebrew](http://brew.sh/) you can use [brew
cask](https://caskroom.github.io/) as follows:

```
brew cask install soundflower
```

Or just download the [latest dmg
file](https://github.com/mattingalls/Soundflower/releases/latest).

-------------------------

## Linux based installation

**mkchromecast** is available in the official debian and ubuntu repositories.
You need to install it by executing:

```
sudo apt-get install mkchromecast
```

Alternatively, you can download the latest [deb package here](#download), and install it as follows:

```
sudo dpkg -i mkchromecast_$VERSION_all.deb
```

where `$VERSION = X.Y.Z-Rev`, _e.g._: `0.2.6-1`. Then, if the dependencies are
not available you have to do:

```
sudo apt-get -f install
```

To pull the needed dependencies to cast using pulseaudio or ALSA, please
install `mkchromecast-pulseaudio` or `mkchromecast-alsa` respectively.

This should work in Debian Unstable and Testing. I would appreciate Ubuntu
testers as well. If you find any problems, please [report it
here](https://github.com/muammar/mkchromecast/issues).`

-------------------------

## Installing from Github

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

**Note**: if this step fails, maybe you need to run the installation with
`sudo` as shown below. However, before installing using this method verify why
a regular user cannot install the requirements.

```
sudo pip install -r requirements.txt
```

**Linux** users can try to install these python requirements using the package
managers coming with their distributions.

Now you are good to go!. If you are interested in installing ffmpeg, please
[follow the instructions here](https://github.com/muammar/mkchromecast/#ffmpeg).
