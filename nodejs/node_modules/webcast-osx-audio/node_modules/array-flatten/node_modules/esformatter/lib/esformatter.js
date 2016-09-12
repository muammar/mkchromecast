'use strict';

// non-destructive changes to EcmaScript code using an "enhanced" AST for the
// process, it updates the tokens in place and add/remove spaces & line breaks
// based on user settings.
// not using any kind of code rewrite based on string concatenation to avoid
// breaking the program correctness and/or undesired side-effects.

var plugins = require('./plugins');

exports.diff = require('./diff');
exports.hooks = require('./hooks');
exports.format = require('./format');
exports.transform = require('./transform');
exports.rc = require('./options').getRc;
exports.register = plugins.register;
exports.unregister = plugins.unregister;
exports.unregisterAll = plugins.unregisterAll;
