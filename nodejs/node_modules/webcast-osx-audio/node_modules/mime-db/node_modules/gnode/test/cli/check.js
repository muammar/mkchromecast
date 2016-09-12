
var assert = require('assert');

// assert up here to ensure that hoisting works as expected
assert('gen' == gen.name);
assert('GeneratorFunction' == gen.constructor.name);

function *gen () {}

var g = gen();
assert('function' == typeof g.next);
assert('function' == typeof g.throw);
