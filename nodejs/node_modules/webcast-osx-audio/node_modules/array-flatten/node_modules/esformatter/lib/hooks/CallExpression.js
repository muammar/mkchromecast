"use strict";

var _tk = require('rocambole-token');
var _br = require('rocambole-linebreak');
var _ws = require('rocambole-whitespace');
var _limit = require('../limit');
var _parens = require('./expressionParentheses');


exports.format = function CallExpression(node) {
  var openingParentheses = _tk.findNext(node.callee.endToken, _tk.isCode);
  var closingParentheses = node.endToken;
  var hasParentheses = closingParentheses.value === ')';

  // NewExpression is almost the same as CallExpression, simpler to keep it here
  if (node.type === 'NewExpression') {
    _br.limitAfter(node.startToken, 0);
    _ws.limitAfter(node.startToken, 1);
  }

  if (hasParentheses) {
    _limit.around(openingParentheses, 'CallExpressionOpeningParentheses');
    _limit.around(closingParentheses, 'CallExpressionClosingParentheses');
  }

  var args = node['arguments'];

  if (args.length) {
    _limit.before(_tk.findNextNonEmpty(openingParentheses), 'ArgumentList');

    args.forEach(function(arg) {
      var next = _tk.findInBetween(arg.endToken, closingParentheses, ',');
      if (next && next.value === ',') {
        _limit.around(next, 'ArgumentComma');
      }
    });

    _limit.after(_tk.findPrevNonEmpty(closingParentheses), 'ArgumentList');

  } else if (hasParentheses) {
    _limit.after(openingParentheses, 0);
    _limit.before(closingParentheses, 0);
  }

  // iife
  if (node.callee.type !== 'FunctionExpression') {
    return;
  }

  var parens = _parens.getParentheses({
    type: 'Special',
    startToken: node.startToken,
    endToken: node.endToken
  });

  if (parens) {
    _limit.after(parens.opening, 'IIFEOpeningParentheses');
    _limit.before(parens.closing, 'IIFEClosingParentheses');
  }

};

exports.getIndentEdges = function(node, opts) {

  var openingParentheses = _tk.findNext(node.callee.endToken, _tk.isCode);
  if (openingParentheses.value !== '(') return;

  if (!node.arguments.length) {
    // it might contain comments inside even tho there are no args
    return {
      startToken: openingParentheses,
      endToken: _tk.findNext(openingParentheses, ')')
    };
  }

  var start;

  function hasBr(start, end) {
    return _tk.findInBetween(start, end, _tk.isBr);
  }

  node.arguments.some(function(arg, i, args) {
    var prev = i ? args[i - 1].endToken.next : openingParentheses;
    if (hasBr(prev, arg.startToken)) {
      start = prev;
      return true;
    }
  });

  if (!start) {
    // we handle BinaryExpressions here because multiple operations are grouped
    // inside the same root node, and we need to indent if it breaks lines
    node.arguments.some(function(arg) {
      if (opts['CallExpression.' + arg.type] &&
        hasBr(arg.startToken, arg.endToken)) {
        start = arg.startToken.next;
        return true;
      }
    });
  }

  return start ? {
    startToken: start,
    endToken: node.endToken
  } : false;

};
