'use strict';
var path = require('path');
var fs = require('graceful-fs');
var writeFileAtomic = require('write-file-atomic');
var sortKeys = require('sort-keys');
var objectAssign = require('object-assign');
var mkdirp = require('mkdirp');
var Promise = require('pinkie-promise');
var pify = require('pify');

function main(fn, fp, data, opts) {
	if (!fp) {
		throw new TypeError('Expected a filepath');
	}

	if (data === undefined) {
		throw new TypeError('Expected data to stringify');
	}

	opts = objectAssign({
		indent: '\t',
		sortKeys: false
	}, opts);

	if (opts.sortKeys) {
		data = sortKeys(data, {
			deep: true,
			compare: typeof opts.sortKeys === 'function' && opts.sortKeys
		});
	}

	var json = JSON.stringify(data, opts.replacer, opts.indent) + '\n';

	return fn(fp, json, {mode: opts.mode});
}

module.exports = function (fp, data, opts) {
	return pify(mkdirp, Promise)(path.dirname(fp), {fs: fs}).then(function () {
		return main(pify(writeFileAtomic, Promise), fp, data, opts);
	});
};

module.exports.sync = function (fp, data, opts) {
	mkdirp.sync(path.dirname(fp), {fs: fs});
	main(writeFileAtomic.sync, fp, data, opts);
};
