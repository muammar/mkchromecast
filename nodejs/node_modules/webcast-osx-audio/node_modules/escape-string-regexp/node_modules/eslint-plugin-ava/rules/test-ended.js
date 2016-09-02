'use strict';
var createAvaRule = require('../create-ava-rule');

module.exports = function (context) {
	var ava = createAvaRule();
	var endCalled = false;

	return ava.merge({
		'MemberExpression': ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(function (node) {
			if (ava.hasTestModifier('cb') &&
				node.object.name === 't' &&
				node.property.name === 'end'
			) {
				endCalled = true;
			}
		}),
		'CallExpression:exit': ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(function (node) {
			if (!ava.hasTestModifier('cb')) {
				return;
			}

			// leaving test function
			if (endCalled) {
				endCalled = false;
			} else {
				context.report({
					node: node,
					message: 'Callback test was not ended. Make sure to explicitly end the test with `t.end()`.'
				});
			}
		})
	});
};
