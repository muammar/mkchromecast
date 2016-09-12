"use strict";


// Hooks for each node.type that should be processed individually
// ---
// using an object to store each transform method to avoid a long switch
// statement, will be more organized in the long run and also allow
// monkey-patching/spies/mock/stub.


// we are not using something like https://npmjs.org/package/require-all
// because we want esformatter to be able to run in the browser in the future

exports.ArrayExpression = require('./hooks/ArrayExpression');
exports.ArrayPattern = require('./hooks/ArrayPattern');
exports.ArrowFunctionExpression = require('./hooks/ArrowFunctionExpression');
exports.AssignmentExpression = require('./hooks/AssignmentExpression');
exports.BinaryExpression = require('./hooks/BinaryExpression');
exports.CallExpression = exports.NewExpression = require('./hooks/CallExpression');
exports.CatchClause = require('./hooks/CatchClause');
exports.ClassDeclaration = exports.ClassExpression = require('./hooks/ClassDeclarationAndExpression');
exports.ConditionalExpression = require('./hooks/ConditionalExpression');
exports.DoWhileStatement = require('./hooks/DoWhileStatement');
exports.ExportAllDeclaration = require('./hooks/ExportAllDeclaration');
exports.ExportDefaultDeclaration = require('./hooks/ExportDefaultDeclaration');
exports.ExportNamedDeclaration = require('./hooks/ExportNamedDeclaration');
exports.ExportSpecifier = require('./hooks/ExportSpecifier');
exports.ForInStatement = require('./hooks/ForInStatement');
exports.ForOfStatement = require('./hooks/ForOfStatement');
exports.ForStatement = require('./hooks/ForStatement');
exports.FunctionDeclaration = require('./hooks/FunctionDeclaration');
exports.FunctionExpression = require('./hooks/FunctionExpression');
exports.IfStatement = require('./hooks/IfStatement');
exports.ImportDeclaration = require('./hooks/ImportDeclaration');
exports.ImportSpecifier = require('./hooks/ImportSpecifier');
exports.LogicalExpression = require('./hooks/LogicalExpression');
exports.MemberExpression = require('./hooks/MemberExpression');
exports.MethodDefinition = require('./hooks/MethodDefinition');
exports.ObjectExpression = require('./hooks/ObjectExpression');
exports.ObjectPattern = require('./hooks/ObjectPattern');
exports.ReturnStatement = require('./hooks/ReturnStatement');
exports.SequenceExpression = require('./hooks/SequenceExpression');
exports.SwitchStatement = require('./hooks/SwitchStatement');
exports.SwitchCase = require('./hooks/SwitchCase');
exports.ThrowStatement = require('./hooks/ThrowStatement');
exports.TryStatement = require('./hooks/TryStatement');
exports.UnaryExpression = require('./hooks/UnaryExpression');
exports.UpdateExpression = require('./hooks/UpdateExpression');
exports.VariableDeclaration = require('./hooks/VariableDeclaration');
exports.WhileStatement = require('./hooks/WhileStatement');
