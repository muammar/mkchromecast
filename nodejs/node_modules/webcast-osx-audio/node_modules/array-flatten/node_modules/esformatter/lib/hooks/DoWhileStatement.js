'use strict';

var _tk = require('rocambole-token');
var _limit = require('../limit');
var _ws = require('rocambole-whitespace');


exports.format = function DoWhileStatement(node) {
  if (node.body.type === 'BlockStatement') {
    _limit.around(node.body.startToken, 'DoWhileStatementOpeningBrace');
    _limit.around(node.body.endToken, 'DoWhileStatementClosingBrace');
  } else {
    _ws.limitAfter(node.startToken, 1);
  }
  var whileKeyword = _tk.findPrev(node.test.startToken, 'while');
  _ws.limit(whileKeyword, 1);
};


exports.getIndentEdges = function(node) {
  return [
    { // do
      startToken: node.startToken.next,
      endToken: node.body.endToken
    },
    { // while
      startToken: _tk.findNext(node.body.endToken, '('),
      endToken: _tk.findPrev(node.endToken, ')')
    }
  ];
};
