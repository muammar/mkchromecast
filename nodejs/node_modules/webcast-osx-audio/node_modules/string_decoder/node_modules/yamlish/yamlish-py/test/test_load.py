# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals
import unittest


class TestBasics(unittest.TestCase):
    def test_import(self):
        import yamlish
        self.assertTrue(yamlish.__version__,
                        "Testing import of yamlish, version %s."
                        % yamlish.__version__)

if __name__ == "__main__":
    unittest.main()
