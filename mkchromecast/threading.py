from PyQt5.QtCore import QThread, QObject, pyqtSignal, pyqtSlot
from mkchromecast.cast import *


class Worker(QObject):
    finished = pyqtSignal()
    intReady = pyqtSignal(list)
    def __init__(self):
        QObject.__init__(self)

    @pyqtSlot()
    def _search_cast_(self):
        self.cc = casting()
        self.cc.initialize_cast()
        if len(self.cc.availablecc) == 0 and args.tray == True:
            availablecc = []
            self.intReady.emit(availablecc)
            self.finished.emit()
        else:
            availablecc = self.cc.availablecc
            self.intReady.emit(availablecc)
            self.finished.emit()
