# -*- mode: python -*-

block_cipher = None


a = Analysis(['start_tray.py'],
             pathex=['/Users/muammar/github/mkchromecast'],
             binaries=[],
             datas=[
             ('mkchromecast', 'mkchromecast'),
             ('bin', 'bin'),
             ('images', 'images'),
             ('nodejs', 'nodejs'),
             ('notifier', 'notifier')
             ],
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
          exclude_binaries=True,
          name='start_tray',
          debug=False,
          strip=False,
          upx=True,
          console=False , icon='images/google.icns')
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               name='start_tray')
app = BUNDLE(coll,
             name='mkchromecast.app',
             icon='images/google.icns',
             bundle_identifier=None)
