'use strict';

var limit = require('../limit');
var tk = require('rocambole-token');

exports.format = function ArrayPattern(node) {
  limit.around(node.startToken, 'ArrayPatternOpening');
  limit.around(node.endToken, 'ArrayPatternClosing');

  node.elements.forEach(function(el) {
    var comma = tk.findNext(el.endToken, [',', ']']);
    if (comma.value === ',') {
      limit.around(comma, 'ArrayPatternComma');
    }
  });
};
