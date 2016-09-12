//jshint node:true, eqnull:true
'use strict';

var br = require('rocambole-linebreak');
var parser = require('esformatter-parser');
var rocambole = require('rocambole');
var tk = require('rocambole-token');

exports.setOptions = function(options) {
  if (!('esformatter-semicolon-first' in options.lineBreak.before)) {
    options.lineBreak.before['esformatter-semicolon-first'] = '>0';
  }
  if (!('esformatter-semicolon-first' in options.lineBreak.after)) {
    options.lineBreak.after['esformatter-semicolon-first'] = 0;
  }
  br.setOptions(options.lineBreak);
};

// need to use `stringBefore` since we are actually changing the
// behavior/structure of the program by introducing the semi-colons
exports.stringBefore = function(str) {
  var ast = parser.parse(str);
  tk.eachInBetween(ast.startToken, ast.endToken, processToken);
  return ast.toString();
};

// we use token after to remove line breaks and whitespaces in between the `;`
// and `[` and `(`
exports.tokenAfter = function(token) {
  if (token.value !== '[' && token.value !== '(') return;

  var prev = tk.findPrevNonEmpty(token);
  if (prev && prev.value === ';') {
    br.limit(prev, 'esformatter-semicolon-first');
  }
};

function processToken(token) {
  // first token might be `(` or `[`
  if (!tk.isBr(token) && token.prev) {
    return;
  }

  if (token.prev) {
    token = token.next;
  }

  var opening = findOpening(token);

  // only insert semicolon if missing
  if (shouldInsert(opening)) {
    tk.before(opening, {
      type: 'Punctuator',
      value: ';'
    });
  }
}

function findOpening(token) {
  while (token) {
    // only search on current line
    if (tk.isBr(token)) return;

    var value = token.value;
    if (value === '[' || value === '(') {
      return token;
    }

    // if first non empty token in the line is not `[` or `(` we ignore it
    if (tk.isNotEmpty(token)) return;

    token = token.next;
  }
}

function shouldInsert(opening) {
  if (!opening) return;

  var prev = tk.findPrev(opening, tk.isCode);
  return !prev || prev.type !== 'Punctuator' || prev.value === ')';
}

