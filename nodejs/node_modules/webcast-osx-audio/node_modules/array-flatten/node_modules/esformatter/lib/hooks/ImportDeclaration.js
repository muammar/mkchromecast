'use strict';

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');

exports.format = function ImportDeclaration(node) {
  _br.limitAfter(node.startToken, 0);
  _ws.limitAfter(node.startToken, 1);

  // node.specifiers is actually handled by the ImportSpecifier hook!

  if (!node.specifiers.length) return;

  var fromKeyword = _tk.findPrev(node.endToken, 'from');
  _br.limit(fromKeyword, 0);
  _ws.limit(fromKeyword, 1);
};
