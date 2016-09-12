'use strict'

var rule = require('../rules/always-return')
var RuleTester = require('eslint').RuleTester
var message = 'Each then() should return a value'
var ecmaFeatures = { arrowFunctions: true }
var ruleTester = new RuleTester()
ruleTester.run('always-return', rule, {
  valid: [
    { code: 'hey.then(x => x)', ecmaFeatures: ecmaFeatures },
    { code: 'hey.then(x => ({}))', ecmaFeatures: ecmaFeatures },
    { code: 'hey.then(x => { return x * 10 })', ecmaFeatures: ecmaFeatures },
    { code: 'hey.then(function() { return 42; })', ecmaFeatures: ecmaFeatures },
    { code: 'hey.then(function() { return new Promise(); })', ecmaFeatures: ecmaFeatures },
    { code: 'hey.then(function() { return "x"; }).then(doSomethingWicked)' },
    { code: 'hey.then(x => x).then(function() { return "3" })', ecmaFeatures: ecmaFeatures }
  ],

  invalid: [
    {
      code: 'hey.then(x => {})',
      ecmaFeatures: ecmaFeatures,
      errors: [ { message: message } ]
    },
    {
      code: 'hey.then(function() { })',
      errors: [ { message: message } ]
    },
    {
      code: 'hey.then(function() { }).then(x)',
      errors: [ { message: message } ]
    },
    {
      code: 'hey.then(function() { }).then(function() { })',
      errors: [ { message: message }, { message: message } ]
    },
    {
      code: 'hey.then(function() { doSomethingWicked(); })',
      errors: [ { message: message } ]
    }
  ]
})
