'use strict';

var _lowercaseKeys = require('lowercase-keys');

var _lowercaseKeys2 = _interopRequireDefault(_lowercaseKeys);

var _getSetProps = require('get-set-props');

var _getSetProps2 = _interopRequireDefault(_getSetProps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lowerGetSetProps = (0, _lowercaseKeys2.default)(_getSetProps2.default);

/**
 * Determine if a property belongs to a type's getter/setters
 * @param {String} type - JS type
 * @param {String} property - name of property
 * @return {Boolean} - type has getter/setter named property
 */
module.exports = function (type, property) {
  var lowerType = undefined;

  if (typeof type !== 'string' || typeof property !== 'string') {
    throw new TypeError('Expected a string');
  }

  lowerType = type.toLowerCase();

  return !!lowerGetSetProps[lowerType] && lowerGetSetProps[lowerType].indexOf(property) > -1;
};