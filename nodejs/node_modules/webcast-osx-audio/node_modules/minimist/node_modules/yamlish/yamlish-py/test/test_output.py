# -*- coding: utf-8 -*-
"""
Test general output functionality.

Without much stress on the format itself.
"""
from __future__ import absolute_import, print_function, unicode_literals
import yamlish
import yaml
import logging
import tempfile
import unittest

OUT = """---
bill-to:
  address:
    city: Royal Oak
    lines: "458 Walkman Dr.\\nSuite #292\\n"
    postal: 48046
    state: MI
  family: Dumars
  given: Chris
comments: Late afternoon is best. Backup contact is Nancy Billsmer @ 338-4338
date: 2001-01-23
invoice: 34843
product:
  -
    description: Basketball
    price: 450.00
    quantity: 4
    sku: BL394D
  -
    description: Super Hoop
    price: 2392.00
    quantity: 1
    sku: BL4438H
tax: 251.42
total: 4443.52
...
"""

IN = {
  'bill-to': {
    'given': 'Chris',
    'address': {
      'city': 'Royal Oak',
      'postal': 48046,
      'lines': "458 Walkman Dr.\nSuite #292\n",
      'state': 'MI'
    },
    'family': 'Dumars'
  },
  'invoice': 34843,
  'date': '2001-01-23',
  'tax': 251.42,
  'product': [
    {
      'sku': 'BL394D',
      'quantity': 4,
      'price': 450.00,
      'description': 'Basketball'
    },
    {
      'sku': 'BL4438H',
      'quantity': 1,
      'price': 2392.00,
      'description': 'Super Hoop'
    }
  ],
  'comments': "Late afternoon is best. Backup contact is Nancy Billsmer @ 338-4338",
  'total': 4443.52
}


class TestOuptut(unittest.TestCase):
    def setUp(self):
        """
        Transform expected list into string which we actually use.
        """
        self._expected = yaml.safe_load(OUT)

    def test_file_output(self):
        """
        Test output to a file.
        """
        outf = tempfile.TemporaryFile()
        yamlish.dump(IN, outf)
        outf.seek(0)
        got_str = outf.read()
        outf.close()
        logging.debug("got_str = %s", got_str)
        got = yaml.safe_load(got_str)
        self.assertEqual(got, self._expected, "Result matches")

    def test_string_output(self):
        """
        Test output to a string.
        """
        got_str = yamlish.dumps(IN)
        got = yaml.load(got_str)
        self.assertEqual(got, self._expected, "Result matches")

if __name__ == "__main__":
    unittest.main()
