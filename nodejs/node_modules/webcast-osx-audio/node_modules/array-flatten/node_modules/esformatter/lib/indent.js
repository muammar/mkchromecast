"use strict";

var rocambole = require('rocambole');
var indent = require('rocambole-indent');
var debug = require('debug')('esformatter:indent');
var hooks = require('./hooks');

// ---


var _opts;

// this hash table is used to map special node types (used only for
// indentation) into the real hooks
var _specialTypes = {
  'VariableDeclaration': [
    'SingleVariableDeclaration',
    'MultipleVariableDeclaration'
  ]
};


// ---


exports.setOptions = setOptions;
function setOptions(opts) {
  _opts = opts;
  indent.setOptions(opts);
}


// transform AST in place
exports.transform = transform;
function transform(ast) {
  rocambole.walk(ast, transformNode);
  indent.sanitize(ast);
  // on v0.6.0 we named the property starting with uppercase "A" by mistake, so
  // now we need to support both styles to keep consistency :(
  if (_opts.alignComments) {
    indent.alignComments(ast);
  }
  return ast;
}


function transformNode(node) {
  var indentLevel = getIndentLevel(node);
  if (indentLevel) {
    var type = node.type;
    var edges;

    if (type in hooks && hooks[type].getIndentEdges) {
      edges = hooks[type].getIndentEdges(node, _opts);
      // for some nodes we might decide that they should not be indented
      // (complex rules based on context)
      if (!edges) {
        debug('[transformNode]: hook returned no edges');
        return;
      }
    } else {
      edges = node;
    }

    debug(
      '[transformNode] type: %s, edges: "%s", "%s"',
      node.type,
      edges && edges.startToken && edges.startToken.value,
      edges && edges.endToken && edges.endToken.value
    );

    // some complex nodes like IfStatement contains multiple sub-parts that
    // should be indented, so we allow an Array of edges as well
    if (Array.isArray(edges)) {
      edges.forEach(function(edge) {
        if (!edge) {
          // to simplify the logic we allow empty/falsy values on the edges
          // array, that way we can use same logic for single/multiple edges
          return;
        }
        indentEdge(edge, indentLevel);
      });
    } else {
      indentEdge(edges, indentLevel);
    }
  }
}


function indentEdge(edge, level) {
  indent.inBetween(edge.startToken, edge.endToken, edge.level || level);
}


function getIndentLevel(node) {
  var value = _opts[node.type];
  debug('[getIndentLevel] type: %s, value: %s', node.type, value);
  if (value == null && node.type in _specialTypes) {
    var specials = _specialTypes[node.type];
    specials.some(function(type) {
      value = _opts[type];
      return value > 0;
    });
    debug('[specialNodeType] indent: %s', value);
  }
  return value;
}
