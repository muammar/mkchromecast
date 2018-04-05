#  Builds upcoming 0.9.0 release, or current devel from 6f7dfe1be

%global     __python     %{__python3}

%global     commit       965c6e80672d192439e09da64346a8f9a014f6f9
%global     gittag       0.3.8.1
%global     shortcommit  %(c=%{commit}; echo ${c:0:7})

%global     repo         https://github.com/muammar/mkchromecast/

Name:       mkchromecast
Version:    0.3.8.1
Release:    1%{?dist}
Summary:    Cast linux sound and video to a chromecast device

Group:      Applications/Multimedia
License:    MIT
BuildArch:  noarch
URL:        http://mkchromecast.com/
#Source0:    %%{repo}/archive/%%{commit}/%%{name}-%%{shortcommit}.tar.gz
Source0:    %{repo}/archive/%{gittag}/%{name}-%{version}.tar.gz
Source1:    README.fedora

BuildRequires:  python%{python3_pkgversion}-devel
BuildRequires:  python%{python3_pkgversion}-setuptools
Requires:       flac
Requires:       lame
Requires:       nodejs
Requires:       opus-tools
Requires:       python3-chromecast
Requires:       python3-flask
Requires:       python3-mutagen
Requires:       python3-psutil
Requires:       sox
Requires:       youtube-dl

%description
mkchromecast  is written in Python, and it streams via node.js, ffmpeg, or
avconv. It is capable of using lossy and lossless audio formats provided
that ffmpeg is installed. It also supports Multi-room group playback, and
24-bits/96kHz high audio resolution. Additionally, a system tray menu is also
available.
.
By default, mkchromecast streams with node.js (or parec in Linux) together
with mp3 audio coding format at a sample rate of 44100Hz and average bitrate
of 192k. These defaults can be changed using the --sample-rate and -b flags.
It is useful to modify these parameters when your wireless router is not very
powerful, or in the case you don't want to degrade the sound quality. You can
also cast videos using the --video flag.
.
mkchromecast can cast using either pulseaudio or ALSA. The respective
dependencies can be pulled by mkchromecast-pulseaudio and mkchromecast-alsa
dependency packages respectively. For more information, please read the
README.fedora file shipped in this package.


%package gstreamer
Summary: GStreamer dependencies to cast with mkchromecast
Requires: mkchromecast = %{version}-%{release}
Requires: python3-gstreamer1

%description gstreamer
This dependency package contains an informational list of packages which are
considered essential for using mkchromecast together with GStreamer software
framework. This package also depends on the packages on that list.

Information about needed configurations are contained in the README.fedora
file shipped in the mkchromecast package.


%package pulseaudio
Summary: Pulseaudio dependencies to cast with mkchromecast
Requires: mkchromecast = %{version}-%{release}
Requires: pavucontrol
Requires: pulseaudio-utils

%description pulseaudio
This dependency package contains an informational list of packages which are
considered essential for using mkchromecast together with pulseaudio sound
server.


%prep
%autosetup -p1 -n %{name}-%{gittag}
#%%autosetup -p1 -n %%{name}-%%{commit}
rm -rf nodejs


%build
%py3_build


%install
%py3_install
cp -a %SOURCE1 .
for lib in $RPM_BUILD_ROOT/%{python_sitelib}/mkchromecast/*.py; do
    sed -i '1{\@^#!/usr/bin/env python@d}' $lib  || :
done


%files
%license LICENSE
%doc README.md README.fedora
%{_bindir}/mkchromecast
%{_datadir}/mkchromecast
%{_datadir}/applications/mkchromecast.desktop
%{_mandir}/man1/mkchromecast.1*
%{python3_sitelib}/*

%files gstreamer
%doc README.md README.fedora

%files pulseaudio
%doc README.md README.fedora


%changelog
* Sun Apr 01 2018 Alec Leamas <leamas.alec@gmail.com> - 0.3.8.1-1
- Initial release
