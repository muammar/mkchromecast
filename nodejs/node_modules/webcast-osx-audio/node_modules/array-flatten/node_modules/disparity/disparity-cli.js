'use strict';

var disparity = require('./disparity');

// decided to not use an external lib because we have very few options
// and very basic logic
exports.parse = function(argv) {
  var args = {
    help: argv.indexOf('--help') !== -1 || argv.indexOf('-h') !== -1 || !argv.length,
    version: argv.indexOf('--version') !== -1 || argv.indexOf('-v') !== -1,
    unified: argv.indexOf('-u') !== -1 || argv.indexOf('--unified') !== -1,
    unifiedNoColor: argv.indexOf('-x') !== -1 || argv.indexOf('--unified-no-color') !== -1,
    paths: argv.slice(-2).filter(nonArgs),
    errors: []
  };
  // default mode is "--chars"
  args.chars = !args.unified;

  var len = args.paths.length;
  if (!args.help && !args.version && len !== 2) {
    args.errors.push('Error: you should provide 2 file paths, found "' + len + '".');
  }

  return args;
};

function nonArgs(val) {
  // arguments starts with "-" so we ignore those
  return val.indexOf('-') !== 0;
}

exports.run = function(args, out, err) {
  out = out || process.stdout;
  err = err || process.stderr;

  if (args.help) {
    showHelp(out);
    return 0;
  }

  if (args.version) {
    out.write('disparity v' + require('./package.json').version + '\n');
    return 0;
  }

  if (args.errors && args.errors.length) {
    args.errors.forEach(function(e) {
      err.write(e + '\n');
    });
    err.write('\n');
    showHelp(out);
    return 1;
  }

  var fs = require('fs');
  var f1 = fs.readFileSync(args.paths[0]).toString();
  var f2 = fs.readFileSync(args.paths[1]).toString();

  var method = 'chars';
  if (args.unified) {
    method = 'unified';
  }
  if (args.unifiedNoColor) {
    method = 'unifiedNoColor';
  }

  // defaul to char diff
  out.write(disparity[method](f1, f2, {
    paths: args.paths
  }));
  return 0;
};

function showHelp(out) {
  out.write([
    'disparity [OPTIONS] <file_1> <file_2>',
    'Colorized string diff.',
    '',
    'Options:',
    '  -u, --unified  Output unified diff.',
    '  -c, --chars    Output char diff (default mode).',
    '  -v, --version  Display current version.',
    '  -h, --help     Display this help.',
    ''
  ].join('\n'));
}
