
/**
 * .series (arr[, delay], iterator[, done])
 *
 * Invoke an iterator for each emit in an array.
 * An optional delay can be placed in-between the
 * each item's invokation.
 *
 * @param {Array} items
 * @param {Number} delay in ms (optional)
 * @param {Function} iterator [item, next]
 * @param {Function} callback on completion (optional)
 * @api private
 */

exports.series = function (arr, delay, iterator, done) {
  if ('function' == typeof delay) {
    done = iterator;
    iterator = delay;
    delay = 0;
  }

  done = done || function () {};

  function iterate (i) {
    var fn = arr[i];
    if (!fn) return done();
    iterator(fn, function cb() {
      if (!delay) return iterate(++i);
      setTimeout(function () {
        iterate(++i);
      }, delay);
    });
  };

  iterate(0);
};


exports.color = function (str, color) {
  var options = {
      red:      '\u001b[31m'
    , green:    '\u001b[32m'
    , yellow:   '\u001b[33m'
    , blue:     '\u001b[34m'
    , magenta:  '\u001b[35m'
    , cyan:     '\u001b[36m'
    , gray:     '\u001b[90m'
    , reset:    '\u001b[0m'
  };
  return options[color] + str + options.reset;
};

exports.highlight = function (str, color) {
  var options = {
      red:      '\u001b[41m'
    , green:    '\u001b[42m'
    , yellow:   '\u001b[43m'
    , blue:     '\u001b[44m'
    , magenta:  '\u001b[45m'
    , cyan:     '\u001b[46m'
    , gray:     '\u001b[100m'
    , reset:    '\u001b[0m'
  };
  return options[color] + str + options.reset;
};

exports.padAfter = function (str, width) {
  return str + Array(width - str.length).join(' ');
};

exports.padBefore = function (str, width) {
  return Array(width - str.length).join(' ') + str;
};

exports.humanize = function (n) {
  var n = String(n).split('.')
  n[0] = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  return n.join('.')
};

// from mocha
exports.cursor = {
    hide: function () {
      process.stdout.write('\033[?25l');
    }

  , show: function () {
      process.stdout.write('\033[?25h');
    }

  , deleteLine: function () {
      process.stdout.write('\033[2K');
    }

  , beginningOfLine: function () {
      process.stdout.write('\033[0G');
    }

  , CR: function () {
      exports.cursor.deleteLine();
      exports.cursor.beginningOfLine();
    }
};