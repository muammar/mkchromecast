'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		MemberExpression: ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(function (node) {
			if (node.property.name === 'end' &&
					!ava.hasTestModifier('cb') &&
					util.nameOfRootObject(node) === 't') {
				context.report({
					node: node,
					message: '`t.end()` should only be used inside of `test.cb()`.'
				});
			}
		})
	});
};
