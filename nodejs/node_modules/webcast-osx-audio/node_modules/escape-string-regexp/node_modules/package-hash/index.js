'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.sync = sync;

var _child_process = require('child_process');

var _fs = require('fs');

var _path = require('path');

var _md5Hex = require('md5-hex');

var _md5Hex2 = _interopRequireDefault(_md5Hex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function tryReadFileSync(file) {
  try {
    return (0, _fs.readFileSync)(file);
  } catch (err) {
    return null;
  }
}

var TEN_MEBIBYTE = 1024 * 1024 * 10;

var git = {
  tryGetRef: function (dir, head) {
    var m = /^ref: (.+)$/.exec(head.toString('utf8').trim());
    if (!m) return null;

    return tryReadFileSync((0, _path.join)(dir, '.git', m[1]));
  },
  tryGetDiff: function (dir) {
    if (!_child_process.execFileSync) return null;

    try {
      // Attempt to get consistent output no matter the platform. Diff both
      // staged and unstaged changes.
      return (0, _child_process.execFileSync)('git', ['--no-pager', 'diff', 'HEAD', '--no-color', '--no-ext-diff'], {
        cwd: dir,
        maxBuffer: TEN_MEBIBYTE,
        env: _extends({}, process.env, {
          // Force the GIT_DIR to prevent git from diffing a parent repository
          // in case the directory isn't actually a repository.
          GIT_DIR: (0, _path.join)(dir, '.git')
        }),
        // Ignore stderr.
        stdio: ['ignore', 'pipe', 'ignore']
      });
    } catch (err) {
      return null;
    }
  }
};

function addPackageData(inputs, path) {
  var dir = (0, _fs.statSync)(path).isDirectory() ? path : (0, _path.dirname)(path);
  inputs.push(dir);

  var pkg = (0, _fs.readFileSync)((0, _path.join)(dir, 'package.json'));
  inputs.push(pkg);

  var head = tryReadFileSync((0, _path.join)(dir, '.git', 'HEAD'));
  if (head) {
    inputs.push(head);

    var packed = tryReadFileSync((0, _path.join)(dir, '.git', 'packed-refs'));
    if (packed) inputs.push(packed);

    var ref = git.tryGetRef(dir, head);
    if (ref) inputs.push(ref);

    var diff = git.tryGetDiff(dir);
    if (diff) inputs.push(diff);
  }
}

function computeHash(paths, pepper, salt) {
  var inputs = [];
  if (pepper) inputs.push(pepper);

  if (typeof salt !== 'undefined') {
    if (Buffer.isBuffer(salt) || typeof salt === 'string') {
      inputs.push(salt);
    } else if (typeof salt === 'object' && salt !== null) {
      inputs.push(JSON.stringify(salt));
    } else {
      throw new TypeError('Salt must be an Array, Buffer, Object or string');
    }
  }

  for (var i = 0; i < paths.length; i++) {
    addPackageData(inputs, paths[i]);
  }

  return (0, _md5Hex2.default)(inputs);
}

var ownHash = null;
function sync(paths, salt) {
  if (!ownHash) {
    // Memoize the hash for package-hash itself.
    ownHash = new Buffer(computeHash([__dirname]), 'hex');
  }

  if (paths === __dirname && typeof salt === 'undefined') {
    // Special case that allow the pepper value to be obtained. Mainly here for
    // testing purposes.
    return ownHash.toString('hex');
  }

  if (Array.isArray(paths)) {
    return computeHash(paths, ownHash, salt);
  } else {
    return computeHash([paths], ownHash, salt);
  }
}
//# sourceMappingURL=index.js.map