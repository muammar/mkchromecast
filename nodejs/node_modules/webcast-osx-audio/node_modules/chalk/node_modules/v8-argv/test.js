var assert = require('assert');
var nixt = require('nixt');

var errors = [];

var TESTS = [
  '-d',
  //'debug',  // hangs
  '--debug',
  //'--debug-brk', // hangs
  '-gc',
  '--expose-gc',
  '--gc-global',
  '--harmony',
  '--harmony-proxies',
  '--harmony-collections',
  '--harmony-generators',
  '--prof',
  // '--trace'  // no exit code
];


(function run(i) {
  if (!TESTS[i]) {
   if (errors.length) console.log('');
   errors.forEach(function(err) {
    console.error(err.message);
   });

   console.log('');
   console.log(errors.length + ' errors');
   process.exit(errors.length);
  }

  var cmd = './test/bin ' + TESTS[i] + ' --keep';
  console.log(cmd);
  nixt().code(0).run(cmd, function(err) {
    if (err) errors.push(err);
    run(++i);
  });
})(0);
