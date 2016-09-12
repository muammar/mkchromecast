'use strict';

var fs = require('fs');

exports.nameOfRootObject = function (node) {
	if (node.object.type === 'MemberExpression') {
		return exports.nameOfRootObject(node.object);
	}

	return node.object.name;
};

exports.isInContext = function (node) {
	if (node.object.type === 'MemberExpression') {
		return exports.isInContext(node.object);
	}

	return node.property.name === 'context';
};

exports.getAvaConfig = function (filepath) {
	var defaultResult = {};
	if (!filepath) {
		return defaultResult;
	}

	try {
		var packageContent = JSON.parse(fs.readFileSync(filepath, 'utf8'));
		return packageContent && packageContent.ava || defaultResult;
	} catch (e) {
		return defaultResult;
	}
};
