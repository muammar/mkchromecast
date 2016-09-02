'use strict';

module.exports.tokenBefore = function(token) {
	if (token.type === 'LineComment' && token.value.match(/^\S/)) {
		token.raw = '// ' + token.value;
	}
};
