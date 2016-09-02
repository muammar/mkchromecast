"use strict";

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');
var _limit = require('../limit');


exports.format = function IfStatement(node) {

  var startBody = node.consequent.startToken;
  var endBody = node.consequent.endToken;

  var conditionalStart = _tk.findPrev(node.test.startToken, '(');
  var conditionalEnd = _tk.findNext(node.test.endToken, ')');

  _ws.limit(conditionalStart, 'IfStatementConditionalOpening');
  _ws.limit(conditionalEnd, 'IfStatementConditionalClosing');

  var alt = node.alternate;
  if (alt) {
    var elseKeyword = _tk.findPrev(alt.startToken, 'else');

    if (alt.type === 'IfStatement') {
      // ElseIfStatement
      _br.limitBefore(alt.startToken, 0);
      _ws.limitBefore(alt.startToken, 1);

      if (alt.consequent.type === 'BlockStatement') {
        _br.limitBefore(alt.consequent.startToken, 'ElseIfStatementOpeningBrace');
        _br.limitBefore(alt.consequent.endToken, 'ElseIfStatementClosingBrace');
      }

      _br.limitBefore(elseKeyword, 'ElseIfStatement');
      if (!alt.alternate) {
        // we only limit the line breaks after the ElseIfStatement if it is not
        // followed by an ElseStatement, otherwise it would add line breaks
        // that it shouldn't
        _br.limitAfter(alt.consequent.endToken, 'ElseIfStatement');
      }

    } else if (alt.type === 'BlockStatement') {
      // ElseStatement

      _limit.around(alt.startToken, 'ElseStatementOpeningBrace');

      _br.limitBefore(elseKeyword, 'ElseStatement');
      _br.limitAfter(alt.endToken, 'ElseStatement');

      _ws.limitBefore(elseKeyword, 1);

      _limit.around(alt.endToken, 'ElseStatementClosingBrace');
    } else {
      // ElseStatement without curly braces
      _ws.limitAfter(elseKeyword, 1);
    }
  }

  // only handle braces if block statement
  if (node.consequent.type === 'BlockStatement') {
    _limit.around(startBody, 'IfStatementOpeningBrace');
    if (!alt) {
      _br.limit(endBody, 'IfStatementClosingBrace');
    } else {
      _br.limitBefore(endBody, 'IfStatementClosingBrace');
    }
    _ws.limit(endBody, 'IfStatementClosingBrace');
  }

};


exports.getIndentEdges = function(node, opts) {
  var edges = [];

  var test = node.test;
  var consequent = node.consequent;
  var alt = node.alternate;

  // test (IfStatementConditional)
  edges.push({
    level: opts.IfStatementConditional,
    startToken: _tk.findNext(node.startToken, '('),
    endToken: _tk.findPrev(consequent.startToken, ')'),
  });

  function isExecutable(token) {
    return _tk.isNotEmpty(token) && !_tk.isComment(token);
  }

  // consequent (body)
  edges.push({
    startToken: (consequent.type === 'BlockStatement' ?
      consequent.startToken :
      test.endToken.next
    ),
    // we have some special rules for comments just before the `else` statement
    // because of jQuery style guide. maybe in the future we will add
    // a setting to toggle this behavior (if someone asks for it)
    endToken: (alt && _tk.isComment(_tk.findPrevNonEmpty(consequent.endToken)) ?
      _tk.findPrev(consequent.endToken, isExecutable).next :
      consequent.endToken
    )
  });

  // alt (else)
  if (alt && alt.type !== 'IfStatement') {
    // it the alternate is IfStatement it will already take care of indentation
    edges.push({
      startToken: (alt.type === 'BlockStatement' ?
        alt.startToken :
        _tk.findPrevNonEmpty(alt.startToken).next
      ),
      endToken: alt.endToken
    });
  }

  return edges;
};
