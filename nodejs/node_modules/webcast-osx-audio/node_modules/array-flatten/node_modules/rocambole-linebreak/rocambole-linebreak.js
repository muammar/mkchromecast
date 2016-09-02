'use strict';

// Line break helpers

var _tk = require('rocambole-token');
var debug = require('debug');
var debugBefore = debug('rocambole:br:before');
var debugAfter = debug('rocambole:br:after');
var debugBetween = debug('rocambole:br:between');

// yeah, we use semver to parse integers. it's lame but works and will give
// more flexibility while still keeping a format that is easy to read
var semver = require('semver');

// fallback in case plugin author forgets to call setOptions
var _curOpts = {
  value: '\n'
};


// ---


exports.setOptions = setOptions;
function setOptions(opts) {
  _curOpts = opts;
}


exports.limit = limit;
function limit(token, typeOrValue) {
  limitBefore(token, typeOrValue);
  limitAfter(token, typeOrValue);
}


exports.limitBefore = limitBefore;
function limitBefore(token, typeOrValue) {
  var expected = expectedBefore(typeOrValue);
  debugBefore(
    'typeOrValue: %s, expected: %s, value: %s',
    typeOrValue, expected, token && token.value
  );
  if (expected < 0) return; // noop
  var start = getStartToken(token);
  limitInBetween('before', start, token, expected);
}


exports.limitAfter = limitAfter;
function limitAfter(token, typeOrValue) {
  var expected = expectedAfter(typeOrValue);
  debugAfter(
    'typeOrValue: %s, expected: %s, value: %s',
    typeOrValue, expected, token && token.value
  );
  if (expected < 0) return; // noop
  var end = getEndToken(token);
  limitInBetween('after', token, end, expected);
}

exports.expectedBefore = expectedBefore;
function expectedBefore(typeOrValue) {
  return getExpect('before', typeOrValue);
}

exports.expectedAfter = expectedAfter;
function expectedAfter(typeOrValue) {
  return getExpect('after', typeOrValue);
}


function getExpect(location, typeOrValue) {
  var expected;

  // we allow expected value (number) as 2nd argument or the node type (string)
  if (typeof typeOrValue === 'string') {
    expected = _curOpts[location][typeOrValue];
  } else {
    expected = typeOrValue;
  }

  // default is noop, explicit is better than implicit
  expected = expected != null ? expected : -1;

  if (typeof expected === 'boolean') {
    // if user sets booleans by mistake we simply add one if missing (true)
    // or remove all if false
    expected = expected ? '>=1' : 0;
  }

  if (expected < 0) {
    // noop
    return expected;
  } else if (typeof expected === 'number') {
    return String(expected);
  } else {
    return expected;
  }
}


function limitInBetween(location, start, end, expected, isEof) {
  var n = getDiff(start, end, expected);
  debugBetween('diff: %d', n);
  if (n) {
    _tk.removeInBetween(start, end, 'WhiteSpace');
  }
  if (n < 0) {
    _tk.removeInBetween(start, end, function(token) {
      return token.type === 'LineBreak' && n++ < 0 &&
        (isEof || !siblingIsComment(token));
    });
  } else if (n > 0) {
    var target = location === 'after' ? start : end;
    var insertNextTo = _tk[location];
    while (n-- > 0) {
      insertNextTo(target, {
        type: 'LineBreak',
        value: _curOpts.value
      });
    }
  }
}


function siblingIsComment(token) {
  return _tk.isComment(_tk.findPrev(token, _tk.isNotEmpty)) ||
    _tk.isComment(_tk.findNext(token, _tk.isNotEmpty));
}


function getDiff(start, end, expected) {
  // start will only be equal to end if it's start or file
  if (start === end) return 0;
  var count = countBrInBetween(start, end);
  // yeah, it's ugly to strings to compare integers but was quickest solution
  var vCount = String(count) + '.0.0';
  if (semver.satisfies(vCount, expected)) {
    return 0;
  } else {
    return getSatisfyingMatch(count, vCount, expected) - count;
  }
}


function getSatisfyingMatch(count, vCount, expected) {
  var result;
  var diff = semver.gtr(vCount, expected) ? -1 : 1;
  count += diff;
  while (result == null && count >= 0 && count < 100) {
    if (semver.satisfies(String(count) + '.0.0', expected)) {
      result = count;
    }
    count += diff;
  }
  return parseInt(result, 10);
}


function countBrInBetween(start, end) {
  var count = 0;
  _tk.eachInBetween(start, end, function(token) {
    if (_tk.isBr(token)) count++;
  });
  return count;
}


function getEndToken(token) {
  var end = _tk.findNextNonEmpty(token);
  if (shouldSkipToken(end)) {
    end = _tk.findNextNonEmpty(end);
  }
  return end ? end : token.root.endToken;
}


function shouldSkipToken(token) {
  // if comment is at same line we skip it unless it has a specific rule that
  // would add line breaks
  var result = _tk.isComment(token) && !isOnSeparateLine(token);
  return result && getExpect('before', token.type) <= 0;
}


function isOnSeparateLine(token) {
  return _tk.isBr(token.prev) || (
    _tk.isEmpty(token.prev) && _tk.isBr(token.prev.prev)
    );
}


function getStartToken(token) {
  var end = _tk.findPrevNonEmpty(token);
  return end ? end : token.root.startToken;
}


exports.limitBeforeEndOfFile = function(ast, amount) {
  var typeOrValue = amount != null ? amount : 'EndOfFile';
  var expected = getExpect('before', typeOrValue);

  if (expected < 0) return; // noop

  var lastNonEmpty = _tk.isEmpty(ast.endToken) ?
    _tk.findPrevNonEmpty(ast.endToken) :
    ast.endToken;

  if (lastNonEmpty) {
    limitInBetween('after', lastNonEmpty, null, expected, true);
  } else {
    do {
      var br = {
        type: 'LineBreak',
        value: _curOpts.value
      };
      if (ast.startToken) {
        _tk.after(ast.startToken, br);
      } else {
        ast.startToken = ast.endToken = br;
      }
    } while (--expected);
  }
};
