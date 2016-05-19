# This file is part of mkchromecast. It is used to build the Mac OS X app.
# It does the following:
#
# 	1) it changes the string tray from args.tray to True.
# 	2) Build the application using py2app.
# 	3) Copy Qt plugins.
# 	4) macdeploit
#
# The clean target does a git clean -f -d to delete all untracked directories,
# and does a checkout to mkchromecast/__init__.py.
#
# Note: Be careful when using this Makefile, because all files not tracked will
# be deleted, and all changes to mkchromecast/__init__.py will be discarded if
# they are not commited.
#
# How to use it?
#
# 	Test the start_tray.py script:
# 		make clean
# 		make sed
# 		python start_tray.py
# 	Test the application locally
# 		make clean
# 		make test
# 		check dist/ directory
# 	Deploy with debug
# 		make clean
# 		make debug
# 	Deploy
# 		make clean
# 		make deploy
#
# Note that make clean will do a checkout of mkchromecast/__init__.py.
#
# Muammar El Khatib
#

# This target is used to test the start_tray.py script that is used to deploy
# the Mac app
sed:
	sed -i -e  's/tray = args.tray/tray = True/g' mkchromecast/__init__.py
	sed -i -e  's/debug = args.debug/debug = True /g' mkchromecast/__init__.py

# This target creates the app just to be used locally
test:
	sed -i -e  's/tray = args.tray/tray = True/g' mkchromecast/__init__.py
	sed -i -e  's/debug = args.debug/debug = True/g' mkchromecast/__init__.py
	python3 setup.py py2app -A

# This target creates a standalone app with debugging enabled
debug:
	sed -i -e  's/tray = args.tray/tray = True/g' mkchromecast/__init__.py
	sed -i -e  's/debug = args.debug/debug = True/g' mkchromecast/__init__.py
	python3 setup.py py2app
	cp -R /usr/local/Cellar/qt5/5.6.0/plugins dist/mkchromecast.app/Contents/PlugIns
	/usr/local/Cellar/qt5/5.6.0/bin/macdeployqt dist/mkchromecast.app

# This target creates a standalone app with debugging disabled
deploy:
	sed -i -e  's/tray = args.tray/tray = True/g' mkchromecast/__init__.py
	sed -i -e  's/debug = args.debug/debug = False/g' mkchromecast/__init__.py
	python3 setup.py py2app
	cp -R /usr/local/Cellar/qt5/5.6.0/plugins dist/mkchromecast.app/Contents/PlugIns
	/usr/local/Cellar/qt5/5.6.0/bin/macdeployqt dist/mkchromecast.app -dmg

# This cleans
clean:
	git clean -f -d
	git checkout mkchromecast/__init__.py
	rm -f mkchromecast/*.pyc
