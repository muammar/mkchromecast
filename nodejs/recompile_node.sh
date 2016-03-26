#!/usr/bin/env bash

# This file is part of mkchromecast.

localpwd=`pwd`

tar zxvf ../archive/node-v0.10.38.tar.gz
cd node-v0.10.38/
./configure
./configure --prefix=$localpwd/node-0.10.38

make -j8

make install

rm -r ../node-v0.10.38/
