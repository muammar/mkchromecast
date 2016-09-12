'use strict';
var osTmpdir = require('os-tmpdir');
var uid2 = require('uid2');
var mkdirp = require('mkdirp');
var path = require('path');

module.exports = function (options) {
	options = options || {};
	var uniqueDir = path.join(osTmpdir(), uid2(options.length || 20));
	if (options.create) {
		mkdirp.sync(uniqueDir);
	}
	if (options.thunk) {
		return thunk(uniqueDir);
	}
	return uniqueDir;
};

function thunk(uniquedir) {
	return function () {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(uniquedir);
		return path.join.apply(path, args);
	};
}
