"use strict";

var _ws = require('rocambole-whitespace');


exports.format = function ThrowStatement(node) {
  _ws.limit(node.startToken, 'ThrowKeyword');
};
