"""
py2app build script for MyApplication

Usage:
    python setup.py py2app -A --packages=PyQt5
"""
from setuptools import setup
setup(
        app=["systray.py"],
setup_requires=["py2app"],
)
