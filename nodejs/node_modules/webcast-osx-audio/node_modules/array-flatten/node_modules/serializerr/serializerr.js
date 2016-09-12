'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _protochain = require('protochain');

var _protochain2 = _interopRequireDefault(_protochain);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function serializerr() {
  var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var chain = (0, _protochain2.default)(obj).filter(function (obj) {
    return obj !== Object.prototype;
  });
  return [obj].concat(chain).map(function (item) {
    return Object.getOwnPropertyNames(item);
  }).reduce(function (result, names) {
    names.forEach(function (name) {
      result[name] = obj[name];
    });
    return result;
  }, {});
}

module.exports = serializerr;
serializerr.serializerr = serializerr;
exports.default = serializerr;

