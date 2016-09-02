'use strict';
var path = require('path');
var writeJsonFile = require('write-json-file');
var opts = {indent: 2};

module.exports = function (fp, data) {
	if (typeof fp !== 'string') {
		data = fp;
		fp = '.';
	}

	fp = path.basename(fp) === 'package.json' ? fp : path.join(fp, 'package.json');

	return writeJsonFile(fp, data, opts);
};

module.exports.sync = function (fp, data) {
	if (typeof fp !== 'string') {
		data = fp;
		fp = '.';
	}

	fp = path.basename(fp) === 'package.json' ? fp : path.join(fp, 'package.json');

	writeJsonFile.sync(fp, data, opts);
};
