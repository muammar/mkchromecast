'use strict';

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');

exports.format = function ExportDefaultDeclaration(node) {
  var def = _tk.findNext(node.startToken, 'default');
  _br.limit(def, 0);
  _ws.limit(def, 1);
};
