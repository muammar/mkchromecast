'use strict';
var espurify = require('espurify');
var deepStrictEqual = require('deep-strict-equal');
var createAvaRule = require('../create-ava-rule');

var notAllowed = [
	'falsy',
	'true',
	'false',
	'is',
	'not',
	'regex',
	'notRegex',
	'ifError'
];

function assertionCalleeAst(methodName) {
	return {
		type: 'MemberExpression',
		object: {
			type: 'Identifier',
			name: 't'
		},
		property: {
			type: 'Identifier',
			name: methodName
		},
		computed: false
	};
}

function skippedAssertionCalleeAst(methodName) {
	return {
		type: 'MemberExpression',
		object: {
			type: 'MemberExpression',
			object: {
				type: 'Identifier',
				name: 't'
			},
			property: {
				type: 'Identifier',
				name: 'skip'
			},
			computed: false
		},
		property: {
			type: 'Identifier',
			name: methodName
		},
		computed: false
	};
}

function isCalleeMatched(callee, methodName) {
	return deepStrictEqual(callee, assertionCalleeAst(methodName)) ||
		deepStrictEqual(callee, skippedAssertionCalleeAst(methodName));
}

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(function (node) {
			var callee = espurify(node.callee);

			if (callee.type === 'MemberExpression') {
				notAllowed.forEach(function (methodName) {
					if (isCalleeMatched(callee, methodName)) {
						context.report({
							node: node,
							message: 'Only asserts with no power-assert alternative are allowed.'
						});
					}
				});
			}
		})
	});
};
