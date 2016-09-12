'use strict';

var esformatter = require('../lib/esformatter');
var fs = require('fs');
var glob = require('glob');
var merge = require('mout/object/merge');
var minimist = require('minimist');
var options = require('./options');
var path = require('path');
var stdin = require('stdin');
var supportsColor = require('supports-color');

var parseOpts = {
  'boolean': [
    'help',
    'version',
    'i',
    'diff',
    'diff-unified',
    'no-color',
    'color'
  ],
  'alias': {
    'h': 'help',
    'v': 'version',
    'c': 'config',
    'p': 'preset'
  }
};


// exit code should be !== 0 if we find any errors during execution
exports.exitCode = 0;


// allow mocking/replacing the stdout/stderr
exports.stdout = process.stdout;
exports.stderr = process.stderr;


exports.parse = function(arr) {
  var argv = minimist(arr, parseOpts);

  if (argv.plugins) {
    argv.plugins = argv.plugins.split(',');
  }

  return argv;
};


exports.run = function(argv) {
  // reset error flag at each run
  exports.exitCode = 0;

  if (argv.help) {
    var help = fs.readFileSync(path.join(__dirname, '../doc/cli.txt'));
    exports.stderr.write(help);
    return;
  }

  if (argv.version) {
    var pkg = require('../package.json');
    exports.stderr.write('esformatter v' + pkg.version + '\n');
    return;
  }

  if (argv.i && (argv.diff || argv['diff-unified'])) {
    logError(
      'Error: "--diff" and "--diff-unified" flags ' +
      'can\'t be used together with the "-i" flag.'
    );
    return;
  }

  run(argv);
};


function run(argv) {
  var files = argv._;

  if (!files.length) {
    stdin(function(source) {
      toConsole(source, null, argv);
    });
    return;
  }

  files = expandGlobs(files);

  if (argv.i) {
    files.forEach(function(file) {
      formatToSelf(file, argv);
    });
    return;
  }

  files.forEach(function(file) {
    toConsole(getSource(file), file, argv);
  });
}


// we are handling errors this way instead of prematurely terminating the
// program because user might be editing multiple files at once and error
// might only be present on a single file
function logError(e) {
  var msg = typeof e === 'string' ? e : e.message;

  // esprima.parse errors are in the format 'Line 123: Unexpected token &'
  if ((/Line \d+:/).test(msg)) {
    // convert into "Error: <filepath>:<line> <error_message>"
    msg = 'Error: ' + msg.replace(/[^\d]+(\d+): (.+)/, e.file + ':$1 $2');
  }

  // set the error flag to true to use an exit code !== 0
  exports.exitCode = 1;

  // we don't call console.error directly to make it possible to mock during
  // unit tests
  exports.stderr.write(msg + '\n');
}


function expandGlobs(filePaths) {
  return filePaths.reduce(function(arr, file) {
    // if file path contains "magical chars" (glob) we expand it, otherwise we
    // simply use the file path
    if (glob.hasMagic(file)) {
      return arr.concat(glob.sync(file, {
        // we want to return the glob itself to report that it didn't find any
        // files, better to giver clear error messages than to fail silently
        nonull: true,
        nodir: true
      }));
    }
    arr.push(file);
    return arr;
  }, []);
}


function getSource(file) {
  try {
    return fs.readFileSync(file).toString();
  } catch (e) {
    logError('Error: Can\'t read source file. Exception: ' + e.message);
  }
}


function getConfig(filePath, argv) {
  // if user sets the "preset" we don't load any other config file
  // we assume the "preset" overrides any user settings
  if (argv.preset || argv.root) {
    return argv;
  }

  try {
    // we only load ".esformatter" or "package.json" file if user did not
    // provide a config file as argument, that way we allow user to override
    // the behavior
    var config = argv.config ?
      options.loadAndParseConfig(argv.config) :
      options.getRc(filePath);

    // we always merge the argv to allow user to override the default settings
    return merge(config, argv);
  } catch (e) {
    logError('Error: ' + e.message);
  }
}


function toConsole(source, file, argv) {
  var config = getConfig(file, argv);
  if (!source || !config) return;
  try {
    var result;

    if (argv.diff || argv['diff-unified']) {
      var method = argv.diff ? 'chars' : 'unified';
      if (!supportsColor) {
        method = 'unifiedNoColor';
      }
      result = esformatter.diff[method](source, config, file);
      if (result) {
        exports.exitCode = 1;
        // we are using stdout even tho it's considered an "error" because user
        // might want to pipe multiple tools and diff(1) also outputs to stdout
        exports.stdout.write(result);
      }
      return;
    }

    result = esformatter.format(source, config);
    // do not use console.log since it adds a line break at the end
    exports.stdout.write(result);

  } catch (e) {
    logError({
      message: e.message,
      file: (file || 'stdin')
    });
  }
}


function formatToSelf(file, argv) {
  var source = getSource(file);
  var config = getConfig(file, argv);
  if (!source || !config) return;
  try {
    fs.writeFileSync(file, esformatter.format(source, config));
  } catch (e) {
    logError({
      message: e.message,
      file: file
    });
  }
}
