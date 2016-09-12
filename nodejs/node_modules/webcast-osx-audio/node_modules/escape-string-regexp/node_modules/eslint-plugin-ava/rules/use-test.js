'use strict';
var espurify = require('espurify');
var deepStrictEqual = require('deep-strict-equal');

var avaVariableDeclaratorInitAst = {
	type: 'CallExpression',
	callee: {
		type: 'Identifier',
		name: 'require'
	},
	arguments: [
		{
			type: 'Literal',
			value: 'ava'
		}
	]
};

function report(context, node) {
	context.report({
		node: node,
		message: 'AVA should be imported as `test`.'
	});
}

module.exports = function (context) {
	return {
		ImportDeclaration: function (node) {
			if (node.source.value === 'ava' && node.specifiers[0].local.name !== 'test') {
				report(context, node);
			}
		},
		VariableDeclarator: function (node) {
			if (node.id.name !== 'test' && node.init && deepStrictEqual(espurify(node.init), avaVariableDeclaratorInitAst)) {
				report(context, node);
			}
		}
	};
};
