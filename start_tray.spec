# -*- mode: python -*-

block_cipher = None


a = Analysis(['start_tray.py'],
             pathex=['/Users/muammar/github/mkchromecast'],
             binaries=None,
             datas=None,
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='start_tray',
          debug=False,
          strip=False,
          upx=True,
          console=False , icon='images/google.icns')
app = BUNDLE(exe,
             name='start_tray.app',
             icon='images/google.icns',
             bundle_identifier=None)
