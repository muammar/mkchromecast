'use strict';

var tk = require('rocambole-token');
var limit = require('../limit');
var _params = require('./Params');

exports.format = function ArrowFunctionExpression(node) {
  var body = node.body;
  if (body.type === 'BlockStatement') {
    limit.around(body.startToken, 'ArrowFunctionExpressionOpeningBrace');
    limit.around(body.endToken, 'ArrowFunctionExpressionClosingBrace');
  }

  var arrow = tk.findPrev(body.startToken, '=>');
  limit.around(arrow, 'ArrowFunctionExpressionArrow');

  // make sure we handle `(x) => x` and `x => x`
  if (shouldHandleParams(node)) {
    _params.format(node);
  }
};

exports.getIndentEdges = function(node, opts) {
  var edges = [];
  if (shouldIndentBody(node, opts)) {
    edges.push(node.body);
  }
  if (shouldHandleParams(node)) {
    edges.push(_params.getIndentEdges(node, opts));
  }
  return edges;
};

function shouldHandleParams(node) {
  var arrow = tk.findPrev(node.body.startToken, '=>');
  // we don't check based on `node.params` because of `node.defaults`
  return tk.findPrevNonEmpty(arrow).value === ')';
}

function shouldIndentBody(node, opts) {
  // we don't want to indent the body twice if ObjectExpression or
  // ArrayExpression or CallExpression
  return node.body.type === 'BlockStatement' || !opts[node.body.type];
}
