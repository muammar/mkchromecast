"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function WhileStatement(node) {
  var conditionalStart = _tk.findNext(node.startToken, '(');
  var conditionalEnd = _tk.findPrev(node.body.startToken, ')');

  _limit.around(conditionalStart, 'WhileStatementConditionalOpening');

  if (node.body.type === 'BlockStatement') {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;
    _limit.around(bodyStart, 'WhileStatementOpeningBrace');
    _limit.around(bodyEnd, 'WhileStatementClosingBrace');
    _limit.around(conditionalEnd, 'WhileStatementConditionalClosing');
  } else {
    var next = _tk.findNextNonEmpty(conditionalEnd);
    _limit.before(conditionalEnd, 'WhileStatementConditionalClosing');
    if (_tk.isSemiColon(next)) {
      _limit.after(conditionalEnd, 0);
    } else {
      _limit.after(conditionalEnd, 'WhileStatementConditionalClosing');
    }
  }
};


exports.getIndentEdges = function(node) {
  var edges = [
    {
      startToken: _tk.findNext(node.startToken, '('),
      endToken: _tk.findPrev(node.body.startToken, ')')
    }
  ];

  if (node.body.type !== 'EmptyStatement') {
    edges.push(node.body);
  }

  return edges;
};
