"use strict";

var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');


exports.format = function BinaryExpression(node) {
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _ws.limit(operator, 'BinaryExpressionOperator');
};

exports.getIndentEdges = function(node) {
  // we only add indent for the top most BinaryExpression (in case we have
  // multiple operations in a row)
  if (node.parent.type === 'BinaryExpression') {
    return;
  }

  return {
    startToken: node.startToken.next,
    endToken: node.endToken.next || node.endToken
  };
};
