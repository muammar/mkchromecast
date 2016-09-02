//jshint node:true, eqnull:true
'use strict';

var assert = require('assert');
var disparity = require('disparity');
var fs = require('fs');
var indent = require('../rocambole-indent');
var path = require('path');
var rocambole = require('rocambole');

// ==================
// whiteSpaceToIndent
// ==================

var ws1 = { type: 'WhiteSpace', value: '  ' };
indent.whiteSpaceToIndent(ws1);
assert.equal(ws1.type, 'Indent');
assert.equal(ws1.level, 1);

var ws2 = { type: 'WhiteSpace', value: '  ', prev: { type: 'LineBreak' } };
indent.whiteSpaceToIndent(ws2, '  ');
assert.equal(ws2.type, 'Indent');
assert.equal(ws2.level, 1);

var ws3 = { type: 'WhiteSpace', value: '  ', prev: { type: 'Punctuator' } };
indent.whiteSpaceToIndent(ws3, '  ');
assert.equal(ws3.type, 'WhiteSpace');
assert.equal(ws3.level, undefined);

// =============
// alignComments
// =============

// yes, this will throw if it doesn't support empty nodes/ast
indent.alignComments({});

formatAndCompare(
  'align_comment-input.js',
  'align_comment-output.js',
  indent.alignComments
);

function formatAndCompare(inputFile, expectedFile, method) {
  var input = getFile(inputFile);
  var expected = getFile(expectedFile);
  var ast = rocambole.parse(input);
  method.call(indent, ast);
  var output = ast.toString();

  if (output !== expected) {
    process.stderr.write(disparity.chars(output, expected, {
      paths: ['actual', 'expected']
    }));
    process.exit(1);
  } else {
    console.error('ok %s', inputFile);
  }
}

function getFile(name) {
  return fs.readFileSync(path.join(__dirname, name)).toString();
}
