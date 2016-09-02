/*!
 * Electron - process.argv parsing
 * Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * External dependancies
 */

var EventEmitter = require('drip').EnhancedEmitter
  , tty = require('tty')
  , util = require('util');

/*!
 * Electron dependancies
 */

var Args = require('./args')
  , Command = require('./command')
  , themes = require('./themes');

/*!
 * isTTY (can support color)
 */

var istty = tty.isatty(1) && tty.isatty(2);

/*!
 * defaults (a, b)
 *
 * Helper function to merge one object to another
 * using the first object as default values.
 *
 * @param {Object} subject
 * @param {Object} defaults
 * @name defaults
 * @api private
 */

function defaults (a, b) {
  if (a && b) {
    for (var key in b) {
      if ('undefined' == typeof a[key]) a[key] = b[key];
    }
  }
  return a;
};

/*!
 * Main export
 */

module.exports = Program;

/**
 * ## Program Framework
 *
 * The primary export of the electron module is a function
 * that composes a new program framework. The returned
 * `program` is a chainable api that allow you to change
 * settings, define commands, and start launch the program.
 *
 * The primary argument provided on construction is the base
 * name used through the help documentation. In a majority of
 * of cases, this would be the command executed from your terminal
 * used launch the program.
 *
 * In the case of scripts with the header of `#!/usr/bin/env node`,
 * you should use a variant of the following.
 *
 *     var program = electron('microscope');
 *
 * If you are however launching your program from a `.js` file,
 * the recommended construction pattern is the following.
 *
 *     var program = electrong('node microscope.js');
 *
 * You can then chain any of the following commands to further
 * define your application and commands.
 *
 * @header Program Framework
 */

function Program (base, opts) {
  /*!
   * @param {String} base name
   * @param {Object} options
   */

  EventEmitter.call(this, { delimeter: ' ' });
  this.commands = [];
  this._colorized = false;
  this.opts = defaults(opts || {}, {
      useColors: istty
    , version: null
    , desc: null
    , name: base || 'Electron'
    , base: base || 'electron'
    , cwd: process.cwd()
    , theme: {
          name: 'clean'
        , spec: {
            noColor: false
          }
      }
  });
}

/*!
 * Inherit from Drip event emitter.
 */

util.inherits(Program, EventEmitter);

/**
 * ### .command (name)
 *
 * The most important aspect of an application is defining
 * the different commands that can be executed for it. Some
 * people prefer a CLI tool that does one thing based on a
 * set of options. Others prefer a command line tool that
 * can pivot based on a command string. Electron supports both.
 *
 * When using the `command` method, it will return a constructed
 * command object with a different set of methods for chaining.
 * Please read the "Constructing Commands" section for all available
 * chainable methods and their respective purpose.
 *
 * ##### Single Command
 *
 * As you understand how Electron parses command-line options,
 * you know that a command is any option that does
 * not start with `-` or `--`. Therefor, a single-command electron
 * application is one that does not require any `commands`, but
 * will execute a single action. Best demonstrated...
 *
 *     $ node app.js -p 8080
 *
 * In the case of single-command applications, we will define
 * a `default` command for electron to run.
 *
 *     program
 *       .command('default')
 *       .action(function (argv) {
 *         var port = argv.param('p', 'port');
 *         // something cool
 *       });
 *
 * The `default` command will run when no commands are passed in,
 * but it will not run if a command is provided.
 *
 * ##### Multiple Commands
 *
 * You can also create many different commands for your application
 * based on a simple string. These can be used in conjunction
 * with `default` if you would like.
 *
 *     $ node app.js hello --universe
 *
 * In this case we want to only run an action when the comamnd
 * `hello` is present. This can easily be achieved.
 *
 *     program
 *       .command('hello')
 *       .action(fn);
 *
 * There are also cases where you might want to have multipe layers
 * of commands.
 *
 *     $ node app.js hello universe
 *
 * Using the same mechanism, we can easily define this action.
 *
 *     program
 *       .command('hello universe')
 *       .action(fn);
 *
 * One final option to explore with multiple commands is wildcards.
 * Wildcards can exist at any level in a multi-word command, but they
 * only work for entire words, not substrings.
 *
 *     program
 *       .command('hello *')
 *       .action(function (argv) {
 *         var where = argv.commands[1];
 *       });
 *
 * Would respond for any command starting with `hello` and is two
 * commands long, such as...
 *
 *     $ node app.js hello world
 *     $ node app.js hello universe
 *
 * ##### Absent Commands
 *
 * Should you want to notify your users when they attempt to use
 * a command is not support, you may use the `absent` command. This
 * is also useful if you want to have a single command app but
 * support a list of items as "options", such as a list of files or
 * directories.
 *
 *     $ node build.js file1.js files2.js
 *
 *     program
 *       .command('absent')
 *       .action(function (argv) {
 *         var files = argv.commands.slice(0);
 *         // something cool
 *       });
 *
 * @param {String} command name
 * @returns chainable constructed command
 * @name command
 * @api public
 */

