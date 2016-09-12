//jshint node:true, eqnull:true
/*global describe, it, before*/
'use strict';

var esformatter = require('esformatter');
var fs = require('fs');
var quotes = require('../');
var expect = require('chai').expect;


describe('compare input/output', function() {

  var input;

  before(function() {
    input = getFile('input.js');
    esformatter.register(quotes);
  });

  describe('single quote', function() {
    it('should convert to single quotes and normalize escapes', function() {
      var output = esformatter.format(input, {
        quotes: {
          type: 'single'
        }
      });
      expect(output).to.be.eql(getFile('output-single.js'));
    });

    it('should avoid escape', function() {
      var output = esformatter.format(input, {
        quotes: {
          type: 'single',
          avoidEscape: true
        }
      });
      expect(output).to.be.eql(getFile('output-single-avoid.js'));
    });
  });

  describe('double quote', function() {
    it('should convert to double quotes and normalize escapes', function() {
      var output = esformatter.format(input, {
        quotes: {
          type: 'double'
        }
      });
      expect(output).to.be.eql(getFile('output-double.js'));
    });

    it('should avoid escape', function() {
      var output = esformatter.format(input, {
        quotes: {
          type: 'double',
          avoidEscape: true
        }
      });
      expect(output).to.be.eql(getFile('output-double-avoid.js'));
    });
  });

});


function getFile(name) {
  return fs.readFileSync('test/compare/' + name).toString();
}
