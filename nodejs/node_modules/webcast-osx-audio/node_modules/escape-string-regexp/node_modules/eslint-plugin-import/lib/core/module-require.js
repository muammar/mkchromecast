'use strict';

exports.__esModule = true;
exports.default = moduleRequire;

var _module = require('module');

var _module2 = _interopRequireDefault(_module);

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// borrowed from babel-eslint
function createModule(filename) {
  var mod = new _module2.default(filename);
  mod.filename = filename;
  mod.paths = _module2.default._nodeModulePaths(path.dirname(filename));
  return mod;
}

function moduleRequire(p) {
  try {
    // attempt to get espree relative to eslint
    var eslintPath = require.resolve('eslint');
    var eslintModule = createModule(eslintPath);
    return require(_module2.default._resolveFilename(p, eslintModule));
  } catch (err) {/* ignore */}

  try {
    // try relative to entry point
    return require.main.require(p);
  } catch (err) {} /* ignore */

  // finally, try from here
  return require(p);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUvbW9kdWxlLXJlcXVpcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O2tCQVd3QixhOztBQVh4Qjs7OztBQUNBOztJQUFZLEk7Ozs7OztBQUVaO0FBQ0EsU0FBUyxZQUFULENBQXNCLFFBQXRCLEVBQWdDO0FBQzlCLE1BQUksTUFBTSxxQkFBVyxRQUFYLENBQVY7QUFDQSxNQUFJLFFBQUosR0FBZSxRQUFmO0FBQ0EsTUFBSSxLQUFKLEdBQVksaUJBQU8sZ0JBQVAsQ0FBd0IsS0FBSyxPQUFMLENBQWEsUUFBYixDQUF4QixDQUFaO0FBQ0EsU0FBTyxHQUFQO0FBQ0Q7O0FBRWMsU0FBUyxhQUFULENBQXVCLENBQXZCLEVBQTBCO0FBQ3ZDLE1BQUk7QUFDRjtBQUNBLFFBQU0sYUFBYSxRQUFRLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FBbkI7QUFDQSxRQUFNLGVBQWUsYUFBYSxVQUFiLENBQXJCO0FBQ0EsV0FBTyxRQUFRLGlCQUFPLGdCQUFQLENBQXdCLENBQXhCLEVBQTJCLFlBQTNCLENBQVIsQ0FBUDtBQUNELEdBTEQsQ0FLRSxPQUFNLEdBQU4sRUFBVyxDQUFFLFlBQWM7O0FBRTdCLE1BQUk7QUFDRjtBQUNBLFdBQU8sUUFBUSxJQUFSLENBQWEsT0FBYixDQUFxQixDQUFyQixDQUFQO0FBQ0QsR0FIRCxDQUdFLE9BQU0sR0FBTixFQUFXLENBQWdCLENBQTNCLENBQWE7O0FBRWY7QUFDQSxTQUFPLFFBQVEsQ0FBUixDQUFQO0FBQ0QiLCJmaWxlIjoiY29yZS9tb2R1bGUtcmVxdWlyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJ1xuXG4vLyBib3Jyb3dlZCBmcm9tIGJhYmVsLWVzbGludFxuZnVuY3Rpb24gY3JlYXRlTW9kdWxlKGZpbGVuYW1lKSB7XG4gIHZhciBtb2QgPSBuZXcgTW9kdWxlKGZpbGVuYW1lKVxuICBtb2QuZmlsZW5hbWUgPSBmaWxlbmFtZVxuICBtb2QucGF0aHMgPSBNb2R1bGUuX25vZGVNb2R1bGVQYXRocyhwYXRoLmRpcm5hbWUoZmlsZW5hbWUpKVxuICByZXR1cm4gbW9kXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vZHVsZVJlcXVpcmUocCkge1xuICB0cnkge1xuICAgIC8vIGF0dGVtcHQgdG8gZ2V0IGVzcHJlZSByZWxhdGl2ZSB0byBlc2xpbnRcbiAgICBjb25zdCBlc2xpbnRQYXRoID0gcmVxdWlyZS5yZXNvbHZlKCdlc2xpbnQnKVxuICAgIGNvbnN0IGVzbGludE1vZHVsZSA9IGNyZWF0ZU1vZHVsZShlc2xpbnRQYXRoKVxuICAgIHJldHVybiByZXF1aXJlKE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lKHAsIGVzbGludE1vZHVsZSkpXG4gIH0gY2F0Y2goZXJyKSB7IC8qIGlnbm9yZSAqLyB9XG5cbiAgdHJ5IHtcbiAgICAvLyB0cnkgcmVsYXRpdmUgdG8gZW50cnkgcG9pbnRcbiAgICByZXR1cm4gcmVxdWlyZS5tYWluLnJlcXVpcmUocClcbiAgfSBjYXRjaChlcnIpIHsgLyogaWdub3JlICovIH1cblxuICAvLyBmaW5hbGx5LCB0cnkgZnJvbSBoZXJlXG4gIHJldHVybiByZXF1aXJlKHApXG59XG4iXX0=