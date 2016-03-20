mkchromecast
============

This is a tiny program to cast your *Mac OSX* audio to your chromecast. It is
written in Python, and it streams using node.js for the moments. For linux you
have a very good program called pulseaudio-dnla to do this.

## Requirements:

In order to use mkchromecast you need the following:

* Python (already shipped in OS X).
* pychromecast.
* psutil.
* [Soundflower](https://github.com/mattingalls/Soundflower/).

To install the python requirements use the `requirements.txt` file shipped in
this repository:

```
pip install -r requirements.txt
```

## How to install it

```
git clone https://github.com/muammar/mkchromecast.git
```

## How to execute it

Just get into the cloned `mkchromecast` directory and execute:

```
python mkchromecast.py
```

To kill the application just `Ctrl-c`.

## Contribute


### Notes

This will cast to the first chromecast found in the list.
