'use strict';
var path = require('path');
var arrify = require('arrify');
var pkgUp = require('pkg-up');
var multimatch = require('multimatch');
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var defaultFiles = [
	'test.js',
	'test-*.js',
	'test/**/*.js',
	'**/__tests__/**/*.js',
	'**/*.test.js'
];

var excludedFolders = [
	'**/fixtures/**',
	'**/helpers/**'
];

function isIgnored(rootDir, files, filepath) {
	var relativeFilePath = path.relative(rootDir, filepath);

	if (multimatch([relativeFilePath], excludedFolders).length !== 0) {
		return 'Test file is ignored because it is in `' + excludedFolders.join(' ') + '`.';
	}

	if (multimatch([relativeFilePath], files).length === 0) {
		return 'Test file is ignored because it is not in `' + files.join(' ') + '`.';
	}

	return null;
}

function getPackageInfo() {
	var packageFilePath = pkgUp.sync();

	return {
		rootDir: packageFilePath && path.dirname(packageFilePath),
		files: util.getAvaConfig(packageFilePath).files
	};
}

module.exports = function (context) {
	var filename = context.getFilename();
	if (filename === '<text>') {
		return {};
	}

	var ava = createAvaRule();
	var packageInfo = getPackageInfo();
	var options = context.options[0] || {};
	var files = arrify(options.files || packageInfo.files || defaultFiles);
	var hasTestCall = false;

	if (!packageInfo.rootDir) {
		// Could not find a package.json folder
		return {};
	}

	return ava.merge({
		'CallExpression': ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(function () {
			hasTestCall = true;
		}),
		'Program:exit': function (node) {
			if (!hasTestCall) {
				return;
			}

			var ignoredReason = isIgnored(packageInfo.rootDir, files, filename);

			if (ignoredReason) {
				context.report({
					node: node,
					message: ignoredReason
				});
			}

			hasTestCall = false;
		}
	});
};

module.exports.schema = [{
	type: 'object',
	properties: {
		files: {
			anyOf: [
				{type: 'array'},
				{type: 'string'}
			]
		}
	}
}];
