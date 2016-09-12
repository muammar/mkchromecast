'use strict';

var tk = require('rocambole-token');
var rocambole = require('rocambole');


exports.transformBefore = transformBefore;
function transformBefore(ast) {
  rocambole.moonwalk(ast, literalNotation);
}


function literalNotation(node) {
  if (node.type !== 'NewExpression') {
    return;
  }

  var hasArgs = node.arguments.length > 0;

  if (node.callee.name === 'Object') {
    convertObject(node, hasArgs);
    return;
  }

  if (node.callee.name === 'Array') {
    if (hasArgs) {
      return;
    }

    convertArray(node);
    return;
  }
}


function convertObject(node, keepBraces) {
  var endToken = node.endToken;
  var token = node.startToken;

  while (token !== endToken) {
    if (keepBraces && token.value === '{') {
      break;
    }

    tk.remove(token);
    token = token.next;
  }

  if (!keepBraces) {
    node.startToken = tk.before(endToken, {
      type: 'Punctuator',
      value: '{'
    });

    node.endToken = tk.after(endToken, {
      type: 'Punctuator',
      value: '}'
    });
  }

  tk.remove(endToken);
}


function convertArray(node) {
  var endToken = node.endToken;
  var token = node.startToken;

  while (token !== endToken) {
    tk.remove(token);
    token = token.next;
  }

  node.startToken = tk.before(endToken, {
    type: 'Punctuator',
    value: '['
  });

  node.endToken = tk.after(endToken, {
    type: 'Punctuator',
    value: ']'
  });

  tk.remove(endToken);
}
