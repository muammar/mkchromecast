'use strict';
module.exports = function (input, exclude) {
	if (!Array.isArray(input)) {
		return [];
	}

	return input.filter(function (x) {
		return exclude.indexOf(x) === -1;
	});
};
