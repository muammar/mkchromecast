'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var methods = [
	'end',
	'pass',
	'fail',
	'truthy',
	'falsy',
	'true',
	'false',
	'is',
	'not',
	'deepEqual',
	'notDeepEqual',
	'throws',
	'notThrows',
	'regex',
	'notRegex',
	'ifError',
	'plan'
];

function isMethod(name) {
	return methods.indexOf(name) !== -1;
}

function getMembers(node) {
	var name = node.property.name;

	if (node.object.type === 'MemberExpression') {
		return getMembers(node.object).concat(name);
	}

	return [name];
}

function isCallExpression(node) {
	return node.parent.type === 'CallExpression' &&
		node.parent.callee === node;
}

function getMemberStats(members) {
	var initial = {
		skip: [],
		method: [],
		other: []
	};

	return members.reduce(function (res, member) {
		if (member === 'skip') {
			res.skip.push(member);
		} else if (isMethod(member)) {
			res.method.push(member);
		} else {
			res.other.push(member);
		}

		return res;
	}, initial);
}

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(function (node) {
			if (node.callee.type !== 'MemberExpression' &&
					node.callee.name === 't') {
				context.report({
					node: node,
					message: '`t` is not a function.'
				});
			}
		}),
		MemberExpression: ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(function (node) {
			if (node.parent.type === 'MemberExpression' ||
					util.nameOfRootObject(node) !== 't') {
				return;
			}

			var members = getMembers(node);
			var stats = getMemberStats(members);

			if (members[0] === 'context') {
				// anything is fine when of the form `t.context...`
				if (members.length === 1 && isCallExpression(node)) {
					// except `t.context()`
					context.report({
						node: node,
						message: 'Unknown assertion method `context`.'
					});
				}

				return;
			}

			if (isCallExpression(node)) {
				if (stats.other.length > 0) {
					context.report({
						node: node,
						message: 'Unknown assertion method `' + stats.other[0] + '`.'
					});
				} else if (stats.skip.length > 1) {
					context.report({
						node: node,
						message: 'Too many chained uses of `skip`.'
					});
				} else if (stats.method.length > 1) {
					context.report({
						node: node,
						message: 'Can\'t chain assertion methods.'
					});
				} else if (stats.method.length === 0) {
					context.report({
						node: node,
						message: 'Missing assertion method.'
					});
				}
			} else if (stats.other.length > 0) {
				context.report({
					node: node,
					message: 'Unknown member `' + stats.other[0] + '`. Use `context.' + stats.other[0] + '` instead.'
				});
			}
		})
	});
};
