'use strict';

var debug = require('debug')('rocambole:indent');
var tk = require('rocambole-token');
var escapeRegExp = require('mout/string/escapeRegExp');
var repeat = require('mout/string/repeat');


// ---

var _opts = {
  value: '  ',
  CommentInsideEmptyBlock: 1
};

// ---


exports.setOptions = function(opts) {
  _opts = opts;
};


exports.inBetween = indentInBetween;
function indentInBetween(startToken, endToken, level) {
  level = level != null ? level : 1;

  if (!level || (!startToken || !endToken) || startToken === endToken) {
    debug(
      '[inBetween] not going to indent. start: %s, end: %s, level: %s',
      startToken && startToken.value,
      endToken && endToken.value,
      level
    );
    return;
  }

  var token = startToken && startToken.next;
  var endsWithBraces = isClosingBrace(endToken);
  while (token && token !== endToken) {
    if (tk.isBr(token.prev)) {
      // we ignore the last indent (if first token on the line is a ws or
      // ident) just because in most cases we don't want to change the indent
      // just before "}", ")" and "]" - this allow us to pass
      // `node.body.startToken` and `node.body.endToken` as the range
      if (token.next !== endToken || !endsWithBraces || !tk.isEmpty(token)) {
        addLevel(token, level);
      }
    }
    token = token.next;
  }
}


function isClosingBrace(token) {
  var val = token.value;
  return val === ')' || val === '}' || val === ']';
}


exports.addLevel = addLevel;
function addLevel(token, level) {
  if (!level) {
    // zero is a noop
    return;
  }

  token = findStartOfLine(token);

  if (!token) {
    // we never indent empty lines!
    debug('[indent.addLevel] can\'t find start of line');
    return;
  }

  var value = repeat(_opts.value, Math.abs(level));

  if (tk.isIndent(token)) {
    if (level > 0) {
      // if it's already an Indent we just bump the value & level
      token.value += value;
      token.level += level;
    } else {
      if (token.level + level <= 0) {
        tk.remove(token);
      } else {
        token.value = token.value.replace(value, '');
        token.level += level;
      }
    }
    if (token.next && token.next.type === 'BlockComment') {
      updateBlockComment(token.next);
    }
    return;
  }

  if (level < 1) {
    // we can't remove indent if previous token isn't an indent
    debug(
      '[addLevel] we can\'t decrement if line doesn\'t start with Indent. token: %s, level: %s',
      token && token.value,
      level
    );
    return;
  }

  if (tk.isWs(token)) {
    // convert WhiteSpace token into Indent
    token.type = 'Indent';
    token.value = value;
    token.level = level;
    return;
  }

  // if regular token we add a new Indent before it
  tk.before(token, {
    type: 'Indent',
    value: value,
    level: level
  });

  if (token.type === 'BlockComment') {
    updateBlockComment(token);
  }
}

function findStartOfLine(token) {
  if (tk.isBr(token) && tk.isBr(token.prev)) {
    // empty lines are ignored
    return null;
  }
  var prev = token.prev;
  while (true) {
    if (!prev || tk.isBr(prev)) {
      return token;
    }
    token = prev;
    prev = token.prev;
  }
}


exports.sanitize = sanitize;
function sanitize(astOrNode) {
  var token = astOrNode.startToken;
  var end = astOrNode.endToken && astOrNode.endToken.next;
  while (token && token !== end) {
    var next = token.next;
    if (isOriginalIndent(token)) {
      tk.remove(token);
    }
    token = next;
  }
}


function isOriginalIndent(token) {
  // original indent don't have a "level" value
  // we also need to remove any indent that happens after a token that
  // isn't a line break (just in case these are added by mistake)
  return (token.type === 'WhiteSpace' && (!token.prev || tk.isBr(token.prev)) && !tk.isBr(token.next)) ||
    (token.type === 'Indent' && (token.level == null || !tk.isBr(token.prev)));
}


exports.updateBlockComment = updateBlockComment;
function updateBlockComment(comment) {
  var orig = new RegExp('([\\n\\r]+)' + escapeRegExp(comment.originalIndent || ''), 'gm');
  var update = comment.prev && comment.prev.type === 'Indent' ? comment.prev.value : '';
  comment.raw = comment.raw.replace(orig, '$1' + update);
  // override the originalIndent so multiple consecutive calls still work as
  // expected
  comment.originalIndent = update;
}


