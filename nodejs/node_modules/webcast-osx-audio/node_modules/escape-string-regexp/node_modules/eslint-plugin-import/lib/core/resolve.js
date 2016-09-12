'use strict';

exports.__esModule = true;
exports.CASE_SENSITIVE_FS = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.relative = relative;
exports.default = resolve;

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _es6Set = require('es6-set');

var _es6Set2 = _interopRequireDefault(_es6Set);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _pkgDir = require('pkg-dir');

var _pkgDir2 = _interopRequireDefault(_pkgDir);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _crypto = require('crypto');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CASE_SENSITIVE_FS = exports.CASE_SENSITIVE_FS = !_fs2.default.existsSync(path.join(__dirname, 'reSOLVE.js'));

var fileExistsCache = new _es6Map2.default();

function cachePath(cacheKey, result) {
  fileExistsCache.set(cacheKey, { result: result, lastSeen: Date.now() });
}

function checkCache(cacheKey, _ref) {
  var lifetime = _ref.lifetime;

  if (fileExistsCache.has(cacheKey)) {
    var _fileExistsCache$get = fileExistsCache.get(cacheKey);

    var result = _fileExistsCache$get.result;
    var lastSeen = _fileExistsCache$get.lastSeen;
    // check fresness

    if (Date.now() - lastSeen < lifetime * 1000) return result;
  }
  // cache miss
  return undefined;
}

// http://stackoverflow.com/a/27382838
function fileExistsWithCaseSync(filepath, cacheSettings) {
  // don't care if the FS is case-sensitive
  if (CASE_SENSITIVE_FS) return true;

  // null means it resolved to a builtin
  if (filepath === null) return true;

  var dir = path.dirname(filepath);

  var result = checkCache(filepath, cacheSettings);
  if (result != null) return result;

  // base case
  if (dir === '/' || dir === '.' || /^[A-Z]:\\$/i.test(dir)) {
    result = true;
  } else {
    var filenames = _fs2.default.readdirSync(dir);
    if (filenames.indexOf(path.basename(filepath)) === -1) {
      result = false;
    } else {
      result = fileExistsWithCaseSync(dir, cacheSettings);
    }
  }
  cachePath(filepath, result);
  return result;
}

function relative(modulePath, sourceFile, settings) {
  return fullResolve(modulePath, sourceFile, settings).path;
}

function fullResolve(modulePath, sourceFile, settings) {
  // check if this is a bonus core module
  var coreSet = new _es6Set2.default(settings['import/core-modules']);
  if (coreSet != null && coreSet.has(modulePath)) return { found: true, path: null };

  var sourceDir = path.dirname(sourceFile),
      cacheKey = sourceDir + hashObject(settings) + modulePath;

  var cacheSettings = (0, _objectAssign2.default)({
    lifetime: 30 }, settings['import/cache']);

  // parse infinity
  if (cacheSettings.lifetime === '∞' || cacheSettings.lifetime === 'Infinity') {
    cacheSettings.lifetime = Infinity;
  }

  var cachedPath = checkCache(cacheKey, cacheSettings);
  if (cachedPath !== undefined) return { found: true, path: cachedPath };

  function cache(resolvedPath) {
    cachePath(cacheKey, resolvedPath);
  }

  function withResolver(resolver, config) {

    function v1() {
      try {
        var _resolved = resolver.resolveImport(modulePath, sourceFile, config);
        if (_resolved === undefined) return { found: false };
        return { found: true, path: _resolved };
      } catch (err) {
        return { found: false };
      }
    }

    function v2() {
      return resolver.resolve(modulePath, sourceFile, config);
    }

    switch (resolver.interfaceVersion) {
      case 2:
        return v2();

      default:
      case 1:
        return v1();
    }
  }

  var configResolvers = settings['import/resolver'] || { 'node': settings['import/resolve'] }; // backward compatibility

  var resolvers = resolverReducer(configResolvers, new _es6Map2.default());

  var resolved = { found: false };
  resolvers.forEach(function (config, name) {
    if (!resolved.found) {
      var resolver = requireResolver(name, sourceFile);
      resolved = withResolver(resolver, config);
      if (resolved.found) {
        // resolvers imply file existence, this double-check just ensures the case matches
        if (fileExistsWithCaseSync(resolved.path, cacheSettings)) {
          // else, counts
          cache(resolved.path);
        } else {
          resolved = { found: false };
        }
      }
    }
  });

  return resolved;
}

