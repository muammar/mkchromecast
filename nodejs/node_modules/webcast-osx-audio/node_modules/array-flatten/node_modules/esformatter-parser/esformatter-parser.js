'use strict';

var acornToEsprima = require('acorn-to-esprima');
var babelTraverse = require('babel-traverse').default;
var babylon = require('babylon');
var rocambole = require('rocambole');

// need to skip extra properties from babylon otherwise we would format more
// nodes than we need and it also confuses rocambole about {start|end}Token
rocambole.BYPASS_RECURSION.loc = true;
rocambole.BYPASS_RECURSION.leadingComments = true;
rocambole.BYPASS_RECURSION.trailingComments = true;

exports.parse = function(str, opts) {
  rocambole.parseFn = babelEslint;
  return rocambole.parse(str, opts || exports.defaultOptions);
};

exports.babylon = babylon;

function babelEslint(str, opts) {
  var ast = (exports.babylon || babylon).parse(str, opts);

  // remove EOF token, eslint doesn't use this for anything and it interferes with some rules
  // see https://github.com/babel/babel-eslint/issues/2 for more info
  // todo: find a more elegant way to do this
  ast.tokens.pop();

  // convert tokens
  ast.tokens = acornToEsprima.toTokens(ast.tokens, babylon.tokTypes, str);

  // add comments
  acornToEsprima.convertComments(ast.comments);

  // transform esprima and acorn divergent nodes
  acornToEsprima.toAST(ast, babelTraverse, str);

  // remove File
  ast.type = 'Program';
  ast.sourceType = ast.program.sourceType;
  ast.directives = ast.program.directives;
  ast.body = ast.program.body;
  delete ast.program;
  delete ast._paths;

  acornToEsprima.attachComments(ast, ast.comments, ast.tokens);

  return ast;
}

exports.defaultOptions = {
  allowImportExportEverywhere: false, // consistent with espree
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  locations: true,
  onComment: [],
  onToken: [],
  plugins: [
    'asyncFunctions',
    'asyncGenerators',
    'classConstructorCall',
    'classProperties',
    'decorators',
    'doExpressions',
    'exponentiationOperator',
    'exportExtensions',
    'flow',
    'functionBind',
    'functionSent',
    'jsx',
    'objectRestSpread',
    'trailingFunctionCommas'
  ],
  ranges: true,
  sourceType: 'module',
  strictMode: true
};

