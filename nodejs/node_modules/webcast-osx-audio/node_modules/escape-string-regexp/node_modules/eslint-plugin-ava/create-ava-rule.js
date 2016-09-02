'use strict';
var espurify = require('espurify');
var assign = require('object-assign');
var rest = require('lodash.rest');
var deepStrictEqual = require('deep-strict-equal');

var avaImportDeclarationAst = {
	type: 'ImportDeclaration',
	specifiers: [
		{
			type: 'ImportDefaultSpecifier',
			local: {
				type: 'Identifier',
				name: 'test'
			}
		}
	],
	source: {
		type: 'Literal',
		value: 'ava'
	}
};

var avaVariableDeclaratorAst = {
	type: 'VariableDeclarator',
	id: {
		type: 'Identifier',
		name: 'test'
	},
	init: {
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
	}
};

function isTestFunctionCall(node) {
	if (node.type === 'Identifier') {
		return node.name === 'test';
	} else if (node.type === 'MemberExpression') {
		return isTestFunctionCall(node.object);
	}

	return false;
}

function hasTestModifier(node, mod) {
	if (node.type === 'CallExpression') {
		return hasTestModifier(node.callee, mod);
	} else if (node.type === 'MemberExpression') {
		if (node.property.type === 'Identifier' && node.property.name === mod) {
			return true;
		}
		return hasTestModifier(node.object, mod);
	}
	return false;
}

module.exports = function createAvaRule() {
	var isTestFile = false;
	var currentTestNode = null;

	/* eslint quote-props: [2, "as-needed"] */
	var predefinedRules = {
		ImportDeclaration: function (node) {
			if (!isTestFile && deepStrictEqual(espurify(node), avaImportDeclarationAst)) {
				isTestFile = true;
			}
		},
		VariableDeclarator: function (node) {
			if (!isTestFile && deepStrictEqual(espurify(node), avaVariableDeclaratorAst)) {
				isTestFile = true;
			}
		},
		CallExpression: function (node) {
			if (!currentTestNode) {
				if (isTestFunctionCall(node.callee)) {
					// entering test function
					currentTestNode = node;
				}
			}
		},
		'CallExpression:exit': function (node) {
			if (currentTestNode === node) {
				// leaving test function
				currentTestNode = null;
			}
		},
		'Program:exit': function () {
			isTestFile = false;
		}
	};

	var rule = {
		hasTestModifier: function (mod) {
			return hasTestModifier(currentTestNode, mod);
		},
		hasNoHookModifier: function () {
			return !hasTestModifier(currentTestNode, 'before') &&
				!hasTestModifier(currentTestNode, 'beforeEach') &&
				!hasTestModifier(currentTestNode, 'after') &&
				!hasTestModifier(currentTestNode, 'afterEach');
		},
		merge: function (customHandlers) {
			Object.keys(predefinedRules).forEach(function (key) {
				var predef = predefinedRules[key];

				if (typeof customHandlers[key] === 'function') {
					predefinedRules[key] = function (node) {
						if (/:exit$/.test(key)) {
							customHandlers[key](node);
							predef(node); // append predefined rules on exit
						} else {
							predef(node); // prepend predefined rules on enter
							customHandlers[key](node);
						}
					};
				}
			});

			return assign({}, customHandlers, predefinedRules);
		}
	};

	rule.isInTestFile = function () {
		return isTestFile;
	};

	rule.isTestNode = function (node) {
		return currentTestNode === node;
	};

	rule.isInTestNode = function () {
		return currentTestNode;
	};

	rule.if = rest(function (predicates) {
		return function (visitor) {
			return function (node) {
				var isValid = predicates.every(function (fn) {
					return fn(node);
				});
				if (isValid) {
					return visitor(node);
				}
			};
		};
	});

	return rule;
};
