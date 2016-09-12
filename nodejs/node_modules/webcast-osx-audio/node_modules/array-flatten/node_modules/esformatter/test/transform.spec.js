/*jshint node:true*/
/*global describe:false, it:false*/
"use strict";

var expect = require('chai').expect;

var esformatter = require('../lib/esformatter');
var rocambole = require('rocambole');


// ---


describe('esformatter.transform()', function() {

  it('should transform rocambole AST in place', function() {
    var inputAST = rocambole.parse('var foo = 123;');
    var outputAST = esformatter.transform(inputAST);
    expect(outputAST).to.be.equal(inputAST);
  });


  it('should allow options as second arg', function() {
    var inputAST = rocambole.parse('var foo = 123;');
    var outputAST = esformatter.transform(inputAST, {
      whiteSpace: {
        after: {
          VariableName: 0
        },
        before: {
          VariableValue: 0
        }
      }
    });
    expect(outputAST.toString()).to.be.equal('var foo=123;');
  });


});
