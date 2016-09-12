
/**
 * Only apply the global .js require() hook if:
 *
 *   1) ES6 Generators are not already supported in the environment
 *   2) The require.extensions['.js'] hook is not already patched by gnode
 */

if (!hasNativeGenerators() && !isPatchedByGnode()) {

  /**
   * Module dependencies.
   */

  var fs = require('fs');
  var regenerator = require('regenerator');
  var genFunExp = /\bfunction\s*\*/;

  /**
   * First include the regenerator runtime. It gets installed gloablly as
   * `regeneratorRuntime`, so we just need to make sure that global
   * function is available.
   */

  regenerator.runtime();

  /**
   * Entry point for node versions that don't have Generator support.
   *
   * This file replaces the default `.js` require.extensions implementation with
   * one that first compiles the JavaScript code via "facebook/regenerator".
   *
   * Once that is in place then it loads the original entry point .js file.
   */

  require.extensions['.js'] = gnodeJsExtensionCompiler;
}

/**
 * ES6 Generators enabled `require.extensions['.js']` hook.
 *
 * @api public
 */

function gnodeJsExtensionCompiler (module, filename) {
  var content = fs.readFileSync(filename, 'utf8');

  // remove the Byte Order Marker if present
  content = stripBOM(content);

  // strip away the shebang if present
  content = stripShebang(content);

  if (genFunExp.test(content) && !isValid(content)) {
    // compile JS via facebook/regenerator
    content = regenerator.compile(content, {
      includeRuntime: 'object' !== typeof regeneratorRuntime
    }).code;
  }

  module._compile(content, filename);
}

function isValid(content) {
  try {
    Function('', content);
    return true;
  } catch (ex) {
    return false;
  }
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 * because the buffer-to-string conversion in `fs.readFileSync()`
 * translates it to FEFF, the UTF-16 BOM.
 *
 * Copied directly from joyent/node's lib/module.js
 *
 * @api private
 */

function stripBOM (content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

/**
 * Strips away the "shebang" from the source file if present.
 *
 * Copied directly from joyent/node's lib/module.js
 *
 * @api private
 */

function stripShebang (content) {
  return content.replace(/^\#\!.*/, '');
}

/**
 * Tests if the environment supports ES6 Generators.
 *
 * @api private
 */

function hasNativeGenerators () {
  var has = false;
  try {
    eval('(function*(){})');
    has = true;
  } catch (e) {
  }
  return has;
}

/**
 * Check if require.extensions['.js'] is already patched by gnode
 *
 * @api private
 */

function isPatchedByGnode () {
  return 'gnodeJsExtensionCompiler' == require.extensions['.js'].name;
}
