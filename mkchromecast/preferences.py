#!/usr/bin/env python

# This file is part of mkchromecast.

import sys
from PyQt5.QtWidgets import (QWidget, QLabel,
    QComboBox, QApplication)


class Example(QWidget):

    def __init__(self):
        super().__init__()

        self.initUI()


    def initUI(self):
        platform = 'Darwin'

        if platform == 'Darwin':
            self.lbl = QLabel("node", self)
        else:
            self.lbl = QLabel("ffmpeg", self)

        self.backend = QLabel('Select Backend', self)
        self.bitrate = QLabel('Select Bitrate', self)
        self.backend.move(20, 54)
        self.bitrate.move(20, 84)
        combo = QComboBox(self)
        combo.addItem("node")
        combo.addItem("ffmpeg")
        combo.addItem("avconv")

        combo.move(180, 50)
        self.lbl.move(50, 150)

        combo.activated[str].connect(self.onActivated)

        self.setGeometry(300, 300, 300, 200)
        self.setWindowTitle('Preferences')
        self.show()


    def onActivated(self, text):
        self.lbl.setText(text)
        self.lbl.adjustSize()

if __name__ == '__main__':

    app = QApplication(sys.argv)
    ex = Example()
    sys.exit(app.exec_())
