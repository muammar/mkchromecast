'use strict';
module.exports = install;

function install(precompile, ext, extensions) {
	ext = ext || '.js';
	extensions = extensions || require.extensions;

	var oldExtension = extensions[ext];

	extensions[ext] = function (module, filename) {
		var source = precompile(filename);
		if (source) {
			module._compile(source, filename);
			return;
		}
		oldExtension(module, filename);
	};
}
