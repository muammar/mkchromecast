#!/usr/bin/env bash

# This file is part of mkchromecast.

localpwd=`pwd`

tar zxvf ../archive/node-v6.3.0.tar.gz
cd node-v6.3.0/
./configure
./configure --prefix=$localpwd/node-6.3.0/

make -j8

make install

rm -r ../node-v6.3.0/
