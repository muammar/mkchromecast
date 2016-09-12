"use strict";

var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');
var debug = require('debug')('esformatter:parentheses');


exports.addSpaceInside = addSpaceInsideExpressionParentheses;
function addSpaceInsideExpressionParentheses(node) {
  var parentheses = getParentheses(node);
  if (parentheses) {
    _ws.limitAfter(parentheses.opening, 'ExpressionOpeningParentheses');
    _ws.limitBefore(parentheses.closing, 'ExpressionClosingParentheses');
  }
}


exports.getParentheses = getParentheses;
function getParentheses(node) {
  if (!isValidExpression(node)) {
    debug('not valid expression: %s', node.type);
    return;
  }

  var opening = node.startToken;
  if (/^(?:Binary|Logical)Expression$/.test(node.type) || opening.value !== '(') {
    opening = _tk.findPrevNonEmpty(opening);
  }

  if (!opening || opening.value !== '(') {
    // "safe" to assume it is not inside parentheses
    debug(
      'opening is not a parentheses; type: %s, opening: "%s"',
      node.type,
      opening && opening.value
    );
    return;
  }

  var token = opening;
  var count = 0;
  var closing;

  while (token) {
    if (token.value === '(') {
      count += 1;
    } else if (token.value === ')') {
      count -= 1;
    }
    if (count === 0) {
      closing = token;
      break;
    }
    token = token.next;
  }

  if (!closing) {
    debug('not inside parentheses', count);
    return;
  }

  debug(
    'found parentheses; type: %s, opening: "%s", closing: "%s"',
    node.type,
    opening && opening.value,
    closing && closing.value
  );

  return {
    opening: opening,
    closing: closing
  };
}

// Literal when inside BinaryExpression might be surrounded by parenthesis
// CallExpression and ArrayExpression don't need spaces
var needExpressionParenthesesSpaces = {
  Literal: true,
  CallExpression: false,
  FunctionExpression: false,
  ArrayExpression: false,
  ObjectExpression: false,
  // Special is used when we need to override default behavior
  Special: true
};


function isValidExpression(node) {
  var needSpaces = needExpressionParenthesesSpaces[node.type];

  if (needSpaces) {
    return true;
  }

  if (needSpaces == null && node.type.indexOf('Expression') !== -1) {
    if (node.type === 'ExpressionStatement' &&
      (node.expression.callee && node.expression.callee.type === 'FunctionExpression')) {
      // bypass IIFE
      return false;
    }
    return true;
  }

  return false;
}

