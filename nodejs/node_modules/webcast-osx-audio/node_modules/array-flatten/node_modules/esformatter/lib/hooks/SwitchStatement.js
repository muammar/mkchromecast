"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function SwitchStatement(node) {
  var opening = _tk.findPrev(node.discriminant.startToken, '(');
  var closing = _tk.findNext(node.discriminant.endToken, ')');
  var openingBrace = _tk.findNext(closing, '{');
  var closingBrace = node.endToken;

  _limit.around(openingBrace, 'SwitchOpeningBrace');
  _limit.around(closingBrace, 'SwitchClosingBrace');
  _limit.around(opening, 'SwitchDiscriminantOpening');
  _limit.around(closing, 'SwitchDiscriminantClosing');

  // cases are handled by SwitchCase hook!

};


exports.getIndentEdges = function(node) {
  return {
    startToken: _tk.findNext(node.discriminant.endToken, '{'),
    endToken: node.endToken
  };
};
