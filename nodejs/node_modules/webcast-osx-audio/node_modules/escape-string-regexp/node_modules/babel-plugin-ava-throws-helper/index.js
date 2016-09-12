'use strict';
var t = require('babel-types');
var template = require('babel-template');

var wrapWithHelper = template([
	'HELPER_ID(function () {',
	'  return EXP;',
	'}, {',
	'  line: LINE,',
	'  column: COLUMN,',
	'  source: SOURCE,',
	'  filename: FILE',
	'});'
].join('\n'));

var buildHelper = template([
	'function HELPER_ID(fn, data) {',
	'  try {',
	'    return fn();',
	'  } catch (e) {',
	'    var type = typeof e;',
	'    if (e !== null && (type === "object" || type === "function")) {',
	'      try {',
	'        Object.defineProperty(e, "_avaThrowsHelperData", {',
	'          value: data',
	'        });',
	'      } catch (e) {}',
	'    }',
	'    throw e;',
	'  }',
	'}'
].join('\n'));

var assertionVisitor = {
	CallExpression: function (path, state) {
		if (isThrowsMember(path.get('callee'))) {
			var arg0 = path.node.arguments[0];

			if (!(arg0 && arg0.loc && (typeof arg0.start === 'number') && (typeof arg0.end === 'number'))) {
				return;
			}

			path.node.arguments[0] = wrapWithHelper({
				HELPER_ID: t.identifier(this.avaThrowHelper()),
				EXP: arg0,
				LINE: t.numericLiteral(arg0.loc.start.line),
				COLUMN: t.numericLiteral(arg0.loc.start.column),
				SOURCE: t.stringLiteral(state.file.code.substring(arg0.start, arg0.end)),
				FILE: t.stringLiteral(state.file.opts.filename)
			}).expression;
		}
	}
};

module.exports = function () {
	return {
		visitor: {
			Program: function (path, state) {
				var HELPER_ID = path.scope.generateUid('avaThrowsHelper');
				var created = false;

				path.traverse(assertionVisitor, {
					avaThrowHelper: function () {
						if (!created) {
							created = true;
							path.unshiftContainer('body', buildHelper({
								HELPER_ID: t.identifier(HELPER_ID)
							}));
						}

						return HELPER_ID;
					},
					file: state.file
				});
			}
		}
	};
};

function isThrowsMember(path) {
	return path.isMemberExpression() && path.get('object').isIdentifier({name: 't'}) && (
			path.get('property').isIdentifier({name: 'throws'}) ||
			path.get('property').isIdentifier({name: 'notThrows'})
		);
}
