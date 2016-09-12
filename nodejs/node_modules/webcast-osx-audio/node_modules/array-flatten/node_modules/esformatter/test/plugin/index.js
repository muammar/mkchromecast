"use strict";

// IMPORTANT: run `npm rm esformatter-test-plugin && npm i test/plugin` every
// time you update this file!

exports.setOptions = function(opts, esformatter) {
  opts.foo = 'bar';
  opts.bar = 123;
  // makes sure we are able to read default values and edit it
  opts.indent.ArrayExpression += 2;
  this.opts = opts;
  this.esformatter = esformatter;
};

exports.tokenBefore = function(token) {
  if (token.value === 'true') {
    token.value = 'false';
  }
};
