'use strict';

var typesNotToBeSkippedDuringCapturing = [
    'Identifier',
    'BinaryExpression',
    'MemberExpression',
    'CallExpression',
    'UnaryExpression',
    'LogicalExpression',
    'ArrayExpression',
    'ObjectExpression',
    'SequenceExpression',
    'TemplateLiteral',
    'YieldExpression',
    'AwaitExpression',
    'NewExpression',
    'AssignmentExpression',
    'UpdateExpression',
    'TaggedTemplateExpression',
    'ConditionalExpression',
    'SpreadElement',
    'Property'
];

function isTypeNotToBeSkippedDuringCapturing (types, nodePath) {
    var currentNode = nodePath.node;
    return typesNotToBeSkippedDuringCapturing.some(function (nodeType) {
        return types['is' + nodeType](currentNode);
    });
}

function isTypeToBeSkippedDuringCapturing (types, nodePath) {
    return !isTypeNotToBeSkippedDuringCapturing(types, nodePath);
}

function isLeftHandSideOfAssignment(types, nodePath) {
    var currentKey = nodePath.key;
    var parentNode = nodePath.parent;
    // Do not instrument left due to 'Invalid left-hand side in assignment'
    return types.isAssignmentExpression(parentNode) && currentKey === 'left';
}

function isChildOfObjectLiteral (types, parentNode) {
    return types.isObjectProperty(parentNode) ||
        types.isObjectMethod(parentNode) ||
        types.isSpreadProperty(parentNode);
}

function isObjectLiteralKey (types, parentNode, currentKey) {
    return isChildOfObjectLiteral(types, parentNode) && currentKey === 'key';
}

function isObjectLiteralValue (types, parentNode, currentKey) {
    return isChildOfObjectLiteral(types, parentNode) && currentKey === 'value';
}

function isNonComputedObjectLiteralKey(types, nodePath) {
    var currentKey = nodePath.key;
    var parentNode = nodePath.parent;
    // Do not instrument non-computed Object literal key
    return isObjectLiteralKey(types, parentNode, currentKey) && !parentNode.computed;
}

function isShorthandedValueOfObjectLiteral(types, nodePath) {
    var currentKey = nodePath.key;
    var parentNode = nodePath.parent;
    // Do not instrument shorthanded Object literal value
    return isObjectLiteralValue(types, parentNode, currentKey) && parentNode.shorthand;
}

function isUpdateExpression(types, nodePath) {
    var parentNode = nodePath.parent;
    // Just wrap UpdateExpression, not digging in.
    return types.isUpdateExpression(parentNode);
}

function isCallExpressionWithNonComputedMemberExpression(types, nodePath) {
    var currentKey = nodePath.key;
    var currentNode = nodePath.node;
    var parentNode = nodePath.parent;
    // Do not instrument non-computed property of MemberExpression within CallExpression.
    return types.isIdentifier(currentNode) && types.isMemberExpression(parentNode) && !parentNode.computed && currentKey === 'property';
}

function isTypeOfOrDeleteUnaryExpression(types, nodePath) {
    var currentKey = nodePath.key;
    var currentNode = nodePath.node;
    var parentNode = nodePath.parent;
    // 'typeof Identifier' or 'delete Identifier' is not instrumented
    return types.isIdentifier(currentNode) && types.isUnaryExpression(parentNode) && (parentNode.operator === 'typeof' || parentNode.operator === 'delete') && currentKey === 'argument';
}

var criteriaForSkipping = [
    isTypeToBeSkippedDuringCapturing,
    isLeftHandSideOfAssignment,
    isNonComputedObjectLiteralKey,
    isShorthandedValueOfObjectLiteral,
    isUpdateExpression,
    isCallExpressionWithNonComputedMemberExpression,
    isTypeOfOrDeleteUnaryExpression,
];

module.exports = function toBeSkipped (types, nodePath) {
    return criteriaForSkipping.some(function (predicate) {
        return predicate(types, nodePath);
    });
};
