/*jshint node:true*/
/*global describe:false, it:false*/
"use strict";

var espree = require('espree');
var expect = require('chai').expect;
var _glob = require('glob');
var _path = require('path');

var esformatter = require('../lib/esformatter');

var _helpers = require('./helpers');
var readOut = _helpers.readOut;
var readIn = _helpers.readIn;
var readConfig = _helpers.readConfig;


// ---


describe('esformatter.format()', function() {

  // we generate the specs dynamically based on files inside the compare
  // folder since it will be easier to write the tests and do the comparison

  describe('default options', function() {

    var pattern = _path.join(_helpers.COMPARE_FOLDER, 'default/*-in.js');
    _glob.sync(pattern).forEach(function(fileName) {

      // we read files before the test to avoid affecting the test
      // benchmark, I/O operations are expensive.
      var id = fileName.replace(/.+(default\/.+)-in\.js/, '$1');

      it(id, function() {
        var input = readIn(id);
        var compare = readOut(id);
        var result = esformatter.format(input);

        expect(result).to.equal(compare);

        // result should be valid JS
        expect(function() {
          try {
            espree.parse(result, esformatter.format.parseOptions);
          } catch (e) {
            throw new Error('esformatter.format() result produced a non-valid output.\n' + e);
          }
        }).to.not.Throw();

        // make sure formatting can be applied multiple times
        // (idempotent)
        expect(esformatter.format(result)).to.equal(compare);
      });

    });

  });


  describe('custom options', function() {

    var pattern = _path.join(_helpers.COMPARE_FOLDER, 'custom/*-in.js');
    _glob.sync(pattern).forEach(function(fileName) {

      // we read files before the test to avoid affecting the test
      // benchmark, I/O operations are expensive.
      var id = fileName.replace(/.+(custom\/.+)-in\.js/, '$1');

      it(id, function() {
        var input = readIn(id);
        var options = readConfig(id);
        var compare = readOut(id);
        var result = esformatter.format(input, options);

        expect(result).to.equal(compare);

        // result should be valid JS
        expect(function() {
          try {
            espree.parse(result, esformatter.format.parseOptions);
          } catch (e) {
            throw new Error('esformatter.format() result produced a non-valid output.\n' + e);
          }
        }).to.not.Throw();

        // make sure formatting can be applied multiple times
        // (idempotent)
        expect(esformatter.format(result, options)).to.equal(compare);
      });

    });

  });


  describe('jquery preset', function() {

    var pattern = _path.join(_helpers.COMPARE_FOLDER, 'jquery/*-in.js');
    _glob.sync(pattern).forEach(function(fileName) {

      // we read files before the test to avoid affecting the test
      // benchmark, I/O operations are expensive.
      var id = fileName.replace(/.+(jquery\/.+)-in\.js/, '$1');

      it(id, function() {
        var input = readIn(id);
        var compare = readOut(id);
        var result = esformatter.format(input, {preset:'jquery'});

        expect(result).to.equal(compare);

        // result should be valid JS
        expect(function() {
          try {
            espree.parse(result, esformatter.format.parseOptions);
          } catch (e) {
            throw new Error('esformatter.format() result produced a non-valid output.\n' + e);
          }
        }).to.not.Throw();

        // make sure formatting can be applied multiple times
        // (idempotent)
        expect(esformatter.format(result, {preset:'jquery'})).to.equal(compare);
      });

    });

  });

  describe('shebang', function() {

    it('should allow by default', function() {
      var result = esformatter.format('#!/usr/bin/env node\nif(foo){bar()}');
      expect(result).to.equal('#!/usr/bin/env node\nif (foo) {\n  bar()\n}');
    });

    it('should throw if not allowed', function() {
      expect(function() {
        esformatter.format('#!/usr/bin/env node\nif(foo){bar()}', {
          esformatter: {
            allowShebang: false
          }
        });
      }).to.Throw();
    });

  });

});

