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
# 	Test the application
# 		make test
# 	Deploy
# 	make clean
# 	make deploy
#
# Muammar El Khatib
#

test:
	sed -i -e  's/tray = args.tray/tray = True/g' mkchromecast/__init__.py
	sed -i -e  's/select_cc = args.select_cc/select_cc = True/g' mkchromecast/__init__.py
	python3 setup.py py2app -A
deploy:
	sed -i -e  's/tray = args.tray/tray = True/g' mkchromecast/__init__.py
	sed -i -e  's/select_cc = args.select_cc/select_cc = True/g' mkchromecast/__init__.py
	python3 setup.py py2app
	cp -R /usr/local/Cellar/qt5/5.6.0/plugins dist/mkchromecast.app/Contents/PlugIns
	/usr/local/Cellar/qt5/5.6.0/bin/macdeployqt dist/mkchromecast.app
clean:
	git clean -f -d
	git checkout mkchromecast/__init__.py
	rm -f mkchromecast/*.pyc