Program.prototype.command = function (name) {
  var cmd = new Command(name);
  this.commands.push(cmd);
  return cmd;
};

/**
 * ### .parse (process.argv)
 *
 * The `parse` method will initiate the program with
 * selection of arguments and run a matching action. It
 * should be used once all commands and settings have
 * been propogated.
 *
 *     program.parse();
 *     program.parse(process.argv);
 *     program.parse([ 'node', 'app.js', '--hello', '--universe' ]);
 *
 * If no parameter is provided, `parse` will default to using
 * the current processes `process.argv` array. You may alse
 * provide your own array of commands if you like. Note that
 * argv parsing expectes the first item to be the executing program
 * and the second argument to be the script (as is with all node argv).
 * These will be discarded.
 *
 * @param {Array} process.argv or compable array
 * @name parse
 * @api public
 */

Program.prototype.parse = function (args) {
  args = args || process.argv;
  var argv = new Args(args)
    , cmds = mountCommands.call(this)
    , command = argv.commands.slice(0);

  argv.cwd = this.opts.cwd;
  if (argv.mode('help', 'h')) {
    this.showHelp();
  } else if (argv.mode('version', 'v')) {
    displayVersion.call(this);
  } else if (!command.length) {
    if (cmds.def) cmds.def(argv);
  } else if (!this.hasListener(command)) {
    if (cmds.absent) cmds.absent(argv);
  } else {
    this.emit(command, argv);
  }

  return this;
};

/**
 * ### .name (name)
 *
 * Provide a formal name to be used when displaying
 * the help for the given program. Returns the program
 * for chaining.
 *
 *     program.name('Electron Framework');
 *
 * @param {String} formal name
 * @returns `this` for chaining
 * @name name
 * @api public
 */

Program.prototype.name = function (name) {
  this.opts.name = name;
  return this;
};

/**
 * ### .version (version)
 *
 * Provide a program version to be used when displaying
 * the version for the given program. Returns the program
 * for chaining.
 *
 *     program.version(electron.version);
 *
 * @param {String} application version
 * @returns `this` for chaining
 * @name version
 * @api public
 */

Program.prototype.version = function (v) {
  this.opts.version = v;
  return this;
};

/**
 * ### .desc (description)
 *
 * Provide a program discription to be used when displaying
 * the the help for the given program. Returns the program
 * for chaining.
 *
 *     program.desc('https://github.com/logicalparadox/electron');
 *
 * @param {String} application description
 * @returns `this` for chaining
 * @name desc
 * @api public
 */

Program.prototype.desc = function (desc) {
  this.opts.desc = desc;
  return this;
};

/**
 * ### .cwd (fqp)
 *
 * Provide an alternative current working directory to be
 * passed as part of the `argv` parameter to the action that has
 * been executed. Returns the program for chaining.
 *
 *     // set
 *     program.cwd(__dirname);
 *
 *     // get
 *     program
 *       .command('universe')
 *       .action(function (argv) {
 *         var cwd = argv.cwd;
 *         // something cool
 *       });
 *
 * @param {String} fully quialified path
 * @returns `this` for chaining
 * @name cwd
 * @api public
 */

Program.prototype.cwd = function (p) {
  this.opts.cwd = p;
  return this;
};

