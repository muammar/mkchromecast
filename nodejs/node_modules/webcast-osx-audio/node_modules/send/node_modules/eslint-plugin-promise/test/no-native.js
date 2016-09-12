'use strict'

var rule = require('../rules/no-native')
var RuleTester = require('eslint').RuleTester

var ruleTester = new RuleTester()
ruleTester.run('no-native', rule, {
  valid: [
    'var Promise = null; function x() { return Promise.resolve("hi"); }',
    'var Promise = window.Promise || require("bluebird"); var x = Promise.reject();'
  ],

  invalid: [
    {
      code: 'new Promise(function(reject, resolve) { })',
      errors: [ { message: '"Promise" is not defined.' } ]
    },
    {
      code: 'Promise.resolve()',
      errors: [ { message: '"Promise" is not defined.' } ]
    }
  ]
})
