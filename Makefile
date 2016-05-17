all:
	python3 start_tray.py
	cp -R /usr/local/Cellar/qt5/5.6.0/plugins dist/mkchromecast.app/Contents/PlugIns
	/usr/local/Cellar/qt5/5.6.0/bin/macdeployqt dist/mkchromecast.app
clean:
	git clean -f -d
