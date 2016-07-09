#!/usr/bin/env bash

# This file is part of mkchromecast.

localpwd=`pwd`

VER="$@"

echo "Deleting old node version"
rm -R node-*

echo
echo "Untar new version"
echo

tar zxvf ../archive/node-v$VER.tar.gz
cd node-v$VER/
./configure
./configure --prefix=$localpwd/node-$VER/

make -j8

make install

echo
echo "Deleting building directory"
echo

rm -r ../node-v$VER/

echo "Creating symlinks"

cd $localpwd/bin/
rm *
ln -s ../node-$VER/bin/npm
ln -s ../node-$VER/bin/node

cd ../../bin/
rm node
ln -s ../nodejs/node-$VER/bin/node

echo
echo "Done"
