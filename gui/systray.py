#!/usr/bin/env python

from PyQt5 import QtCore, QtGui, QtWidgets
import signal


def main():

    signal.signal(signal.SIGINT, signal.SIG_DFL)

    app = QtWidgets.QApplication([])

    icon = QtGui.QIcon('google.ico')
    tray = QtWidgets.QSystemTrayIcon(icon)
    menu = QtWidgets.QMenu()
    exitAction = menu.addAction("Exit")
    tray.setContextMenu(menu)
    tray.show()


    app.exec_()


if __name__ == '__main__':
    main()
