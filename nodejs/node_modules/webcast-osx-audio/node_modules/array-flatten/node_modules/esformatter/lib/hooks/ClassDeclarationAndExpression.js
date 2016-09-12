'use strict';

// this file handles both ClassDeclaration and ClassExpression

var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');
var limit = require('../limit');

exports.format = function ClassDeclarationAndExpression(node) {
  var classKeyword = node.startToken;
  var opening = tk.findNext(node.startToken, '{');
  var closing = node.endToken;
  // yes, we remove all the line breaks and limit to a single whitespace in
  // between the words since line breaks here would increase complexity
  tk.removeInBetween(classKeyword, opening, tk.isBr);
  ws.limitAfter(classKeyword, 1);
  var extendsKeyword = tk.findInBetween(classKeyword, opening, 'extends');
  if (extendsKeyword) {
    ws.limit(extendsKeyword, 1);
  }

  limit.around(opening, 'ClassOpeningBrace');
  limit.around(closing, 'ClassClosingBrace');
};

exports.getIndentEdges = function(node) {
  return node;
};
