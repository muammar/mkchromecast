# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals
import yamlish
import test
import unittest

test_data_list = [{
    "name": 'Non UTF8 test',
    "in": [b"--- macro `BR\xc3\xc2\xa0fbi' not defined",
           '...', ],
    "out": "macro `BR\xa0fbi' not defined",
}]

""

class TestReader(unittest.TestCase):  # IGNORE:C0111
    pass

test.generate_testsuite(test_data_list, TestReader, yamlish.load,
                        options={'ignore_wrong_characters': True})

if __name__ == "__main__":
    unittest.main()
