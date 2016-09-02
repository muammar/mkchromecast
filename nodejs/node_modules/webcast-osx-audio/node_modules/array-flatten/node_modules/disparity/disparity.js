'use strict';

var stringDiff = require('diff');
var ansi = require('ansi-styles');

// ---

exports.unified = unified;
exports.unifiedNoColor = unifiedNoColor;
exports.chars = chars;
exports.removed = 'removed';
exports.added = 'added';
exports.colors = {
  charsRemoved: ansi.bgRed,
  charsAdded: ansi.bgGreen,
  removed: ansi.red,
  added: ansi.green,
  header: ansi.yellow,
  section: ansi.magenta,
};

// ---

function chars(str1, str2, opts) {
  if (str1 === str2) {
    return '';
  }

  opts = opts || {};

  // how many lines to add before/after the chars diff
  var context = opts.context != null ? opts.context : 3;

  var path1 = opts.paths && opts.paths[0] || exports.removed;
  var path2 = opts.paths && opts.paths[1] || exports.added;

  // text displayed before diff
  var header = colorize(path1, 'charsRemoved') + ' ' +
    colorize(path2, 'charsAdded') + '\n\n';

  var changes = stringDiff.diffChars(str1, str2);
  var diff = changes.map(function(c) {
    var val = replaceInvisibleChars(c.value);
    if (c.removed) return colorize(val, 'charsRemoved');
    if (c.added) return colorize(val, 'charsAdded');
    return val;
  }).join('');

  // this RegExp will include the '\n' char into the lines, easier to join()
  var lines = diff.split(/^/m);

  lines = addLineNumbers(lines);
  lines = removeLinesOutOfContext(lines, context);

  return header + lines.join('');
}

function addLineNumbers(lines) {
  var nChars = lines.length.toString().length;
  return lines.map(function(line, i) {
    return alignRight(i + 1, nChars) + ' | ' + line;
  });
}

function colorize(str, colorId) {
  var color = exports.colors[colorId];
  // avoid highlighting the "\n" (would highlight till the end of the line)
  return str.replace(/[^\n\r]+/g, color.open + '$&' + color.close);
}

function replaceInvisibleChars(str) {
  return str
    .replace(/\t/g, '<tab>')
    .replace(/\r/g, '<CR>')
    .replace(/\n/g, '<LF>\n');
}

function alignRight(val, nChars) {
  val = val.toString();
  var diff = nChars - val.length;
  return diff ? (new Array(diff + 1)).join(' ') + val : val;
}

function removeLinesOutOfContext(lines, context) {
  // we cache the results since same line ends up being checked multiple times
  var diffMap = {};
  var lastDiff = -Infinity;
  function hasDiff(line, i) {
    if (!(i in diffMap)) {
      diffMap[i] = hasCharDiff(line);
    }
    return diffMap[i];
  }

  function hasDiffBefore(i) {
    return lastDiff + context >= i;
  }

  function hasDiffAfter(i) {
    var max = Math.min(i + context, lines.length - 1);
    var n = i;
    while (++n <= max) {
      if (hasDiff(lines[n], n)) return true;
    }
    return false;
  }

  return lines.filter(function(line, i, arr) {
    var has = hasDiff(line, i);
    if (has) {
      lastDiff = i;
    }
    return has || hasDiffBefore(i) || hasDiffAfter(i);
  });
}

function hasCharDiff(line) {
  return line.indexOf(exports.colors.charsAdded.open) !== -1 ||
    line.indexOf(exports.colors.charsRemoved.open) !== -1;
}

function unified(str1, str2, opts) {
  if (str2 === str1) {
    return '';
  }

  var changes = unifiedNoColor(str1, str2, opts);
  // this RegExp will include all the `\n` chars into the lines, easier to join
  var lines = changes.split(/^/m);

  var start = colorize(lines.slice(0, 2).join(''), 'header');
  var end = lines.slice(2).join('')
    .replace(/^\-.*/gm, colorize('$&', 'removed'))
    .replace(/^\+.*/gm, colorize('$&', 'added'))
    .replace(/^@@.+@@/gm, colorize('$&', 'section'));

  return start + end;
}

function unifiedNoColor(str1, str2, opts) {
  if (str2 === str1) {
    return '';
  }

  opts = opts || {};
  var path1 = opts.paths && opts.paths[0] || '';
  var path2 = opts.paths && opts.paths[1] || path1;

  var changes = stringDiff.createPatch('', str1, str2, '', '');

  // remove first 2 lines (header)
  changes = changes.replace(/^([^\n]+)\n([^\n]+)\n/m, '');

  function appendPath(str, filePath, state) {
    var result = str;
    if (filePath) {
      result += ' ' + filePath;
    }
    if (state) {
      result += filePath ? '\t' : ' ';
      result += state;
    }
    return result;
  }

  changes = changes
    .replace(/^---.*/gm, appendPath('---', path1, exports.removed))
    .replace(/^\+\+\+.*/gm, appendPath('+++', path2, exports.added));

  return changes;
}
