'use strict';
var createAvaRule = require('../create-ava-rule');

var modifiers = [
	'after',
	'afterEach',
	'always',
	'before',
	'beforeEach',
	'cb',
	'only',
	'serial',
	'skip',
	'todo',
	'failing'
];

function getTestModifiers(node) {
	if (node.type === 'CallExpression') {
		return getTestModifiers(node.callee);
	}

	if (node.type === 'MemberExpression') {
		return getTestModifiers(node.object).concat(node.property.name);
	}

	return [];
}

function unknownModifiers(node) {
	return getTestModifiers(node)
		.filter(function (modifier) {
			return modifiers.indexOf(modifier) === -1;
		});
}

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(function (node) {
			var unknown = unknownModifiers(node);

			if (unknown.length !== 0) {
				context.report({
					node: node,
					message: 'Unknown test modifier `' + unknown[0] + '`.'
				});
			}
		})
	});
};
