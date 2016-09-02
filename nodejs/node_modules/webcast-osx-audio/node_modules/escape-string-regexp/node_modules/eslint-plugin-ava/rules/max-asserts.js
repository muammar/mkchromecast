'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var notAssertionMethods = ['plan', 'end'];

module.exports = function (context) {
	var ava = createAvaRule();
	var maxAssertions = context.options[0] || 5;
	var assertionCount = 0;
	var nodeToReport = null;

	return ava.merge({
		'CallExpression': ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(function (node) {
			var callee = node.callee;
			if (callee.type !== 'MemberExpression') {
				return;
			}

			if (callee.property &&
					notAssertionMethods.indexOf(callee.property.name) === -1 &&
					util.nameOfRootObject(callee) === 't') {
				assertionCount++;

				if (assertionCount === maxAssertions + 1) {
					nodeToReport = node;
				}
			}
		}),
		'CallExpression:exit': ava.if(ava.isTestNode)(function () {
			// leaving test function
			if (assertionCount > maxAssertions) {
				context.report({
					node: nodeToReport,
					message: 'Expected at most ' + maxAssertions + ' assertions, but found ' + assertionCount + '.'
				});
			}

			assertionCount = 0;
			nodeToReport = null;
		})
	});
};

module.exports.schema = [{
	type: 'integer'
}];
