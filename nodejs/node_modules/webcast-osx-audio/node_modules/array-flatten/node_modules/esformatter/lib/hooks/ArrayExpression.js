"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function ArrayExpression(node) {
  if (node.elements.length) {
    _limit.around(node.startToken, 'ArrayExpressionOpening');
    _limit.around(node.endToken, 'ArrayExpressionClosing');

    node.elements.forEach(function(el) {
      // sparse arrays have `null` elements
      if (!el) return;

      var prev = _tk.findPrevNonEmpty(el.startToken);
      if (prev.value === ',') {
        _limit.around(prev, 'ArrayExpressionComma');
      }
    });
  } else {
    // empty array should be single line
    _limit.after(node.startToken, 0);
  }
};


exports.getIndentEdges = function(node) {
  var start;
  var prev = node.startToken;

  // this will grab the start of first element that is on a new line
  node.elements.some(function(el, i, els) {
    // sparse arrays have `null` elements! which is very weird
    if (i) {
      var prevEl = els[i - 1];
      prev = prevEl ? prevEl.endToken : _tk.findNextNonEmpty(prev);
    }
    var next = el ? el.startToken : _tk.findNextNonEmpty(prev);

    if (_tk.findInBetween(prev, next, _tk.isBr)) {
      start = prev;
      return true;
    }
  });

  var end = node.endToken.prev;

  // if it ends on same line as previous non-empty we need to change the indent
  // rule to make sure {}, [] and () are aligned
  var sibling = _tk.findPrevNonEmpty(node.endToken);
  if (!_tk.findInBetween(sibling, node.endToken, _tk.isBr)) {
    end = node.endToken;
  }

  return start ? {
    startToken: start,
    endToken: end
  } : false;
};

