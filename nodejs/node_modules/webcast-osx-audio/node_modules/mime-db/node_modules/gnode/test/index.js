
/**
 * Module dependencies.
 */

var path = require('path');
var spawn = require('child_process').spawn;

// node executable
var node = process.execPath || process.argv[0];
var mocha = path.resolve(__dirname, '..', 'node_modules', 'mocha', 'bin', 'mocha');
var mochaOpts = [ '--reporter', 'spec' ];

run([
  [ mocha, path.resolve(__dirname, 'cli.js') ]
]);

function run (tests) {
  if (0 == tests.length) return;
  var argv = tests.shift();
  if (argv.indexOf(mocha) != -1) {
    // running mocha, append "mochaOpts"
    argv.push.apply(argv, mochaOpts);
  }
  var opts = {
    customFds: [ 0, 1, 2 ],
    stdio: 'inherit'
  };
  var child = spawn(node, argv, opts);
  child.on('exit', function (code) {
    if (0 == code) {
      run(tests);
    } else {
      process.exit(code);
    }
  });
}
