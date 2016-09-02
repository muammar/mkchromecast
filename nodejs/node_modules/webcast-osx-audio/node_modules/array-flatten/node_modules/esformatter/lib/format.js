'use strict';

var _options = require('./options');
// we use espree because it supports more ES6 features than esprima at the
// moment and supports JSX
var espree = require('espree');
var npmRun = require('npm-run');
var plugins = require('./plugins');
var rocambole = require('rocambole');
var transform = require('./transform');


exports = module.exports = format;
function format(str, opts) {
  // we need to load and register the plugins as soon as possible otherwise
  // `stringBefore` won't be called and default settings won't be used
  _options.set(opts);

  // remove shebang before pipe because piped commands might not know how
  // to handle it
  var prefix = '';
  if (_options.get('esformatter.allowShebang')) {
    prefix = getShebang(str);
    if (prefix) {
      str = str.replace(prefix, '');
    }
  }

  var pipeCommands = _options.get('pipe');

  if (pipeCommands) {
    str = pipe(pipeCommands.before, str).toString();
  }

  str = doFormat(str, opts);

  if (pipeCommands) {
    str = pipe(pipeCommands.after, str).toString();
  }

  // we only restore bang after pipe because piped commands might not know how
  // to handle it
  return prefix + str;
}


// allows users to override parser
exports.parseFn = espree.parse;
exports.parseContext = espree;
exports.parseOptions = {
  ecmaFeatures: {
    arrowFunctions: true,
    blockBindings: true,
    destructuring: true,
    regexYFlag: true,
    regexUFlag: true,
    templateStrings: true,
    binaryLiterals: true,
    octalLiterals: true,
    unicodeCodePointEscapes: true,
    defaultParams: true,
    restParams: true,
    forOf: true,
    objectLiteralComputedProperties: true,
    objectLiteralShorthandMethods: true,
    objectLiteralShorthandProperties: true,
    objectLiteralDuplicateProperties: true,
    generators: true,
    spread: true,
    classes: true,
    modules: true,
    jsx: true,
    globalReturn: true,
    experimentalObjectRestSpread: true
  }
};


function getShebang(str) {
  var result = (/^#!.+\n/).exec(str);
  return result ? result[0] : '';
}


function doFormat(str) {
  str = plugins.stringBefore(str);
  // allows user to override the parser
  rocambole.parseFn = exports.parseFn;
  rocambole.parseContext = exports.parseContext;
  var ast = rocambole.parse(str, exports.parseOptions);
  transform(ast, transform.BYPASS_OPTIONS);
  str = ast.toString();
  str = plugins.stringAfter(str);
  return str;
}


// run cli tools in series passing the stdout of previous tool as stdin of next
// one
function pipe(commands, input) {
  if (!commands) {
    return input;
  }
  return commands.reduce(function(input, cmd) {
    return npmRun.sync(cmd, {
      input: input
    });
  }, input);
}
