# coding: utf-8
from setuptools import setup
requires_list = [
    "PyYAML>=3.09"
]
import os.path


def read(fname):
    with open(os.path.join(os.path.dirname(__file__), fname)) as inf:
        return "\n" + inf.read().replace("\r\n", "\n")

setup(
    name='yamlish',
    version="0.17.0",
    description='Python implementation of YAMLish',
    author='Matěj Cepl',
    author_email='mcepl@redhat.com',
    url='https://github.com/mcepl/yamlish/',
    py_modules=['yamlish'],
    long_description=read("README.rst"),
    keywords=['TAP', 'YAML', 'yamlish'],
    classifiers=[
        "Programming Language :: Python",
        "Programming Language :: Python :: 2",
        "Programming Language :: Python :: 2.6",
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: Implementation :: PyPy",
        "Programming Language :: Python :: 3.3",
        "Programming Language :: Python :: 3.4",
        "Development Status :: 5 - Production/Stable",
        "Environment :: Console",
        "Intended Audience :: Information Technology",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Text Processing :: Markup",
    ],
    test_suite="test",
    install_requires=requires_list
)
