'use strict';

// this module is used for automatic line break around nodes.


var _tk = require('rocambole-token');
var _br = require('rocambole-linebreak');
var debugAround = require('debug')('esformatter:br:around');


// ---


module.exports = aroundNodeIfNeeded;
function aroundNodeIfNeeded(node) {
  var shouldLimit = shouldLimitLineBreakAroundNode(node);
  debugAround('[aroundNodeIfNeeded] type: %s, shouldLimit: %s, ', node.type, shouldLimit);
  if (!shouldLimit) return;

  var type = node.type;
  _br.limitBefore(node.startToken, type);

  if (_tk.isSemiColon(node.endToken)) {
    _br.limitAfter(node.endToken, type);
  }
}



// tokens that only break line for special reasons
var CONTEXTUAL_LINE_BREAK = {
  AssignmentExpression: 1,
  ConditionalExpression: 1,
  CallExpression: 1,
  ExpressionStatement: 1,
  SequenceExpression: 1,
  LogicalExpression: 1,
  VariableDeclaration: 1
};

// bypass automatic line break of direct child
var BYPASS_CHILD_LINE_BREAK = {
  CallExpression: 1,
  DoWhileStatement: 1,
  IfStatement: 1,
  WhileStatement: 1,
  ForStatement: 1,
  ForInStatement: 1,
  ForOfStatement: 1,
  ReturnStatement: 1,
  ThrowStatement: 1
};

// add line break only if great parent is one of these
var CONTEXTUAL_LINE_BREAK_GREAT_PARENTS = {
  Program: 1,
  BlockStatement: 1,
  IfStatement: 1,
  FunctionExpression: 1
};

function shouldLimitLineBreakAroundNode(node) {

  if (node.parent) {
    // EmptyStatement shouldn't cause line breaks by default since user might
    // be using asi and it's common to add it to begin of line when needed
    if (node.parent.prev &&
      node.parent.prev.type === 'EmptyStatement') {
      return false;
    }
    // it is on root it should cause line breaks
    if (node.parent.type === 'Program') {
      return true;
    }
    // if inside "if" test we change the rules since you probaly don't
    // want to change the line break of the input ("test" can contain
    // AssignmentExpression, SequenceExpression, BinaryExpression, ...)
    if (isInsideIfTest(node)) {
      return false;
    }
  }

  if (!(node.type in CONTEXTUAL_LINE_BREAK)) {
    return true;
  }
  if (node.parent.type in BYPASS_CHILD_LINE_BREAK) {
    return false;
  }

  // iife
  if (node.type === 'CallExpression' &&
    node.callee.type === 'FunctionExpression') {
    return false;
  }

  var gp = node.parent.parent;
  if (gp && gp.type in CONTEXTUAL_LINE_BREAK_GREAT_PARENTS) {
    return true;
  }

  return false;
}


function isInsideIfTest(node) {
  if (node.parent && node.parent.type === 'IfStatement') {
    return node === node.parent.test;
  }
  // we don't check further than great parent since it's "expensive" and we
  // consider it as an edge case (you probably should not have too much logic
  // inside the "test")
  var greatParent = node.parent && node.parent.parent;
  return greatParent && greatParent.type === 'IfStatement' &&
    node.parent === greatParent.test;
}