function resolverReducer(resolvers, map) {
  if (resolvers instanceof Array) {
    resolvers.forEach(function (r) {
      return resolverReducer(r, map);
    });
    return map;
  }

  if (typeof resolvers === 'string') {
    map.set(resolvers, null);
    return map;
  }

  if ((typeof resolvers === 'undefined' ? 'undefined' : _typeof(resolvers)) === 'object') {
    for (var key in resolvers) {
      map.set(key, resolvers[key]);
    }
    return map;
  }

  throw new Error('invalid resolver config');
}

function requireResolver(name, sourceFile) {
  // Try to resolve package with conventional name
  try {
    return require('eslint-import-resolver-' + name);
  } catch (err) {} /* continue */

  // Try to resolve package with custom name (@myorg/resolver-name)
  try {
    return require(name);
  } catch (err) {} /* continue */

  // Try to resolve package with path, relative to closest package.json
  // or current working directory
  try {
    var baseDir = _pkgDir2.default.sync(sourceFile) || process.cwd();
    // absolute paths ignore base, so this covers both
    return require(path.resolve(baseDir, name));
  } catch (err) {} /* continue */

  // all else failed
  throw new Error('unable to load resolver "' + name + '".');
}

var erroredContexts = new _es6Set2.default();

/**
 * Given
 * @param  {string} p - module path
 * @param  {object} context - ESLint context
 * @return {string} - the full module filesystem path;
 *                    null if package is core;
 *                    undefined if not found
 */
function resolve(p, context) {
  try {
    return relative(p, context.getFilename(), context.settings);
  } catch (err) {
    if (!erroredContexts.has(context)) {
      context.report({
        message: 'Resolve error: ' + err.message,
        loc: { line: 1, col: 0 }
      });
      erroredContexts.add(context);
    }
  }
}
resolve.relative = relative;

