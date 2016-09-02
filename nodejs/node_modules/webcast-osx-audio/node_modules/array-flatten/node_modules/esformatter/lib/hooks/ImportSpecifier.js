'use strict';

// this logic is shared with ExportSpecifier

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');

exports.format = function(node) {
  var braceStart = _tk.findPrev(node.startToken, _tk.isCode);
  var braceEnd = _tk.findNext(node.endToken, _tk.isCode);

  // handle `import foo, { lorem, ipsum } from 'lib';`
  if (braceStart.value === '{' || braceStart.value === ',') {
    _br.limit(braceStart, 0);
    _ws.limitBefore(braceStart, braceStart.value === '{' ? 1 : 0);
    _ws.limitAfter(braceStart, braceStart.value === '{' ? 'ModuleSpecifierOpeningBrace' : 1);
  }

  if (braceEnd.value === '}' || braceEnd.value === ',') {
    _br.limit(braceEnd, 0);
    var next = _tk.findNextNonEmpty(braceEnd);
    _ws.limitAfter(braceEnd, next.value === ';' ? 0 : 1);
    _ws.limitBefore(braceEnd, braceEnd.value === '}' ? 'ModuleSpecifierClosingBrace' : 0);
  }

  _br.limit(node.startToken, 0);
  _br.limit(node.endToken, 0);

  if (node.startToken !== node.endToken) {
    // handle spaces around "as"
    // eg: `import { named1 as myNamed1 } from 'lib'`
    // eg: `import * as myLib from 'lib'`
    _ws.limitAfter(node.startToken, 1);
    _ws.limitBefore(node.endToken, 1);
  }
};
