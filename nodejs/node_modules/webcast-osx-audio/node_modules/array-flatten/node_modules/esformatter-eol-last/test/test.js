var assert = require('assert');
var eolFormatter = require('../');

describe('EOL-last formatter', function() {
	it('adds newline at end of input', function() {
		//Given.
		var input = 'Hi!';
		var expectedOutput = 'Hi!\n';

		//When
		var formatterOutput = eolFormatter.stringAfter(input);

		//Then
		assert(formatterOutput, expectedOutput);
	});

	it('does not add newline at end of input with a newline', function() {
		//Given.
		var input = 'Hi!\n';

		//When
		var formatterOutput = eolFormatter.stringAfter(input);

		//Then
		assert(formatterOutput, input);
	});
})
