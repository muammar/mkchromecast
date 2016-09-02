'use strict';

var ws = require('rocambole-whitespace');
var br = require('rocambole-linebreak');

exports.format = function MethodDefinition(node) {
  br.limitAfter(node.startToken, 0);
  // limit to one space after get/set/static
  if (node.startToken !== node.key) {
    ws.limitAfter(node.startToken, 1);
  }
  ws.limitAfter(node.key.endToken, 'MethodDefinitionName');
};
