'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var expectedNbArguments = {
	deepEqual: {min: 2, max: 3},
	end: {min: 0, max: 0},
	fail: {min: 0, max: 1},
	false: {min: 1, max: 2},
	falsy: {min: 1, max: 2},
	ifError: {min: 1, max: 2},
	is: {min: 2, max: 3},
	not: {min: 2, max: 3},
	notDeepEqual: {min: 2, max: 3},
	notThrows: {min: 1, max: 2},
	pass: {min: 0, max: 1},
	plan: {min: 1, max: 1},
	regex: {min: 2, max: 3},
	notRegex: {min: 2, max: 3},
	throws: {min: 1, max: 3},
	true: {min: 1, max: 2},
	truthy: {min: 1, max: 2}
};

function nbArguments(node) {
	var name = node.property.name;
	var nArgs = expectedNbArguments[name];
	if (nArgs) {
		return nArgs;
	}

	if (node.object.type === 'MemberExpression') {
		return nbArguments(node.object);
	}

	return false;
}

module.exports = function (context) {
	var ava = createAvaRule();
	var options = context.options[0] || {};
	var enforcesMessage = Boolean(options.message);
	var shouldHaveMessage = options.message !== 'never';

	function report(node, message) {
		context.report({
			node: node,
			message: message
		});
	}

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(function (node) {
			var callee = node.callee;
			if (callee.type !== 'MemberExpression' ||
				!callee.property ||
				util.nameOfRootObject(callee) !== 't' ||
				util.isInContext(callee)
			) {
				return;
			}

			var gottenArgs = node.arguments.length;
			var nArgs = nbArguments(callee);
			if (!nArgs) {
				return;
			}

			if (gottenArgs < nArgs.min) {
				report(node, 'Not enough arguments. Expected at least ' + nArgs.min + '.');
			} else if (node.arguments.length > nArgs.max) {
				report(node, 'Too many arguments. Expected at most ' + nArgs.max + '.');
			} else if (enforcesMessage && nArgs.min !== nArgs.max) {
				var hasMessage = gottenArgs === nArgs.max;
				if (!hasMessage && shouldHaveMessage) {
					report(node, 'Expected an assertion message, but found none.');
				} else if (hasMessage && !shouldHaveMessage) {
					report(node, 'Expected no assertion message, but found one.');
				}
			}
		})
	});
};

module.exports.schema = [{
	type: 'object',
	properties: {
		message: {
			enum: [
				'always',
				'never'
			]
		}
	}
}];
