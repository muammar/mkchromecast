'use strict';

require('string.prototype.endswith');

exports.stringAfter = function(formattedString) {
	if (formattedString.endsWith('\n')) {
		return formattedString;
	}

	return formattedString + '\n';
};
