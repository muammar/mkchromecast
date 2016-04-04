"""
py2app build script for MyApplication

Usage:
    python setup.py py2app -A --packages=PyQt5 --iconfile images/google.icns
"""
from setuptools import setup
setup(
        app=["systray.py"],
setup_requires=["py2app"],
)
