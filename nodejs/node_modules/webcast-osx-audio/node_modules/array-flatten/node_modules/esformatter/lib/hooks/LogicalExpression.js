"use strict";

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');


exports.format = function LogicalExpression(node) {
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _ws.limit(operator, 'LogicalExpressionOperator');
  // revert line breaks since parenthesis might not be part of
  // node.startToken and node.endToken
  if (node.parent.type === 'ExpressionStatement') {
    var prev = _tk.findPrevNonEmpty(node.left.startToken);
    if (prev && prev.value === '(') {
      _br.limit(prev, 'ExpressionOpeningParentheses');
      _ws.limit(prev, 'ExpressionOpeningParentheses');
      node.startToken = prev;
    }
    var next = _tk.findNextNonEmpty(node.right.endToken);
    if (next && next.value === ')') {
      _br.limit(next, 'ExpressionClosingParentheses');
      _ws.limit(next, 'ExpressionClosingParentheses');
      node.endToken = next;
    }
  }
};
