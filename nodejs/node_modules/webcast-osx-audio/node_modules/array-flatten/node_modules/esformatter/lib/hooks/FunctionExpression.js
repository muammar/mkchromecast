"use strict";

var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');
var _params = require('./Params');
var _limit = require('../limit');


exports.format = function FunctionExpression(node) {
  _limit.around(node.body.startToken, 'FunctionExpressionOpeningBrace');
  _limit.around(node.endToken, 'FunctionExpressionClosingBrace');

  var startToken = node.startToken;
  if (node.id) {
    _ws.limit(node.id.startToken, 'FunctionName');
  } else if (startToken.value === 'function') {
    if (node.generator) {
      startToken = _tk.findNextNonEmpty(startToken);
      _ws.limitBefore(startToken, 'FunctionGeneratorAsterisk');
    }

    _ws.limit(startToken, 'FunctionReservedWord');
  }

  if (_tk.isWs(node.endToken.next) &&
    _tk.isSemiColon(node.endToken.next.next)) {
    _tk.remove(node.endToken.next);
  }

  if (node.parent.type === 'CallExpression') {
    _ws.limitAfter(node.endToken, 0);
  }

  var bodyFirstNonEmpty = _tk.findNextNonEmpty(node.body.startToken);
  if (bodyFirstNonEmpty.value === '}') {
    // noop
    _limit.after(node.body.startToken, 0);
  }

  _params.format(node);
};


exports.getIndentEdges = function(node, opts) {
  var params = _params.getIndentEdges(node, opts);
  // TODO make this a plugin
  if (!opts.TopLevelFunctionBlock && isTopLevelFunctionBlock(node)) {
    return params;
  }
  return [
    params,
    {
      startToken: node.body.startToken,
      endToken: _tk.findPrevNonEmpty(node.body.endToken).next
    }
  ];
};


function isTopLevelFunctionBlock(node) {
  // exception for UMD blocks
  return !(node.params.length === 1 && node.params[0].name === "factory") &&
    // regular IFEE
    (isOfType(node.parent, 'CallExpression') ||
    // module.exports assignment
    isOfType(node.parent, 'AssignmentExpression')) &&
    !isOfType(node.parent.callee, 'MemberExpression') &&
    isOfType(node.parent.parent, 'ExpressionStatement') &&
    isOfType(node.parent.parent.parent, 'Program');
}


// TODO: extract into rocambole-node
function isOfType(node, type) {
  return node && node.type === type;
}
