"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function TryStatement(node) {
  var finalizer = node.finalizer;
  if (finalizer) {
    var finallyKeyword = _tk.findPrev(finalizer.startToken, 'finally');
    _limit.around(finallyKeyword, 'FinallyKeyword');
    _limit.around(finalizer.startToken, 'FinallyOpeningBrace');
    _limit.around(finalizer.endToken, 'FinallyClosingBrace');

    if (!finalizer.body.length && !containsCommentsInside(finalizer)) {
      // XXX: empty body, so we should remove all white spaces
      _tk.removeEmptyInBetween(finalizer.startToken, finalizer.endToken);
    }
  }

  // CatchClause is handled by its own hook

  _limit.around(node.startToken, 'TryKeyword');
  _limit.around(node.block.startToken, 'TryOpeningBrace');
  _limit.around(node.block.endToken, 'TryClosingBrace');
};


function containsCommentsInside(node) {
  return !!_tk.findInBetween(node.startToken, node.endToken, _tk.isComment);
}


exports.getIndentEdges = function(node) {
  var edges = [node.block];

  if (node.finalizer) {
    edges.push(node.finalizer);
  }

  // CatchClause is handled by it's own node (automatically)

  return edges;
};
