'use strict';

module.exports = function () {
	var lastLine = [''];

	function update(str) {
		var idx = str.lastIndexOf('\n');
		if (idx === -1) {
			lastLine.push(str);
		} else {
			lastLine = [str.substring(idx + 1)];
		}
	}

	function getLastLine() {
		if (lastLine.length > 1) {
			lastLine = [lastLine.join('')];
		}
		return lastLine[0];
	}

	return {
		update: update,
		lastLine: getLastLine
	};
};
