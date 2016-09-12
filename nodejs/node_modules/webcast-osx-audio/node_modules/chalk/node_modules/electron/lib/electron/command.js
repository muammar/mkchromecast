/*!
 * Electron - command constructor
 * Copyright (c) 2012 Jake Luer <jake@alogicalpardox.com>
 * MIT Licensed
 */

/*!
 * Main export
 */

module.exports = Command;

/**
 * ## Constructing Commands
 *
 * Once you have decided to construct a command through `program.command`
 * you will be returned a command object that you can manipulate through
 * chainable methods.
 *
 * @header Constructing Commands
 */

function Command (cmd) {
  this.opts = {
      cmd: cmd
    , desc: ''
    , options: []
    , action: function () {}
  }
}

/**
 * ### .desc (description)
 *
 * Provide a description for this command to be used when
 * being display in help.
 *
 *     program
 *       .command('hello universe')
 *       .desc('Say "Hello" to the Universe.');
 *
 * @param {String} description
 * @returns `command` for chaining
 * @name desc
 * @api public
 */

Command.prototype.desc = function (desc) {
  this.opts.desc = desc;
  return this;
};

/*!
 * legacy support
 */

Command.prototype.description = Command.prototype.desc;

/**
 * ### .option (opts, description, required)
 *
 * You may define any number of options for
 * each command. The `opts` string expects a comma delimited
 * list of commands with an optional default value or
 * indicator surrounded by brackets. You may
 * also provide a description of the option and whether
 * it is required.
 *
 * This command may be called multiple times to define multiple
 * options.
 *
 *     program
 *       .command('build')
 *       .option('-m, --minify', 'Flag to build minify version')
 *       .option('-f, --file [build.js]', 'Save filename', true);
 *
 * @param {String} options to parse
 * @param {String} description
 * @param {Boolean} required. defaults to false
 * @returns `command` for chaining
 * @name option
 * @api public
 */

Command.prototype.option = function (opt, desc, required) {
  var opts = prepareOptions(opt);

  this.opts.options.push({
      opts: opts
    , desc: desc
    , required: ('boolean' === typeof required)
      ? required
      : false
  });

  return this;
};

/**
 * ### .action (function)
 *
 * Provide the action to be used should this command be
 * called. The function will receive one parameter of the
 * parsed process.argv object. Multiple calls to `action` will
 * replace the previous defined action.
 *
 *     program
 *       .command('build')
 *       .action(function (argv) {
 *         var minify = argv.mode('m', 'minify')
 *           , file = argv.param('f', 'file');
 *         // go!
 *       });
 *
 * @param {Function} action to perform
 * @returns `command` for chaining
 * @name action
 * @api public
 */

Command.prototype.action = function (fn) {
  if ('function' === typeof fn)
    this.opts.action = fn;
  return this;
};

/*!
 * prepareOptions (string)
 *
 * Parse the parameter string provide as an option
 * list in `option`. Returns an object that can be
 * explored during help dislay.
 *
 * @param {String} options
 * @returns {Object} parsed
 * @api private
 */

function prepareOptions (str) {
  var list = str.split(' ')
    , res = { flags: [], def: null }
    , m;

  list.forEach(function (line) {
    // remove trailing commas
    if (line[line.length - 1] === ',')
      line = line.substr(0, line.length - 1);

    // parse out flags and default value
    if (line.substr(0, 2) === '--')
      res.flags.push(line.substr(2));
    else if (line[0] === '-')
      res.flags.push(line.substr(1));
    else if (m = line.match(/[^\[\]]+(?=\])/g))
      if (!res.def) res.def= m[0];
  });

  return res;
}
