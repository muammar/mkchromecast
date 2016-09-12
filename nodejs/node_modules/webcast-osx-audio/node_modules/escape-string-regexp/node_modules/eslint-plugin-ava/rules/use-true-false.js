'use strict';
var espree = require('espree');
var espurify = require('espurify');
var deepStrictEqual = require('deep-strict-equal');
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var booleanBinaryOperators = [
	'==',
	'===',
	'!=',
	'!==',
	'<',
	'<=',
	'>',
	'>='
];

var knownBooleanSignatures = [
	'isFinite()',
	'isNaN()',
	'Object.is()',
	'Object.isExtensible()',
	'Object.isFrozen()',
	'Object.isSealed()',
	'Boolean()',
	'Number.isNaN()',
	'Number.isFinite()',
	'Number.isInteger()',
	'Number.isSafeInteger()',
	'Array.isArray()',
	'ArrayBuffer.isView()',
	'SharedArrayBuffer.isView()',
	'Reflect.has()',
	'Reflect.isExtensible()'
].map(function (signature) {
	return espurify(espree.parse(signature).body[0].expression.callee);
});

function matchesKnownBooleanExpression(arg) {
	if (arg.type !== 'CallExpression') {
		return false;
	}

	var callee = espurify(arg.callee);

	return knownBooleanSignatures.some(function (signature) {
		return deepStrictEqual(callee, signature);
	});
}

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(function (node) {
			if (
				node.callee.type === 'MemberExpression' &&
				(node.callee.property.name === 'truthy' || node.callee.property.name === 'falsy') &&
				util.nameOfRootObject(node.callee) === 't'
			) {
				var arg = node.arguments[0];

				if (arg &&
					((arg.type === 'BinaryExpression' && booleanBinaryOperators.indexOf(arg.operator) !== -1) ||
					(arg.type === 'UnaryExpression' && arg.operator === '!') ||
					(arg.type === 'Literal' && arg.value === Boolean(arg.value)) ||
					(matchesKnownBooleanExpression(arg)))
				) {
					if (node.callee.property.name === 'falsy') {
						context.report({
							node: node,
							message: '`t.false()` should be used instead of `t.falsy()`.'
						});
					} else {
						context.report({
							node: node,
							message: '`t.true()` should be used instead of `t.truthy()`.'
						});
					}
				}
			}
		})
	});
};
