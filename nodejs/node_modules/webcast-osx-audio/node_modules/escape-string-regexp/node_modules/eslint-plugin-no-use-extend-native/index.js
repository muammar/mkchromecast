/* eslint no-var: 0 */
'use strict'
var rule = require('./rules/no-use-extend-native')

module.exports = {
  rules: {
    'no-use-extend-native': rule
  },
  rulesConfig: {
    'no-use-extend-native': 2
  }
}
