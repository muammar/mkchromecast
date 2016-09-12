'use strict';
var path = require('path');

module.exports = {
	extends: path.join(__dirname, 'index.js'),
	env: {
		node: false,
		browser: true
	}
};
