"use strict";

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');


exports.format = function ForOfStatement(node) {
  var expressionStart = _tk.findNext(node.startToken, '(');
  var expressionEnd = _tk.findPrev(node.body.startToken, ')');

  _br.limit(expressionStart, 'ForOfStatementExpressionOpening');
  _ws.limit(expressionStart, 'ForOfStatementExpressionOpening');

  _br.limit(expressionEnd, 'ForOfStatementExpressionClosing');
  _ws.limit(expressionEnd, 'ForOfStatementExpressionClosing');

  if (node.body.type === 'BlockStatement' && node.body.body.length) {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;

    _br.limit(bodyStart, 'ForOfStatementOpeningBrace');
    _ws.limit(bodyStart, 'ForOfStatementOpeningBrace');

    _br.limit(bodyEnd, 'ForOfStatementClosingBrace');
    _ws.limit(bodyEnd, 'ForOfStatementClosingBrace');

    _ws.limitAfter(expressionEnd, 'ForOfStatementExpression');
  }

  _ws.limitAfter(node.left.endToken, 1);
  _ws.limitBefore(node.right.startToken, 1);
};


exports.getIndentEdges = function(node) {
  var edges = [];

  edges.push({
    startToken: node.left.startToken,
    endToken: node.right.endToken
  });

  if (node.body.type === 'BlockStatement') {
    edges.push(node.body);
  } else {
    edges.push({
      startToken: _tk.findNext(node.right.endToken, ')').next,
      endToken: node.endToken
    });
  }

  return edges;
};
