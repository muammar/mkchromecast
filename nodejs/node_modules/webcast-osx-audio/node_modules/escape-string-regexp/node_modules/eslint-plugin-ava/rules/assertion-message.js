'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var expectedNbArguments = {
	deepEqual: 2,
	fail: 0,
	false: 1,
	falsy: 1,
	ifError: 1,
	is: 2,
	not: 2,
	notDeepEqual: 2,
	notThrows: 1,
	pass: 0,
	regex: 2,
	notRegex: 2,
	throws: 1,
	true: 1,
	truthy: 1
};

function nbArguments(node) {
	var nArgs = expectedNbArguments[node.property.name];

	if (nArgs !== undefined) {
		return nArgs;
	}

	if (node.object.type === 'MemberExpression') {
		return nbArguments(node.object);
	}

	return -1;
}

module.exports = function (context) {
	var ava = createAvaRule();
	var shouldHaveMessage = context.options[0] !== 'never';

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(function (node) {
			var callee = node.callee;
			if (callee.type !== 'MemberExpression') {
				return;
			}

			if (callee.property && util.nameOfRootObject(callee) === 't') {
				var nArgs = nbArguments(callee);

				if (nArgs === -1) {
					return;
				}

				var hasMessage = nArgs < node.arguments.length;

				if (!hasMessage && shouldHaveMessage) {
					context.report({
						node: node,
						message: 'Expected an assertion message, but found none.'
					});
				} else if (hasMessage && !shouldHaveMessage) {
					context.report({
						node: node,
						message: 'Expected no assertion message, but found one.'
					});
				}
			}
		})
	});
};

module.exports.schema = [{
	enum: [
		'always',
		'never'
	]
}];