// comments are aligned based on the next line unless the line/block is
// followed by an empty line, in that case it will use the previous line as
// reference.
exports.alignComments = alignComments;
function alignComments(nodeOrAst) {
  var first = nodeOrAst.startToken && nodeOrAst.startToken.prev;
  var token = nodeOrAst.endToken;
  while (token && token !== first) {
    if (tk.isComment(token) && isFirstNonEmptyTokenOfLine(token)) {
      var base = findReferenceIndent(token);
      matchBaseIndent(token, base);

      // if inside an empty block we add indent otherwise it looks weird
      var change = _opts.CommentInsideEmptyBlock != null ?
        _opts.CommentInsideEmptyBlock : 1;
      if (change && isInsideEmptyBlock(token)) {
        addLevel(token, change);
      }

      if (token.type === 'BlockComment') {
        updateBlockComment(token);
      }
    }

    token = token.prev;
  }
}

function matchBaseIndent(token, base) {
  if (!base) {
    if (isIndentOrWs(token.prev)) {
      tk.remove(token.prev);
    }
    return;
  }

  if (isIndentOrWs(token.prev)) {
    // we reuse whitespace just because user might not have converted all
    // the whitespaces into Indent tokens
    token.prev.type = 'Indent';
    token.prev.value = base.value;
    token.prev.level = inferLevel(base, _opts.value);
    return;
  }

  tk.before(token, {
    type: 'Indent',
    value: base.value,
    level: inferLevel(base, _opts.value)
  });
}

function isFirstNonEmptyTokenOfLine(token) {
  if (!token.prev || tk.isBr(token.prev)) return true;
  var prev = tk.findPrevNonEmpty(token);
  return !prev ? true : tk.findInBetween(prev, token, tk.isBr);
}

function findReferenceIndent(start) {
  var prevLine = findPrevReference(start);
  var nextLine = findNextReference(start);
  if (isAtBeginingOfBlock(start) || isDetached(start, nextLine)) {
    // this handles an edge case of comment just after "{" followed by an empty
    // line (would use the previous line as reference by mistake)
    // and also an edge case where comment is surrounded by empty lines but
    // should still use the next non-empty line as a reference
    while (nextLine && tk.isBr(nextLine)) {
      nextLine = findNextReference(nextLine.prev);
    }
  }
  // we favor nextLine unless it's empty
  if (tk.isBr(nextLine) || !nextLine) {
    return isIndentOrWs(prevLine) ? prevLine : null;
  }
  return isIndentOrWs(nextLine) ? nextLine : null;
}

function findPrevReference(start) {
  var token = start.prev;
  while (token) {
    // multiple consecutive comments should use the same reference (consider as
    // a single block)
    if (tk.isBr(token) && !tk.isBr(token.next) && nextInLineNotComment(token)) {
      return token.next;
    }
    token = token.prev;
  }
}

function findNextReference(start) {
  var token = start.next;
  while (token) {
    // multiple consecutive comments should use the same reference (consider as
    // a single block)
    if (tk.isBr(token) && nextInLineNotComment(token)) {
      return token.next;
    }
    token = token.next;
  }
}

function isDetached(start, nextLine) {
  return hasEmptyLineBefore(start) && tk.isBr(nextLine) &&
    !isAtEndOfBlock(nextLine);
}

function hasEmptyLineBefore(token) {
  token = token.prev;
  var count = 0;
  while (token && tk.isEmpty(token)) {
    if (tk.isBr(token)) {
      count += 1;
    }
    if (count > 1) {
      return true;
    }
    token = token.prev;
  }
  return false;
}

function isIndentOrWs(token) {
  return tk.isIndent(token) || tk.isWs(token);
}

function nextInLineNotComment(token) {
  token = token.next;
  while (token) {
    if (tk.isBr(token)) {
      return true;
    }
    if (!tk.isEmpty(token)) {
      return !tk.isComment(token);
    }
    token = token.next;
  }
  return true;
}

function isAtBeginingOfBlock(token) {
  var open = tk.findPrev(token, tk.isCode);
  if (!open) return false;
  var a = open.value;
  return a === '(' || a === '[' || a === '{';
}

function isAtEndOfBlock(token) {
  var close = tk.findNext(token, tk.isCode);
  if (!close) return false;
  var z = close.value;
  return (z === ')' || z === ']' || z === '}');
}

function isInsideEmptyBlock(token) {
  return isAtEndOfBlock(token) && isAtBeginingOfBlock(token);
}

exports.whiteSpaceToIndent = whiteSpaceToIndent;
function whiteSpaceToIndent(token, indentValue) {
  if (tk.isWs(token) && (tk.isBr(token.prev) || !token.prev)) {
    token.type = 'Indent';
    // we can't add level if we don't know original indentValue
    indentValue = indentValue || _opts.value;
    if (indentValue) {
      token.level = inferLevel(token, indentValue);
    }
  }
}

function inferLevel(token, indentValue) {
  return Math.max(token.value.split(indentValue).length - 1, 0);
}
