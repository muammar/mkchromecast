/*jshint node:true*/
/*global describe:false, it:false*/
'use strict';

var expect = require('chai').expect;
var esformatter = require('../lib/esformatter');

describe('esformatter.diff', function() {

  describe('diff.chars()', function() {
    it('should return empty string if formatted properly', function() {
      var code = 'var foo = "bar"';
      expect(esformatter.diff.chars(code)).to.equal('');
    });

    it('should return differences if not following style', function() {
      var code = 'var foo="bar"';
      var result = esformatter.diff.chars(code);
      expect(result).to.equal([
        '\u001b[41mactual\u001b[49m \u001b[42mexpected\u001b[49m',
        '',
        '1 | var foo\u001b[42m \u001b[49m=\u001b[42m \u001b[49m"bar"',
        ''
      ].join('\n'));
    });

    it('should display header if file path is provided', function() {
      var code = 'var foo="bar"';
      var result = esformatter.diff.chars(code, null, 'foo/bar.js');
      expect(result).to.equal([
        '\u001b[36mfoo/bar.js\u001b[39m',
        '\u001b[36m================================================================================\u001b[39m',
        '\u001b[41mactual\u001b[49m \u001b[42mexpected\u001b[49m',
        '',
        '1 | var foo\u001b[42m \u001b[49m=\u001b[42m \u001b[49m"bar"',
        ''
      ].join('\n'));
    });
  });

  describe('diff.unified()', function() {
    it('should return empty string if formatted properly', function() {
      var code = 'var foo = "bar"';
      expect(esformatter.diff.unified(code)).to.equal('');
    });

    it('should return differences if not following style', function() {
      var code = 'var foo="bar"\n';
      var result = esformatter.diff.unified(code);
      expect(result).to.equal([
        '\u001b[33m--- actual\u001b[39m',
        '\u001b[33m+++ expected\u001b[39m',
        '\u001b[35m@@ -1,1 +1,1 @@\u001b[39m',
        '\u001b[31m-var foo="bar"\u001b[39m',
        '\u001b[32m+var foo = "bar"\u001b[39m',
        ''
      ].join('\n'));
    });

    it('should display file path', function() {
      var code = 'var foo="bar"\n';
      var result = esformatter.diff.unified(code, null, 'lorem/ipsum.js');
      expect(result).to.equal([
        '\u001b[33m--- lorem/ipsum.js	actual\u001b[39m',
        '\u001b[33m+++ lorem/ipsum.js	expected\u001b[39m',
        '\u001b[35m@@ -1,1 +1,1 @@\u001b[39m',
        '\u001b[31m-var foo="bar"\u001b[39m',
        '\u001b[32m+var foo = "bar"\u001b[39m',
        ''
      ].join('\n'));
    });
  });

  describe('diff.unifiedNoColor()', function() {
    it('should return empty string if formatted properly', function() {
      var code = 'var foo = "bar"';
      expect(esformatter.diff.unifiedNoColor(code)).to.equal('');
    });

    it('should return differences if not following style', function() {
      var code = 'var foo="bar"\n';
      var result = esformatter.diff.unifiedNoColor(code);
      expect(result).to.equal([
        '--- actual',
        '+++ expected',
        '@@ -1,1 +1,1 @@',
        '-var foo="bar"',
        '+var foo = "bar"',
        ''
      ].join('\n'));
    });

    it('should display file path', function() {
      var code = 'var foo="bar"\n';
      var result = esformatter.diff.unifiedNoColor(code, null, 'foo/bar.js');
      expect(result).to.equal([
        '--- foo/bar.js	actual',
        '+++ foo/bar.js	expected',
        '@@ -1,1 +1,1 @@',
        '-var foo="bar"',
        '+var foo = "bar"',
        ''
      ].join('\n'));
    });
  });
});
