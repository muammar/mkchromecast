"use strict";

var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');


exports.format = function ConditionalExpression(node) {
  // we need to grab the actual punctuators since parenthesis aren't counted
  // as part of test/consequent/alternate
  var questionMark = _tk.findNext(node.test.endToken, '?');
  var colon = _tk.findNext(node.consequent.endToken, ':');

  _ws.limitBefore(questionMark, _ws.expectedAfter('ConditionalExpressionTest'));
  _ws.limitAfter(questionMark, _ws.expectedBefore('ConditionalExpressionConsequent'));
  _ws.limitBefore(colon, _ws.expectedAfter('ConditionalExpressionConsequent'));
  _ws.limitAfter(colon, _ws.expectedBefore('ConditionalExpressionAlternate'));
};


exports.getIndentEdges = function(node) {
  if (_tk.findInBetween(node.test.endToken, node.consequent.startToken, _tk.isBr)) {
    return {
      startToken: node.test.endToken.next,
      endToken: node.endToken.next
    };
  }
  if (_tk.findInBetween(node.consequent.endToken, node.alternate.startToken, _tk.isBr)) {
    return {
      startToken: node.consequent.endToken.next,
      endToken: node.endToken.next
    };
  }
};
