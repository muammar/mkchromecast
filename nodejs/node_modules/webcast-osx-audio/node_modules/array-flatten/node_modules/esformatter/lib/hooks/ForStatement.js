"use strict";

var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');
var _limit = require('../limit');


exports.format = function ForStatement(node) {
  var semi_1 = _tk.findNext(node.startToken, ';');
  var semi_2 = _tk.findPrev(node.body.startToken, ';');
  _ws.limit(semi_1, 'ForStatementSemicolon');
  _ws.limit(semi_2, 'ForStatementSemicolon');

  var expressionStart = _tk.findNext(node.startToken, '(');
  var expressionEnd = _tk.findPrev(node.body.startToken, ')');
  _limit.around(expressionStart, 'ForStatementExpressionOpening');
  _limit.around(expressionEnd, 'ForStatementExpressionClosing');

  if (node.body.type === 'BlockStatement') {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;
    _limit.around(bodyStart, 'ForStatementOpeningBrace');
    _limit.around(bodyEnd, 'ForStatementClosingBrace');
  }
};


exports.getIndentEdges = function(node) {
  var edges = [];

  var args = {
    startToken: _tk.findNext(node.startToken, '('),
    endToken: _tk.findPrev(node.body.startToken, ')')
  };
  edges.push(args);

  if (node.body.type === 'BlockStatement') {
    edges.push(node.body);
  } else {
    edges.push({
      startToken: args.endToken,
      endToken: node.endToken
    });
  }

  return edges;
};
