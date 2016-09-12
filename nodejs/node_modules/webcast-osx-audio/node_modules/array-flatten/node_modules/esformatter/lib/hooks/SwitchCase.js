"use strict";

var _ws = require('rocambole-whitespace');
var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var limit = require('../limit');


exports.format = function SwitchCase(node) {
  if (node.test) {
    // we want case to always be on the same line!
    _br.limitBefore(node.test.startToken, 0);
    _ws.limitBefore(node.test.startToken, 1);
  }
  var endToken = node.endToken;

  var colon = _tk.findNext(node.startToken, ':');
  limit.before(colon, 'SwitchCaseColon');
  limit.after(colon, 'SwitchCaseColon');

  // endToken might be ":" or "break" or ";"
  var breakKeyword = _tk.findInBetweenFromEnd(node.startToken, endToken.next, 'break');
  if (breakKeyword) {
    limit.before(breakKeyword, 'BreakKeyword');
    limit.after(endToken, 'BreakKeyword');
  }
};


exports.getIndentEdges = function(node) {
  return {
    startToken: node.startToken,
    // we need to get the next token because `default` might end with a `}`
    // (ie. IfStatement) we also need to search for next `case` or `}` or
    // `break` or `default` to make sure comments are included inside the range
    endToken: _tk.findNext(node.endToken, ['}', 'case', 'break', 'default']).prev
  };
};
