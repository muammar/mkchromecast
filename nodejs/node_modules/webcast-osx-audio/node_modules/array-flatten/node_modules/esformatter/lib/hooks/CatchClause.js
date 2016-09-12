"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function CatchClause(node) {
  _limit.around(node.startToken, 'CatchKeyword');

  _limit.before(node.param.startToken, 'CatchParameterList');
  _limit.after(node.param.endToken, 'CatchParameterList');

  _limit.around(node.body.startToken, 'CatchOpeningBrace');
  _limit.around(node.body.endToken, 'CatchClosingBrace');

  // only remove line breaks if there are no comments inside. Ref #169
  if (!node.body.body.length && !containsCommentsInside(node.body)) {
    _tk.removeEmptyInBetween(node.body.startToken, node.body.endToken);
  }
};


function containsCommentsInside(node) {
  return !!_tk.findInBetween(node.startToken, node.endToken, _tk.isComment);
}

exports.getIndentEdges = function(node) {
  return node.body;
};
