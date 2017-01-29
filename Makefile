# This file is part of mkchromecast. It is used to build the macOS app.
# It does the following:
#
# 	1) It changes the strings tray and debug to True.
# 	2) Build the application using py2app.
# 	3) Copy Qt plugins.
# 	4) macdeployqt
#
# The clean target does a `git clean -f -d` to delete all untracked
# directories, and does a `git checkout mkchromecast/__init__.py`.
#
# Note: Be careful when using this Makefile, because all files not tracked will
# be deleted, and all changes to mkchromecast/__init__.py will be discarded if
# they are not commited.
#
# How to use it?
# ==============
# 	Test the start_tray.py script:
# 		make clean
# 		make sed
# 		python start_tray.py
# 	Test the application locally
# 		make clean
# 		make test
# 		check inside the dist/ directory
# 	Deploy with debug
# 		make clean
# 		make debug
# 		check inside the dist/ directory
# 	Deploy
# 		make clean
# 		make deploy
# 		check inside the dist/ directory
#
# Note again that make clean will do a checkout of mkchromecast/__init__.py.
#
# Muammar El Khatib
#

# This target is used to test the start_tray.py script that is used to deploy
# the macOS app
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
	cp -R /usr/local/Cellar/qt5/5.8.0/plugins dist/mkchromecast.app/Contents/PlugIns
	/usr/local/Cellar/qt5/5.8.0/bin/macdeployqt dist/mkchromecast.app

# This target creates a standalone app with debugging disabled
deploy:
	sed -i -e  's/tray = args.tray/tray = True/g' mkchromecast/__init__.py
	sed -i -e  's/debug = args.debug/debug = False/g' mkchromecast/__init__.py
	python3 setup.py py2app
	cp -R /usr/local/Cellar/qt5/5.8.0/plugins dist/mkchromecast.app/Contents/PlugIns
	/usr/local/Cellar/qt5/5.8.0/bin/macdeployqt dist/mkchromecast.app -dmg

# This cleans
clean:
	git clean -f -d
	git checkout mkchromecast/__init__.py
	rm -f mkchromecast/*.pyc
