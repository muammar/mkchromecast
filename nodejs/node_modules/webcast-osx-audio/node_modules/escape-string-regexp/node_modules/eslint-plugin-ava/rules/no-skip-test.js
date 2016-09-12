'use strict';
var createAvaRule = require('../create-ava-rule');

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(function (node) {
			if (ava.hasTestModifier('skip')) {
				context.report({
					node: node,
					message: 'No tests should be skipped.'
				});
			}
		})
	});
};
