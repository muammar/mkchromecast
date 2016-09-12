/*!
 * Electron - process.argv parsing
 * Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module export
 */

module.exports = Args;

/**
 * ## Argument Parsing Utility
 *
 * The electron argument parser takes the node.js standard
 * `process.argv` array and constructs an object with helpers
 * that can easily be queried. This helper is publicly exposed
 * so it can be used independant of the cli framework.
 *
 *     var electron = require('electron')
 *       , argv = electron.argv(process.argv);
 *
 * When constructed, the electron argv parser recognizes three
 * types command line arguments: _commands_, _modes_, and _parameters_.
 *
 * Each of these types also has a helper that will provide quick access
 * to whether a _command_ or _mode_ is present, or the value of a _parameter_.
 *
 * ##### Commands
 *
 * Commands are the simplest of arguments. They are any arguments
 * that are listed to that do not start with the `-` or `--` prefix.
 * Essentially, they are a list of keys.
 *
 *     // $ node cli.js hello universe
 *     argv.commands === [ 'hello', 'universe' ];
 *
 * ##### Modes
 *
 * Modes are also a non-value list of keys, but they can be expressed
 * differently by using the `-` or `--` prefix. When using modes, if
 * it begins with a single `-`, each letter will be parsed as its own mode.
 *
 *     // $ node cli.js --universe -abc
 *     argv.modes === [ 'universe', 'a', 'b', 'c' ];
 *
 * ##### Parameters
 *
 * Paremeters are key:value pairs that are declared in a similiar manner
 * as modes. They can be declared in any of the following ways.
 *
 *     // $ node cli.js --noun unverse -v say --topic=hello -w=now
 *     argv.params === {
 *         noun: 'universe'
 *       , v: 'say'
 *       , topic: 'hello'
 *       , w: 'now'
 *     };
 *
 * You can also specify paramters with multiple words by surrounding the
 * phrase with double-quotes.
 *
 *     // $ node cli.js --say "hello universe"
 *     argv.params === {
 *       say: 'hello universe'
 *     };
 *
 * @header Argument Parsing Utility
 */

function Args (args) {
  /*!
   * @param {Array} node.js compatible process.argv
   */

  this._raw = args;
  this.commands = [];
  this.modes = [];
  this.params = {};
  processArgs.call(this, args);
}

/**
 * ### .command (cmd, [cmd], [...])
 *
 * The `command` helper takes a list of commands and will
 * return `true` if any of them exist in the _commands_ list.
 *
 *     // node cli.js hello universe
 *     var greeting = argv.command('hi', 'hello') // true
 *       , world = argv.command('world', 'earth'); // false
 *
 * @param {String} command(s) to check
 * @returns {Boolean} exists
 * @name command
 * @api public
 */

Args.prototype.command = filter('commands');

/**
 * ### .mode (mode, [mode], [...])
 *
 * The `mode` helper takes a list of modes and will
 * return `true` if any of them exist in the _modes_ list.
 *
 *     // node cli.js --hello -abc
 *     var greeting = argv.mode('h', 'hello') // true
 *       , world = argv.mode('w', 'world'); // false
 *
 * @param {String} mode(s) to check
 * @returns {Boolean} exists
 * @name mode
 * @api public
 */

Args.prototype.mode = filter('modes');

/**
 * ### .param (param, [param], [...])
 *
 * The `param` helper takes a list of parameters and will
 * return the value of the first parameter that matches, or
 * `null` if none of the parameters exist in the _params_ list.
 *
 *     // node cli.js --hello universe
 *     var greeting = argv.param('h', 'hello') // 'universe'
 *       , world = argv.param('w', 'world'); // null
 *
 * @param {String} mode(s) to check
 * @returns {String|null} value of first matching parameter
 * @name param
 * @api public
 */

Args.prototype.param = filter('params');

/*!
 * ### processArgs (args)
 *
 * Take the raw node.js args array and parse out
 * commands, modes, and parameters. Per node standard,
 * the first two elements are considered to be the executor
 * and file and irrelevant.
 *
 * @param {Array} process.argv
 * @ctx Args
 * @api private
 */

function processArgs (args) {
  var param_key = null
    , parts = args.slice(2)
    , input = this
    , isStr = false;

  function checkParamKey () {
    if (param_key !== null) {
      input.modes.push(param_key);
      param_key = null;
    }
  }

  function appendStr (key, str) {
    input.params[key] += ' ' + str;
  }

  parts.forEach(function (part) {
    if (part.substr(0, 2) === '--') {
      checkParamKey();
      if (part.indexOf('=') !== -1) {
        part = part.substr(2).split('=', 2);
        return input.params[part[0]] = part[1]
      }

      return param_key = part.substr(2);
    }

    if (part[0] === '-') {
      checkParamKey();
      var sstr = part.substr(1);
      if (sstr.length > 1) {
        if (part.indexOf('=') !== -1) {
          part = part.substr(1).split('=', 2);
          return input.params[part[0]] = part[1]
        }
        for (var i = 0; i < sstr.length; i++)
          input.modes.push(sstr[i]);
        return;
      } else {
        return param_key = part.substr(1);
      }
    }

    part = Number(part) || part

    if (param_key !== null) {
      if (part[0] === '"') {
        isStr = true;
        input.params[param_key] = part.substr(1);
      } else if (isStr && part[part.length - 1] === '"') {
        isStr = false;
        appendStr(param_key, part.substr(0, part.length - 1));
        param_key = null;
      } else if (isStr) {
        appendStr(param_key, part);
      } else {
        input.params[param_key] = part;
        param_key = null;
      }
    } else {
      input.commands.push(part);
    }
  });

  checkParamKey();
}

/*!
 * ### filter (which)
 *
 * Constructs a helper function for each of the
 * three types of process.argv types. Returns function
 * to be mounted on to the Arg.prototype.
 *
 * @param {String} which argument type
 * @returns {Function}
 * @api private
 */

function filter (which) {
  return function () {
    var self = this
      , modes = Array.prototype.slice.call(arguments)
      , res = Array.isArray(this[which])
        ? false
        : null;

    function check (el) {
      if (Array.isArray(self[which])) {
        return self[which].indexOf(el) > -1
          ? true
          : null;
      } else {
        return 'undefined' !== typeof self[which][el]
          ? self[which][el]
          : null;
      }
    }

    for (var i = 0; i < modes.length; i++) {
      var val = check(modes[i]);
      if (val && !res) res = val;
    }

    return res;
  };
}
