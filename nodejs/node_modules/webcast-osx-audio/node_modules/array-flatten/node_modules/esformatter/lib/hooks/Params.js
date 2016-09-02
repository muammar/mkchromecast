"use strict";

// Important: Params is a "virtual" node type, not part of the AST spec.
// this hook is actually called by FunctionDeclaration and FunctionExpression
// hooks. It's mainly a way to share the common logic between both hooks.

var _ws = require('rocambole-whitespace');
var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function Params(node) {
  var params = node.params;
  var opening = node.startToken.value === '(' ?
    node.startToken :
    _tk.findNext(node.startToken, '(');
  var closing = _tk.findPrev(node.body.startToken, ')');

  if (params.length) {
    _ws.limitBefore(_tk.findNextNonEmpty(opening), 'ParameterList');
    params.forEach(function(param, i) {
      // if only one param or last one there are no commas to look for
      if (i < params.length - 1) {
        _limit.around(_tk.findNext(param.startToken, ','), 'ParameterComma');
      }

      // Default parameters are AssignmentExpressions as params
      if (param.type === 'AssignmentPattern' && param.right) {
        _limit.around(_tk.findPrev(param.right.startToken, '='), 'AssignmentPattern');
      }
    });
    _ws.limitAfter(_tk.findPrevNonEmpty(closing), 'ParameterList');
  } else {
    _limit.after(opening, 0);
  }
};

exports.getIndentEdges = function(node, opts) {
  var params = node.params;
  if (params.length && opts.ParameterList) {
    // get/set on ObjectEpression affect drastically the FunctionExpression
    // structure so we need to handle it differently
    var start = node.parent.type === 'Property' ?
      node.parent.startToken :
      node.startToken;
    return {
      // we check if start is equal to "(" because of arrow functions
      startToken: start.value === '(' ? start : _tk.findNext(start, '('),
      endToken: _tk.findPrev(node.body.startToken, ')'),
      level: opts.ParameterList
    };
  }
  return null;
};
