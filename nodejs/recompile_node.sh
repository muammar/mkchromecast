#!/usr/bin/env bash

# This file is part of mkchromecast.

localpwd=`pwd`

VER="$@"

echo
echo "Downloading new version from https://nodejs.org..."
echo

wget https://nodejs.org/dist/v$VER/node-v$VER.tar.gz

echo
echo "Deleting old node version"

rm -R node-*

echo
echo "Untar new version"
echo

tar zxvf node-v$VER.tar.gz
rm node-v$VER.tar.gz
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