function hashObject(object) {
  var settingsShasum = (0, _crypto.createHash)('sha1');
  settingsShasum.update(JSON.stringify(object));
  return settingsShasum.digest('hex');
}
//# sourceMappingURL=data:application/json;base64,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QjtBQUMxQixNQUFNLGlCQUFpQix3QkFBVyxNQUFYLENBQXZCO0FBQ0EsaUJBQWUsTUFBZixDQUFzQixLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXRCO0FBQ0EsU0FBTyxlQUFlLE1BQWYsQ0FBc0IsS0FBdEIsQ0FBUDtBQUNEIiwiZmlsZSI6ImNvcmUvcmVzb2x2ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBNYXAgZnJvbSAnZXM2LW1hcCdcbmltcG9ydCBTZXQgZnJvbSAnZXM2LXNldCdcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbidcbmltcG9ydCBwa2dEaXIgZnJvbSAncGtnLWRpcidcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJ1xuXG5leHBvcnQgY29uc3QgQ0FTRV9TRU5TSVRJVkVfRlMgPSAhZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAncmVTT0xWRS5qcycpKVxuXG5jb25zdCBmaWxlRXhpc3RzQ2FjaGUgPSBuZXcgTWFwKClcblxuZnVuY3Rpb24gY2FjaGVQYXRoKGNhY2hlS2V5LCByZXN1bHQpIHtcbiAgZmlsZUV4aXN0c0NhY2hlLnNldChjYWNoZUtleSwgeyByZXN1bHQsIGxhc3RTZWVuOiBEYXRlLm5vdygpIH0pXG59XG5cbmZ1bmN0aW9uIGNoZWNrQ2FjaGUoY2FjaGVLZXksIHsgbGlmZXRpbWUgfSkge1xuICBpZiAoZmlsZUV4aXN0c0NhY2hlLmhhcyhjYWNoZUtleSkpIHtcbiAgICBjb25zdCB7IHJlc3VsdCwgbGFzdFNlZW4gfSA9IGZpbGVFeGlzdHNDYWNoZS5nZXQoY2FjaGVLZXkpXG4gICAgLy8gY2hlY2sgZnJlc25lc3NcbiAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3RTZWVuIDwgKGxpZmV0aW1lICogMTAwMCkpIHJldHVybiByZXN1bHRcbiAgfVxuICAvLyBjYWNoZSBtaXNzXG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjczODI4MzhcbmZ1bmN0aW9uIGZpbGVFeGlzdHNXaXRoQ2FzZVN5bmMoZmlsZXBhdGgsIGNhY2hlU2V0dGluZ3MpIHtcbiAgLy8gZG9uJ3QgY2FyZSBpZiB0aGUgRlMgaXMgY2FzZS1zZW5zaXRpdmVcbiAgaWYgKENBU0VfU0VOU0lUSVZFX0ZTKSByZXR1cm4gdHJ1ZVxuXG4gIC8vIG51bGwgbWVhbnMgaXQgcmVzb2x2ZWQgdG8gYSBidWlsdGluXG4gIGlmIChmaWxlcGF0aCA9PT0gbnVsbCkgcmV0dXJuIHRydWVcblxuICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUoZmlsZXBhdGgpXG5cbiAgbGV0IHJlc3VsdCA9IGNoZWNrQ2FjaGUoZmlsZXBhdGgsIGNhY2hlU2V0dGluZ3MpXG4gIGlmIChyZXN1bHQgIT0gbnVsbCkgcmV0dXJuIHJlc3VsdFxuXG4gIC8vIGJhc2UgY2FzZVxuICBpZiAoZGlyID09PSAnLycgfHwgZGlyID09PSAnLicgfHwgL15bQS1aXTpcXFxcJC9pLnRlc3QoZGlyKSkge1xuICAgIHJlc3VsdCA9IHRydWVcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBmaWxlbmFtZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpXG4gICAgaWYgKGZpbGVuYW1lcy5pbmRleE9mKHBhdGguYmFzZW5hbWUoZmlsZXBhdGgpKSA9PT0gLTEpIHtcbiAgICAgIHJlc3VsdCA9IGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IGZpbGVFeGlzdHNXaXRoQ2FzZVN5bmMoZGlyLCBjYWNoZVNldHRpbmdzKVxuICAgIH1cbiAgfVxuICBjYWNoZVBhdGgoZmlsZXBhdGgsIHJlc3VsdClcbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVsYXRpdmUobW9kdWxlUGF0aCwgc291cmNlRmlsZSwgc2V0dGluZ3MpIHtcbiAgcmV0dXJuIGZ1bGxSZXNvbHZlKG1vZHVsZVBhdGgsIHNvdXJjZUZpbGUsIHNldHRpbmdzKS5wYXRoXG59XG5cbmZ1bmN0aW9uIGZ1bGxSZXNvbHZlKG1vZHVsZVBhdGgsIHNvdXJjZUZpbGUsIHNldHRpbmdzKSB7XG4gIC8vIGNoZWNrIGlmIHRoaXMgaXMgYSBib251cyBjb3JlIG1vZHVsZVxuICBjb25zdCBjb3JlU2V0ID0gbmV3IFNldChzZXR0aW5nc1snaW1wb3J0L2NvcmUtbW9kdWxlcyddKVxuICBpZiAoY29yZVNldCAhPSBudWxsICYmIGNvcmVTZXQuaGFzKG1vZHVsZVBhdGgpKSByZXR1cm4geyBmb3VuZDogdHJ1ZSwgcGF0aDogbnVsbCB9XG5cbiAgY29uc3Qgc291cmNlRGlyID0gcGF0aC5kaXJuYW1lKHNvdXJjZUZpbGUpXG4gICAgICAsIGNhY2hlS2V5ID0gc291cmNlRGlyICsgaGFzaE9iamVjdChzZXR0aW5ncykgKyBtb2R1bGVQYXRoXG5cbiAgY29uc3QgY2FjaGVTZXR0aW5ncyA9IGFzc2lnbih7XG4gICAgbGlmZXRpbWU6IDMwLCAgLy8gc2Vjb25kc1xuICB9LCBzZXR0aW5nc1snaW1wb3J0L2NhY2hlJ10pXG5cbiAgLy8gcGFyc2UgaW5maW5pdHlcbiAgaWYgKGNhY2hlU2V0dGluZ3MubGlmZXRpbWUgPT09ICfiiJ4nIHx8IGNhY2hlU2V0dGluZ3MubGlmZXRpbWUgPT09ICdJbmZpbml0eScpIHtcbiAgICBjYWNoZVNldHRpbmdzLmxpZmV0aW1lID0gSW5maW5pdHlcbiAgfVxuXG4gIGNvbnN0IGNhY2hlZFBhdGggPSBjaGVja0NhY2hlKGNhY2hlS2V5LCBjYWNoZVNldHRpbmdzKVxuICBpZiAoY2FjaGVkUGF0aCAhPT0gdW5kZWZpbmVkKSByZXR1cm4geyBmb3VuZDogdHJ1ZSwgcGF0aDogY2FjaGVkUGF0aCB9XG5cbiAgZnVuY3Rpb24gY2FjaGUocmVzb2x2ZWRQYXRoKSB7XG4gICAgY2FjaGVQYXRoKGNhY2hlS2V5LCByZXNvbHZlZFBhdGgpXG4gIH1cblxuICBmdW5jdGlvbiB3aXRoUmVzb2x2ZXIocmVzb2x2ZXIsIGNvbmZpZykge1xuXG4gICAgZnVuY3Rpb24gdjEoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVyLnJlc29sdmVJbXBvcnQobW9kdWxlUGF0aCwgc291cmNlRmlsZSwgY29uZmlnKVxuICAgICAgICBpZiAocmVzb2x2ZWQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHsgZm91bmQ6IGZhbHNlIH1cbiAgICAgICAgcmV0dXJuIHsgZm91bmQ6IHRydWUsIHBhdGg6IHJlc29sdmVkIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4geyBmb3VuZDogZmFsc2UgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHYyKCkge1xuICAgICAgcmV0dXJuIHJlc29sdmVyLnJlc29sdmUobW9kdWxlUGF0aCwgc291cmNlRmlsZSwgY29uZmlnKVxuICAgIH1cblxuICAgIHN3aXRjaCAocmVzb2x2ZXIuaW50ZXJmYWNlVmVyc2lvbikge1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gdjIoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdjEoKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNvbmZpZ1Jlc29sdmVycyA9IChzZXR0aW5nc1snaW1wb3J0L3Jlc29sdmVyJ11cbiAgICB8fCB7ICdub2RlJzogc2V0dGluZ3NbJ2ltcG9ydC9yZXNvbHZlJ10gfSkgLy8gYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuXG4gIGNvbnN0IHJlc29sdmVycyA9IHJlc29sdmVyUmVkdWNlcihjb25maWdSZXNvbHZlcnMsIG5ldyBNYXAoKSlcblxuICBsZXQgcmVzb2x2ZWQgPSB7IGZvdW5kOiBmYWxzZSB9XG4gIHJlc29sdmVycy5mb3JFYWNoKGZ1bmN0aW9uIChjb25maWcsIG5hbWUpICB7XG4gICAgaWYgKCFyZXNvbHZlZC5mb3VuZCkge1xuICAgICAgY29uc3QgcmVzb2x2ZXIgPSByZXF1aXJlUmVzb2x2ZXIobmFtZSwgc291cmNlRmlsZSlcbiAgICAgIHJlc29sdmVkID0gd2l0aFJlc29sdmVyKHJlc29sdmVyLCBjb25maWcpXG4gICAgICBpZiAocmVzb2x2ZWQuZm91bmQpIHtcbiAgICAgICAgLy8gcmVzb2x2ZXJzIGltcGx5IGZpbGUgZXhpc3RlbmNlLCB0aGlzIGRvdWJsZS1jaGVjayBqdXN0IGVuc3VyZXMgdGhlIGNhc2UgbWF0Y2hlc1xuICAgICAgICBpZiAoZmlsZUV4aXN0c1dpdGhDYXNlU3luYyhyZXNvbHZlZC5wYXRoLCBjYWNoZVNldHRpbmdzKSkge1xuICAgICAgICAgIC8vIGVsc2UsIGNvdW50c1xuICAgICAgICAgIGNhY2hlKHJlc29sdmVkLnBhdGgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZWQgPSB7IGZvdW5kOiBmYWxzZSB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHJlc29sdmVkXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVyUmVkdWNlcihyZXNvbHZlcnMsIG1hcCkge1xuICBpZiAocmVzb2x2ZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICByZXNvbHZlcnMuZm9yRWFjaChyID0+IHJlc29sdmVyUmVkdWNlcihyLCBtYXApKVxuICAgIHJldHVybiBtYXBcbiAgfVxuXG4gIGlmICh0eXBlb2YgcmVzb2x2ZXJzID09PSAnc3RyaW5nJykge1xuICAgIG1hcC5zZXQocmVzb2x2ZXJzLCBudWxsKVxuICAgIHJldHVybiBtYXBcbiAgfVxuXG4gIGlmICh0eXBlb2YgcmVzb2x2ZXJzID09PSAnb2JqZWN0Jykge1xuICAgIGZvciAobGV0IGtleSBpbiByZXNvbHZlcnMpIHtcbiAgICAgIG1hcC5zZXQoa2V5LCByZXNvbHZlcnNba2V5XSlcbiAgICB9XG4gICAgcmV0dXJuIG1hcFxuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlc29sdmVyIGNvbmZpZycpXG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVSZXNvbHZlcihuYW1lLCBzb3VyY2VGaWxlKSB7XG4gIC8vIFRyeSB0byByZXNvbHZlIHBhY2thZ2Ugd2l0aCBjb252ZW50aW9uYWwgbmFtZVxuICB0cnkge1xuICAgIHJldHVybiByZXF1aXJlKGBlc2xpbnQtaW1wb3J0LXJlc29sdmVyLSR7bmFtZX1gKVxuICB9IGNhdGNoIChlcnIpIHsgLyogY29udGludWUgKi8gfVxuXG4gIC8vIFRyeSB0byByZXNvbHZlIHBhY2thZ2Ugd2l0aCBjdXN0b20gbmFtZSAoQG15b3JnL3Jlc29sdmVyLW5hbWUpXG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUobmFtZSlcbiAgfSBjYXRjaCAoZXJyKSB7IC8qIGNvbnRpbnVlICovIH1cblxuICAvLyBUcnkgdG8gcmVzb2x2ZSBwYWNrYWdlIHdpdGggcGF0aCwgcmVsYXRpdmUgdG8gY2xvc2VzdCBwYWNrYWdlLmpzb25cbiAgLy8gb3IgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICB0cnkge1xuICAgIGNvbnN0IGJhc2VEaXIgPSBwa2dEaXIuc3luYyhzb3VyY2VGaWxlKSB8fCBwcm9jZXNzLmN3ZCgpXG4gICAgLy8gYWJzb2x1dGUgcGF0aHMgaWdub3JlIGJhc2UsIHNvIHRoaXMgY292ZXJzIGJvdGhcbiAgICByZXR1cm4gcmVxdWlyZShwYXRoLnJlc29sdmUoYmFzZURpciwgbmFtZSkpXG4gIH0gY2F0Y2ggKGVycikgeyAvKiBjb250aW51ZSAqLyB9XG5cbiAgLy8gYWxsIGVsc2UgZmFpbGVkXG4gIHRocm93IG5ldyBFcnJvcihgdW5hYmxlIHRvIGxvYWQgcmVzb2x2ZXIgXCIke25hbWV9XCIuYClcbn1cblxuY29uc3QgZXJyb3JlZENvbnRleHRzID0gbmV3IFNldCgpXG5cbi8qKlxuICogR2l2ZW5cbiAqIEBwYXJhbSAge3N0cmluZ30gcCAtIG1vZHVsZSBwYXRoXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbnRleHQgLSBFU0xpbnQgY29udGV4dFxuICogQHJldHVybiB7c3RyaW5nfSAtIHRoZSBmdWxsIG1vZHVsZSBmaWxlc3lzdGVtIHBhdGg7XG4gKiAgICAgICAgICAgICAgICAgICAgbnVsbCBpZiBwYWNrYWdlIGlzIGNvcmU7XG4gKiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkIGlmIG5vdCBmb3VuZFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXNvbHZlKHAsIGNvbnRleHQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVsYXRpdmUoIHBcbiAgICAgICAgICAgICAgICAgICAsIGNvbnRleHQuZ2V0RmlsZW5hbWUoKVxuICAgICAgICAgICAgICAgICAgICwgY29udGV4dC5zZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgIClcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCFlcnJvcmVkQ29udGV4dHMuaGFzKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgIG1lc3NhZ2U6IGBSZXNvbHZlIGVycm9yOiAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgIGxvYzogeyBsaW5lOiAxLCBjb2w6IDAgfSxcbiAgICAgIH0pXG4gICAgICBlcnJvcmVkQ29udGV4dHMuYWRkKGNvbnRleHQpXG4gICAgfVxuICB9XG59XG5yZXNvbHZlLnJlbGF0aXZlID0gcmVsYXRpdmVcblxuXG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSAnY3J5cHRvJ1xuZnVuY3Rpb24gaGFzaE9iamVjdChvYmplY3QpIHtcbiAgY29uc3Qgc2V0dGluZ3NTaGFzdW0gPSBjcmVhdGVIYXNoKCdzaGExJylcbiAgc2V0dGluZ3NTaGFzdW0udXBkYXRlKEpTT04uc3RyaW5naWZ5KG9iamVjdCkpXG4gIHJldHVybiBzZXR0aW5nc1NoYXN1bS5kaWdlc3QoJ2hleCcpXG59XG4iXX0=