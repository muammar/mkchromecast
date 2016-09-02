'use strict';
var createAvaRule = require('../create-ava-rule');

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(function (node) {
			var functionArg = node.arguments[node.arguments.length - 1];

			if (!(functionArg && functionArg.params && functionArg.params.length)) {
				return;
			}

			if (functionArg.params.length > 1) {
				context.report({
					node: node,
					message: 'Test should only have one parameter named `t`.'
				});
			} else if (functionArg.params[0].name !== 't') {
				context.report({
					node: node,
					message: 'Test parameter should be named `t`.'
				});
			}
		})
	});
};
