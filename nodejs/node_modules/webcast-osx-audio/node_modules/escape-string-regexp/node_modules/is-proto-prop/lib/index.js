'use strict';

var _lowercaseKeys = require('lowercase-keys');

var _lowercaseKeys2 = _interopRequireDefault(_lowercaseKeys);

var _protoProps = require('proto-props');

var _protoProps2 = _interopRequireDefault(_protoProps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lowerProtoProps = (0, _lowercaseKeys2.default)(_protoProps2.default);

/**
 * Determine if a property belongs to a type's prototype
 * @param {String} type - JS type
 * @param {String} property - name of property
 * @return {Boolean} - type has property on its prototype
 */
module.exports = function (type, property) {
  var lowerType = undefined;

  if (typeof type !== 'string' || typeof property !== 'string') {
    throw new TypeError('Expected a string');
  }

  lowerType = type.toLowerCase();

  return !!lowerProtoProps[lowerType] && lowerProtoProps[lowerType].indexOf(property) > -1;
};