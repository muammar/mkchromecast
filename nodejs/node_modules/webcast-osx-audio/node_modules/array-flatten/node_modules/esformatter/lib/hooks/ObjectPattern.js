'use strict';

var limit = require('../limit');
var tk = require('rocambole-token');

exports.format = function ObjectPattern(node) {
  limit.around(node.startToken, 'ObjectPatternOpeningBrace');
  limit.around(node.endToken, 'ObjectPatternClosingBrace');

  node.properties.forEach(function(prop) {
    var comma = tk.findNext(prop.endToken, [',', '}']);
    if (comma.value === ',') {
      limit.around(comma, 'ObjectPatternComma');
    }
  });
};
