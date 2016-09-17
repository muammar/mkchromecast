* mkchromecast (0.3.6) **unreleased**

    - The node streaming has been updated to work with `node v6.6.0`.
    - `Ctrl-C` now raises `KeyboardInterrupt` when using `--volume` option from
      console.
    - Improvements under the hood.
    - Now mkchromecast does not need pulseaudio to cast!.
    - You can play from pipe/stream using the `--source-url` flag.
    - `-d` option has been enable to discover available Google cast devices.
    - `--host` flag allows users to manually enter the local ip. Closes #17.

* mkchromecast (0.3.5) **released**: 2016/08/26

    - Added close button for preferences pane. Closes
      [#13](https://github.com/muammar/mkchromecast/issues/13)
    - Improvements for cases where there are virtual network interfaces
      present.
    - Dropped `-re` flag from ffmpeg and avconv commands.
    - Renamed `ffmpeg.py` to `audio.py`.

* mkchromecast (0.3.4) **released**: 2016/08/19

    - New white icons.
    - Added 96000Hz sampling rate support for `ffmpeg` and `avconv` backends.
      Closes [#11](https://github.com/muammar/mkchromecast/issues/11).
    - Fixed 48000Hz sample rate case.
    - The node streaming has been updated to work with `node v6.4.0`.

* mkchromecast (0.3.3) **released**: 2016/08/16

    - Improved MultiRoom support. Closes
      [#8](https://github.com/muammar/mkchromecast/issues/8).

* mkchromecast (0.3.2) **released**: 2016/06/15

    - Improvements for cases where chromecasts have non-ascii characters in
      their names. Closes
      [#7](https://github.com/muammar/mkchromecast/issues/7).

* mkchromecast (0.3.1) **released**: 2016/08/12

    - Improved Preferences window.
    - The node streaming has been updated to work with `node v6.3.1`.
    - Improvements in pulseaudio.py for preventing subprocess.Popen from
      displaying output.
    - Improvements in `Check For Updates` method.
    - Added new option `--chunk-size` to control chunk's size of flask server
      when streaming using `ffmpeg` or `avconv`.

* mkchromecast (0.3.0) **released**: 2016/07/12

    - Youtube URLs can be played piping the audio using `youtube-dl`.
    - New method for discovering local IP in macOS. This will improve the
      stability of the system tray application. Closes
      [#5](https://github.com/muammar/mkchromecast/issues/5).
    - Now it is possible to select a different color for the system tray icon.
      This is useful when using dark themes.
    - The node streaming has been updated to work with `node v6.3.0`.
    - Improved stability when using system tray icon.
    - New method in preferences window to reset to default configurations.
      Closes [#6](https://github.com/muammar/mkchromecast/issues/6).

* mkchromecast (0.2.9.1) **released**: 2016/06/29

    - Fixing `stop` segfault.

* mkchromecast (0.2.9) **released**: 2016/06/29

    - Improved stability when using system tray icon.
    - New `search at launch` option. When enabled, the system tray search for
      available Google cast devices at launch time.
    - The node streaming server has been updated to work with `node v6.2.2`.

* mkchromecast (0.2.8) **released**: 2016/06/22

    - Preferences and volume windows always on top.
    - The node streaming has been updated to work with v6.2.1. This improves
      stability for macOS users when streaming with node.
    - It is now possible to check for updates using the system tray icon.
    - Scale factor added for retina resolutions.

* mkchromecast (0.2.7) **released**: 2016/06/16

    - Volume now set to max/40 instead of max/10. I have remarked that changing
      volume directly in the chromecast is more stable and faster than doing it
      from the streaming part, e.g. pavucontrol, or soundflower.
    - General improvements in system tray's behavior.
    - An error when setting volume to maximum has been fixed.
    - Now the muted time when launching a cast session is reduced. This is
      possible given that Soundflower changes input/output devices
      automatically. Linux users have to select a sink in pavucontrol.
    - Change from `Mac OS X` to  `macOS`.

* mkchromecast (0.2.6) **released**: 2016/06/08

    - Volume now set to max/20 instead of max/10.
    - This release lets Linux users cast using  `parec` with external libraries
      instead of `ffmpeg` or `avconv`.
    - The program does not import any PyQt5 module when launched without the
      system tray.
    - A deb package is now provided in this release.
    - The system tray will retry stopping the google cast before closing
      abruptly.
    - The Mac OS X application now supports models below the year 2010. See
      [#4](https://github.com/muammar/mkchromecast/issues/4).

* mkchromecast (0.2.5) **released**: 2016/05/25

    - This release fixes a problem with the system tray menu failing to read
      configuration files when changing from lossless to lossy audio coding
      formats.

* mkchromecast (0.2.4) **released**: 2016/05/21

    - This release fixes the system tray menu for Linux.
    - Now avconv is supported.
    - Pass the `--update` option to update the repository.
    - It is now possible to control the Google cast device volume from the
      systray.
    - You can reboot the Google cast devices from the systray.
    - There is a Preferences window to control `backends`, `bitrates`, `sample
      rates`, `audio coding formats` and `notifications`.

* mkchromecast (0.2.3.1) **released**: 2016/05/08

    - This release fixes the Signal 9 passed by error in the Stand-alone
      application.

* mkchromecast (0.2.3) **released**: 2016/05/08

    - The code has been partially refactored to ease maintenance.
    - Printed messages have been improved.
    - Stand-alone application for Mac OS X is released. It only works for the
      `node` backend.

* mkchromecast (0.2.2) **released**: 2016/05/03

    - Fixed error with Python2 when importing threading module.

* mkchromecast (0.2.1) **released**: 2016/05/02

    - Method for monitoring `ffmpeg` backend. This update is useful for those
      who use the system tray menu.

* mkchromecast (0.2.0.2) **released**: 2016/05/01

    - Fixed wav for Linux.

* mkchromecast (0.2.0.1) **released**: 2016/05/01

    - Catching some minimal errors.

* mkchromecast (0.2.0) **released**: 2016/05/01

    - Linux support.
    - Linux only plays with ffmpeg.
    - Now by default log level for `ffmpeg` backend is set to minimum.

* mkchromecast (0.1.9.1) **released**: 2016/04/27

    - Fixed node bug introduced in f635c5d66649767a031ac560d7c32ba6bffe33fe.

* mkchromecast (0.1.9) **released**: 2016/04/25

    - Play headless youtube URL.
    - Now you can control volume up and down from mkchromecast. So, no need
      of using the Android app for this anymore.

* mkchromecast (0.1.8.1) **released**: 2016/04/21

    - Set maximum bitrates and sample rates values for `node`.

* mkchromecast (0.1.8) **released**: 2016/04/21

    - Set maximum bitrates and sample rates values for both backends.
    - New icon when no google cast devices are found.
    - `streaming.py` was renamed to `node.py`.
    - Tested stability: 3hrs streaming at 320k with the `ffmpeg` backend.

* mkchromecast (0.1.7) **released**: 2016/04/18

    - The bitrate and sample rates can be modified in both node and ffmpeg.
      These options are useful when you router is not very powerful.
    - node_modules have been updated.
    - An error preventing launching without options has been fixed.
    - If PyQt5 is not present in the system, mkchromecast does not try to load
      it.

* mkchromecast (0.1.6) **released**: 2016/04/16

    - ffmpeg is now a supported backend. You can check how to use this backend
      by consulting `python mkchromecast.py -h`.
    - The following codecs are supported: 'mp3', 'ogg', 'aac', 'wav', 'flac'.
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

