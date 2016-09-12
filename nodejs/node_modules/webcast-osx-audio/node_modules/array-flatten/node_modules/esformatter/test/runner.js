"use strict";

// we run mocha manually otherwise istanbul coverage won't work
// run `npm test --coverage` to generate coverage report

var Mocha = require('mocha');


// ---



// to set these options run the test script like:
//  > BAIL=true GREP=array_expression REPORTER=dot npm test
var opts = {
  ui: 'bdd',
  bail: !!(process.env.BAIL),
  reporter:( process.env.REPORTER || 'spec'),
  grep: process.env.GREP
};

// we use the dot reporter on travis since it works better
if (process.env.TRAVIS) {
  opts.reporter = 'dot';
}

var m = new Mocha(opts);

if (process.env.INVERT) {
  m.invert();
}


m.addFile('test/format.spec.js');
m.addFile('test/transform.spec.js');
m.addFile('test/diff.spec.js');
m.addFile('test/cli.spec.js');
m.addFile('test/api.spec.js');
m.addFile('test/plugins.spec.js');
m.addFile('test/pipe.spec.js');

m.run(function(err) {
  var exitCode = err ? 1 : 0;
  if (err) console.log('failed tests: ' + err);
  process.exit(exitCode);
});

