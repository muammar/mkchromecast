"use strict";

var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');
var _br = require('rocambole-linebreak');
var helpers = require('../helpers');


exports.format = function AssignmentExpression(node) {
  // can't use node.right.startToken since it might be surrounded by
  // a parenthesis (see #5)
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _br.limit(operator, 'AssignmentOperator');
  _ws.limit(operator, 'AssignmentOperator');
};


exports.getIndentEdges = function(node, opts) {
  var operator = _tk.findNext(node.left.endToken, node.operator);
  if (_tk.findInBetween(operator, node.right.startToken, _tk.isBr) ||
    (helpers.shouldIndentChild(node, node.right, opts) &&
    _tk.findInBetween(operator, node.right.endToken, _tk.isBr))) {
    // we only indent if assignment is on next line
    return {
      level: opts['AssignmentExpression.' + node.right.type],
      startToken: operator,
      endToken: node.endToken.type !== 'Punctuator' ?
        node.endToken.next : node.endToken
    };
  }
};
