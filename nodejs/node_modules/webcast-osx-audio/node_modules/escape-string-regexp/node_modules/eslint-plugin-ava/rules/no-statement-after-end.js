'use strict';
var createAvaRule = require('../create-ava-rule');

// This rule makes heavy use of eslints code path analysis
// See: http://eslint.org/docs/developer-guide/code-path-analysis.html

function isEndExpression(node) {
	// returns true if this node represents a call to `t.end(...)`
	return (
		node.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		node.callee.object.type === 'Identifier' &&
		node.callee.object.name === 't' &&
		node.callee.property.type === 'Identifier' &&
		node.callee.property.name === 'end'
	);
}

module.exports = function (context) {
	var ava = createAvaRule();
	var segmentInfoMap = Object.create(null);
	var segmentInfoStack = [];
	var currentSegmentInfo = null;

	function segmentStart(segment) {
		// A new CodePathSegment has started, create an "info" object to track this segments state.
		segmentInfoStack.push(currentSegmentInfo);

		currentSegmentInfo = {
			ended: false,
			prev: segment.prevSegments.map(function (prevSegment) {
				return segmentInfoMap[prevSegment.id];
			})
		};

		segmentInfoMap[segment.id] = currentSegmentInfo;
	}

	function segmentEnd() {
		currentSegmentInfo = segmentInfoStack.pop();
	}

	function checkForEndExpression(node) {
		if (isEndExpression(node)) {
			currentSegmentInfo.ended = true;
		}
	}

	function isEnded(info) {
		return info.ended;
	}

	function checkStatement(node) {
		if (!ava.isInTestFile()) {
			return;
		}

		var ended = [currentSegmentInfo].concat(currentSegmentInfo.prev).filter(isEnded);

		// If this segment or any previous segment is already ended, further statements are not allowed, report as an error.
		if (ended.length) {
			ended.forEach(function (info) {
				// unset ended state to avoid generating lots of errors
				info.ended = false;
			});

			context.report({
				node: node,
				message: 'No statements following a call to `t.end()`.'
			});
		}
	}

	return ava.merge({
		ExpressionStatement: checkStatement,
		WithStatement: checkStatement,
		IfStatement: checkStatement,
		SwitchStatement: checkStatement,
		ThrowStatement: checkStatement,
		TryStatement: checkStatement,
		WhileStatement: checkStatement,
		DoWhileStatement: checkStatement,
		ForStatement: checkStatement,
		ForInStatement: checkStatement,
		ForOfStatement: checkStatement,
		ReturnStatement: function (node) {
			// empty return statements are OK even after `t.end`,
			// only check it if there is an argument
			if (node.argument) {
				checkStatement(node);
			}
		},
		onCodePathSegmentStart: segmentStart,
		onCodePathSegmentEnd: segmentEnd,
		CallExpression: checkForEndExpression
	});
};
