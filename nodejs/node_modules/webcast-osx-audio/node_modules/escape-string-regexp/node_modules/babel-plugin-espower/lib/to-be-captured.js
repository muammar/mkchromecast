'use strict';

var typesToBeCaptured = [
    'Identifier',
    'BinaryExpression',
    'MemberExpression',
    'CallExpression',
    'UnaryExpression',
    'LogicalExpression',
    'ArrayExpression',
    'ObjectExpression',
    'TemplateLiteral',
    'YieldExpression',
    'AwaitExpression',
    'NewExpression',
    'AssignmentExpression',
    'UpdateExpression',
    'TaggedTemplateExpression'
];

function isCaputuringTargetType (types, nodePath) {
    var currentNode = nodePath.node;
    return typesToBeCaptured.some(function (nodeType) {
        return types['is' + nodeType](currentNode);
    });
}

function isCalleeOfParent(types, nodePath) {
    var currentKey = nodePath.key;
    var parentNode = nodePath.parent;
    return (types.isCallExpression(parentNode) || types.isNewExpression(parentNode)) && currentKey === 'callee';
}

function isChildOfTaggedTemplateExpression(types, nodePath) {
    var parentNode = nodePath.parent;
    return types.isTaggedTemplateExpression(parentNode);
}

function isYieldOrAwaitArgument(types, nodePath) {
    var currentKey = nodePath.key;
    var parentNode = nodePath.parent;
    // capture the yielded/await result, not the promise
    return (types.isYieldExpression(parentNode) || types.isAwaitExpression(parentNode)) && currentKey === 'argument';
}

var blacklist = [
    isYieldOrAwaitArgument,
    isCalleeOfParent,
    isChildOfTaggedTemplateExpression
];

module.exports = function toBeCaptured (types, nodePath) {
    return isCaputuringTargetType(types, nodePath) && !blacklist.some(function (predicate) {
        return predicate(types, nodePath);
    });
};
