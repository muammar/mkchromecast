"use strict";

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');
var _limit = require('../limit');


exports.format = function ObjectExpression(node) {
  if (!node.properties.length) return;

  // TODO: improve this, there are probably more edge cases
  var shouldBeSingleLine = node.parent.type === 'ForInStatement' || node.parent.type === 'ForOfStatement';

  if (!shouldBeSingleLine) {
    _limit.around(node.startToken, 'ObjectExpressionOpeningBrace');
  } else {
    // XXX: we still have this rule that looks weird, maybe change it in the
    // future since it is not flexible (edge-case tho)
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  }

  node.properties.forEach(function(prop) {
    var valueStart = getValueStart(prop);
    var valueEnd = getValueEnd(prop);
    var keyStart = getKeyStart(prop);
    var keyEnd = getKeyEnd(prop);

    // convert comma-first to comma-last
    var comma = _tk.findNext(valueEnd, [',', '}']);
    if (_tk.isComma(comma)) {
      _tk.removeInBetween(valueEnd, comma, _tk.isBr);
      _tk.remove(comma);
      _tk.after(valueEnd, comma);
    }

    if (!shouldBeSingleLine) {
      _br.limitBefore(keyStart, 'PropertyName');
      _br.limitAfter(keyEnd, 'PropertyName');
      if (valueStart) {
        _br.limitBefore(valueStart, 'PropertyValue');
        _br.limitAfter(valueEnd, 'PropertyValue');
      }
    } else if (keyStart.prev.value !== '{') {
      _ws.limitBefore(keyStart, 'Property');
    }

    if (prop.kind === 'get' || prop.kind === 'set') {
      _ws.limitBefore(keyStart, 1);
      _ws.limitAfter(keyEnd, 0);
      return;
    }

    _ws.limitBefore(keyStart, 'PropertyName');
    _ws.limitAfter(keyEnd, 'PropertyName');
    if (valueStart) {
      _ws.limitBefore(valueStart, 'PropertyValue');
      _ws.limitAfter(valueEnd, 'PropertyValue');
    }
  });

  if (!shouldBeSingleLine) {
    _limit.around(node.endToken, 'ObjectExpressionClosingBrace');
  }
};


function getKeyStart(prop) {
  var start = prop.key.startToken;
  start = _tk.findPrev(start, ['{', ',']);
  return _tk.findNext(start, _tk.isCode);
}


function getKeyEnd(prop) {
  var end = prop.key.endToken;
  end = _tk.findNext(end, [':', '(', ',', '}']);
  return _tk.findPrev(end, _tk.isCode);
}


function getValueStart(prop) {
  if (prop.key.startToken === prop.value.startToken) {
    return null;
  }
  var start = prop.value.startToken;
  return (prop.kind === 'get' || prop.kind === 'set') ?
    start :
    // we need to grab first/last "executable" token to avoid issues (see #191)
    _tk.findNext(_tk.findPrev(start, ':'), _tk.isCode);
}


function getValueEnd(prop) {
  if (prop.key.startToken === prop.value.startToken) {
    return null;
  }
  // we need to grab next "," or "}" because value might be surrounded by
  // parenthesis which would break the regular logic
  var end = _tk.findNext(prop.value.endToken, [',', '}']);
  return _tk.findPrev(end, _tk.isCode);
}


exports.getIndentEdges = function(node, opts) {
  var edges = [{
    startToken: node.startToken,
    endToken: _tk.findInBetweenFromEnd(node.startToken, node.endToken, _tk.isBr)
  }];

  node.properties.forEach(function(property) {
    if (!opts['ObjectExpression.' + property.value.type]) return;
    edges.push({
      startToken: getValueStart(property),
      endToken: getValueEnd(property)
    });
  });

  return edges;
};
