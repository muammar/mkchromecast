/*!
 * Electron
 * Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Electron constructors
 */

var Program = require('./electron/program')
  , Args = require('./electron/args');

/*!
 * Primary export - program factory
 */

var exports = module.exports = defineProgram;

/*!
 * defineProgram long form
 */

exports.defineProgram = defineProgram;

/*!
 * Electron version
 */

exports.version = '0.4.0';

/*!
 * Argv parsing factory
 */

exports.argv = function (args) {
  args = args || process.argv;
  var argv = new Args(args);
  return argv;
};

/*!
 * program factory
 */

function defineProgram (name, opts) {
  var program = new Program(name, opts);
  return program;
}
