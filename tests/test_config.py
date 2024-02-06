# this file is part of mkchromecast.

import configparser
import os
import pathlib
import unittest
from unittest import mock

import mkchromecast
from mkchromecast import config

class ClampBitrateTests(unittest.TestCase):
    def setUp(self):
        mock_mkcc = self.enterContext(mock.patch.object(
            mkchromecast, "Mkchromecast", autospec=True))
        self.enterContext(mock.patch.object(os, "environ", autospec=True))
        self.enterContext(mock.patch.object(configparser, "ConfigParser", autospec=True))

    def testInstantiateNewConfig(self):
        config_path = pathlib.PurePath("/fake_dir/fake_path.txt")
        conf = config.Config(config_path)

    def testPropertyGetters(self):
        config_path = pathlib.PurePath("/fake_dir/fake_path.txt")
        conf = config.Config(config_path)
        mock_parser = configparser.ConfigParser.return_value
        props = {
            "codec": str,
            "bitrate": int,
            "samplerate": int,
            "notifications": bool,
            "colors": str,
            "search_at_launch": bool,
            "alsa_device": str}

        for prop_name, prop_type in props.items():
            with self.subTest(prop=prop_name):
                mock_parser.reset_mock()
                field_name = prop_name.replace("_", "")
                _ = getattr(conf, prop_name)

                if prop_type == str:
                    mock_parser.get.assert_called_once_with(
                        config.SETTINGS, field_name)
                    mock_parser.getboolean.assert_not_called()
                    mock_parser.getint.assert_not_called()
                elif prop_type == int:
                    mock_parser.get.assert_not_called()
                    mock_parser.getint.assert_called_once_with(
                        config.SETTINGS, field_name)
                    mock_parser.getboolean.assert_not_called()
                elif prop_type == bool:
                    mock_parser.get.assert_not_called()
                    mock_parser.getint.assert_not_called()
                    mock_parser.getboolean.assert_called_once_with(
                        config.SETTINGS, field_name)

    def testPropertyGetters(self):
        config_path = pathlib.PurePath("/fake_dir/fake_path.txt")
        conf = config.Config(config_path)
        mock_parser = configparser.ConfigParser.return_value
        props = {
            "codec": str,
            "bitrate": int,
            "samplerate": int,
            "notifications": bool,
            "colors": str,
            "search_at_launch": bool,
            "alsa_device": str}

        for prop_name, prop_type in props.items():
            with self.subTest(prop=prop_name):
                mock_parser.reset_mock()
                field_name = prop_name.replace("_", "")
                _ = getattr(conf, prop_name)

                if prop_type == str:
                    mock_parser.get.assert_called_once_with(
                        config.SETTINGS, field_name)
                    mock_parser.getboolean.assert_not_called()
                    mock_parser.getint.assert_not_called()
                elif prop_type == int:
                    mock_parser.get.assert_not_called()
                    mock_parser.getint.assert_called_once_with(
                        config.SETTINGS, field_name)
                    mock_parser.getboolean.assert_not_called()
                elif prop_type == bool:
                    mock_parser.get.assert_not_called()
                    mock_parser.getint.assert_not_called()
                    mock_parser.getboolean.assert_called_once_with(
                        config.SETTINGS, field_name)

    def testPropertySetters(self):
        config_path = pathlib.PurePath("/fake_dir/fake_path.txt")
        conf = config.Config(config_path)
        mock_parser = configparser.ConfigParser.return_value
        props = {
            "codec": str,
            "bitrate": int,
            "samplerate": int,
            "notifications": bool,
            "colors": str,
            "search_at_launch": bool,
            "alsa_device": str}

        for prop_name, prop_type in props.items():
            with self.subTest(prop=prop_name):
                mock_parser.reset_mock()
                field_name = prop_name.replace("_", "")
                value = prop_type()
                setattr(conf, prop_name, value)

                mock_parser.set.assert_called_once_with(
                    config.SETTINGS, field_name, str(value))
