//jshint node:true
/*global describe, it*/
"use strict";

var expect = require('chai').expect;
var esformatter = require('../lib/esformatter');

var input = 'var foo = bar;\nfunction bar(dolor, amet) {\n  return dolor + amet;\n}';
var output1 = '\n// ---- esformatter-pipe-test-1 ---\n';
var output2 = '\n// ---- esformatter-pipe-test-2 ---\n';

describe('pipe', function() {

  it('should call piped commands', function() {
    var out = esformatter.format(input, {
      pipe: {
        before: [
          'esformatter-pipe-test-1',
        ],
        after: [
          'esformatter-pipe-test-2'
        ]
      }
    });
    expect(out).to.eql(input + output1 + output2);
  });

  it('should call piped commands in order', function() {
    var out = esformatter.format(input, {
      pipe: {
        after: [
          'esformatter-pipe-test-2',
          'esformatter-pipe-test-1'
        ]
      }
    });
    expect(out).to.eql(input + output2 + output1);
  });

  it('should throw error if command not found', function() {
    expect(function() {
      esformatter.format(input, {
        pipe: {
          before: [
            'esformatter-fake-pipe-command'
          ]
        }
      });
    }).to.throw();
  });

});
