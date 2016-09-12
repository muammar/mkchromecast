'use strict';

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');

exports.format = function ExportAllDeclaration(node) {
  var star = _tk.findNext(node.startToken, '*');
  _br.limit(star, 0);
  _ws.limit(star, 1);

  var fromKeyword = _tk.findNext(node.startToken, 'from');
  _br.limit(fromKeyword, 0);
  _ws.limit(fromKeyword, 1);
};
