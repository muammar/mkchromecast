#!/usr/bin/env bash
# This file is part of mkchromecast.

# mkchromecast is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# mkchromecast is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with mkchromecast.  If not, see <http://www.gnu.org/licenses/>.


localpwd=`pwd`

tar zxvf ../archive/node-v0.10.38.tar.gz
cd node-v0.10.38/
./configure
./configure --prefix=$localpwd/node-0.10.38

make -j8

make install

rm -r ../node-v0.10.38/
