#!/usr/bin/env python

from PyQt5 import QtCore, QtGui, QtWidgets
import signal

self.cc = casting()

def main():

    signal.signal(signal.SIGINT, signal.SIG_DFL)

    app = QtWidgets.QApplication([])

    icon = QtGui.QIcon('images/google.ico')
    tray = QtWidgets.QSystemTrayIcon(icon)
    menu = QtWidgets.QMenu()
    SearchAction = menu.addAction("Search for Google cast devices")
    StopAction = menu.addAction("Stop casting")
    resetAction = menu.addAction("Reset audio")
    preferencesAction = menu.addAction("Preferences")
    exitAction = menu.addAction("Exit")
    exitAction.triggered.connect(app.quit)
    tray.setContextMenu(menu)
    tray.show()


    app.exec_()

if __name__ == '__main__':
    main()