/**
 * ### .theme (theme, specifications)
 *
 * You may change the appearance of the `--help` using
 * a simple theming mechanism. Electron comes bundled with
 * two themes. Each theme also supports minor tweaks. Returns
 * the program for chaining.
 *
 * ##### clean (default)
 *
 * A colorful and verbose theme useful for multi-command applications.
 *
 *     program
 *       .theme('clean', {
 *           noColor: false // set to true to disable color coding
 *         , prefix: '' // prefix written before each line, such as 'help:'
 *       });
 *
 * <img alt="Electron Clean Theme" src="http://f.cl.ly/items/10283V3e2o1R0f2d2x32/electron-clean-theme.png" />
 *
 * ##### simple
 *
 * An "options only" theme useful for single command applications.
 *
 *     program
 *       .theme('simple', {
 *           noColor: false // set to true to disable color coding
 *         , command: 'default' // which command to show options for
 *         , usage: '<options>' // special usage instructions
 *       });
 *
 * <img alt="Electron Simple Theme" src="http://f.cl.ly/items/3z3l162D101e0016320G/electron-simple-theme.png" />
 *
 * ##### Use Your Own Function
 *
 * You may also provide a function to `theme` to provide your own output.
 * The following example will list all of the commands present in your
 * program.
 *
 *     program.theme(function () {
 *       this.colorize();
 *       console.log('Usage: %s <command>', this.opts.base);
 *       this.commands.forEach(functioni (cmd) {
 *         console.log('  %s - %s', cmd.cmd, cmd.desc);
 *       });
 *     });
 *
 * Those interesting in building custom themes should view Electron
 * on GitHub and explore
 * [lib/electron/themes](https://github.com/logicalparadox/electron/tree/master/lib/electron/themes).
 *
 * @param {String|Function} name of electron theme or custom function
 * @param {Object} options for electron themes
 * @returns `this` for chaining
 * @name theme
 * @api public
 */

Program.prototype.theme = function (name, spec) {
  if ('function' === typeof name) {
    this.opts.theme = name;
  } else {
    var theme = {};
    theme.name = name || 'clean';
    theme.spec = defaults(spec || {}, { noColor: false });
    this.opts.theme = theme;
  }

  return this;
};

/**
 * ### .colorize ()
 *
 * The `colorize` helper is available if you wish you implement
 * a colorized but lightweight logging mechanism in your actions,
 * or if you are building a custom help theme. `colorize` works
 * by extending `String.prototype` with a number of color options.
 * Just in case, if the current program is not running as a TTY,
 * no string changes will be made.
 *
 *     program.colorize();
 *     console.log('hello universe'.green);
 *
 * ##### Colors
 *
 * - red
 * - green
 * - yellow
 * - blue
 * - magenta
 * - cyan
 * - gray
 *
 * @name colorize
 * @api public
 */

Program.prototype.colorize = function (noColors) {
  if (this._colorized) return this;
  var self = this
    , colors = {
          'red': 31
        , 'green': 32
        , 'yellow': 33
        , 'blue': 34
        , 'magenta': 35
        , 'cyan': 36
        , 'gray': 90
        , 'reset': 0
      };

  Object.keys(colors).forEach(function (color) {
    Object.defineProperty(String.prototype, color,
      { get: function () {
          if (noColors || !self.opts.useColors) return this + '';
          return '\033[' + colors[color] + 'm' + this + '\033[0m';
        }
      , configurable: true
    });
  });

  this._colorized = true;
  return this;
};

/*!
 * mountCommands ()
 *
 * For each constructed command added to the the program
 * mount as a listener. If the command is special, return
 * it for futher inspection.
 *
 * @ctx program
 * @api private
 */

function mountCommands () {
  var self = this
    , res = {}
    , arr = [];

  this.commands.forEach(function (command) {
    var fn = command.opts.action
      , ev = Array.isArray(command.opts.cmd)
          ? command.opts.cmd.join(' ')
          : command.opts.cmd;

    if (ev === 'default') res.def = fn;
    else if (ev === 'absent') res.absent = fn;
    else if (!~arr.indexOf(ev)) {
      arr.push(ev);
      self.on(ev, fn);
    }
  });

  return res;
}

/*!
 * displayVersion ()
 *
 * Display the current program version and exit
 * process. Used when called with `-v` or `--version`
 *
 * @ctx program
 * @api private
 */

function displayVersion() {
  process.stdout.write(this.opts.version + '\n');
  process.exit();
}

/*!
 * ### displayHelp()
 *
 * Execute the custom help theme or find the respective
 * electron theme and execute.
 *
 * @ctx program
 * @api public
 */

Program.prototype.showHelp = function () {
  if ('function' === typeof this.opts.theme)
    return this.opts.theme.call(this);

  var name = this.opts.theme.name
    , theme = themes[name]
    , spec = this.opts.theme.spec || {};

  if (!theme) throw new Error('Electron: Invalid help theme defined.');
  else theme.call(this, spec);
}
