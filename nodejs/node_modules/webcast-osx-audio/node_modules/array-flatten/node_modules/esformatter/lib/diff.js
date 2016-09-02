'use strict';

var format = require('./format');
var disparity = require('disparity');

var hr = '==================================================================' +
  '==============';

// these headers make more sense in this context
disparity.added = 'expected';
disparity.removed = 'actual';

exports.chars = chars;
function chars(str, opts, fileName) {
  var result = disparity.chars(str, format(str, opts));
  if (!result) {
    return '';
  }
  // we add a line break at the end because it looks better
  return getHeader(fileName) + result + '\n';
}

function getHeader(fileName) {
  return fileName ? cyan(fileName) + '\n' + cyan(hr) + '\n' : '';
}

function cyan(str) {
  return '\u001b[36m' + str + '\u001b[39m';
}

exports.unified = unified;
function unified(str, opts, fileName) {
  return disparity.unified(str, format(str, opts), {
    paths: [fileName]
  });
}

exports.unifiedNoColor = unifiedNoColor;
function unifiedNoColor(str, opts, fileName) {
  return disparity.unifiedNoColor(str, format(str, opts), {
    paths: [fileName]
  });
}
