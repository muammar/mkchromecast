'use strict';
var resolveFrom = require('resolve-from');

module.exports = function (moduleId) {
	return resolveFrom('.', moduleId);
};
