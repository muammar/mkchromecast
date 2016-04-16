* mkchromecast (0.1.6) **released**: 2016/04/16

    - ffmpeg is now a supported backend. You can check how to use this backend
      by consulting `python mkchromecast.py -h`.
    - The following codecs are supported:'mp3', 'ogg', 'aac', 'wav', 'flac'.
    - Improved screen messages.
    - Date format in changelog has been changed.

* mkchromecast (0.1.5) **released**: Wed Apr 13 18:08:44 2016 +0200

    This version has the following improvements:

    - If the application fails, the process that ensures streaming with node will
    kill all streaming servers created by mkchromecast.
    - Now there is a systray menu that you can launch as follows:
    `python mkchromecast.py -t`.

    - To use it, you need to install PyQt5. In homebrew you can do it as
    follows: `brew install pyqt5 --with-python`. You can use the package
    manager of your preference.
    - In a future release, a standalone application will be provided.

* mkchromecast (0.1.4) **released**: Mon Mar 28 19:00:28 2016 +0200

    - Now you can pass arguments to mkchromecast. For more information:
    `python mkchromecast -h`.
    - In this version you can choose devices from a list using:
    `python mkchromecast -s`.
    - Some improvements to the messages printed on screen.

* mkchromecast (0.1.3) **released**: Sun Mar 27 16:17:11 2016 +0200

    - Updated requirements.txt.
    - Now some help can be shown.
    - The code is now licensed under MIT. I think this license is simpler.

* mkchromecast (0.1.2) **released**: Sat Mar 26 18:49:18 2016 +0100

    This new revision has the following improvements:

    - mkchromecast has been ported to work with Python3. This is also possible
    because pychromecast works as well. The nodejs binary has been recompiled,
    and node_modules have been updated.  The program seems to be more stable.

* mkchromecast (0.1.1) **released**: Fri Mar 25 23:59:12 2016 +0100

    - In this new version multithreading is dropped in favor of
     multiprocessing. This is to reconnect the streaming server easily. Killing
     processes is easier than killing threading it seems.

    I strongly encourage you to upgrade to this version.

* mkchromecast (0.1.0) **released**: Fri Mar 25 13:21:12 2016 +0100

    - In this beta release, the program casts to the first google cast found in
      the list. If the node streaming server fails, the program reconnects.

