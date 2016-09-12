var _ = require('lodash')
var Promise = require('bluebird')

function promiseRipple (start, props) {
  props = (props) ? props : start
  start = (props) ? start : {}
  props = _.mapValues(props, function (prop, key) {
    prop.key = key
    return prop
  })
  return Promise.reduce(_.values(props), function (result, action) {
    if (typeof action !== 'function') throw new Error('property values must be functions')
    return Promise.resolve(action(start)).then(function (value) {
      if (start === value) {
        return value
      } else {
        start[action.key] = value
        return value
      }
    })
  }, null)
  .then(function () {
    return start
  })
}

module.exports = promiseRipple

// promiseRipple({zero: 'zero'}, {
//   'alpha': function (data) {
//     return Promise.resolve(data.zero + ' alpha') // async -> 'zero alpha'
//   },
//   'beta': function (data) {
//     data.foo = 'foo'
//     data.bar = 'bar'
//     return data
//   },
//   'gamma': function (data) {
//     return Promise.resolve(data.zero + ' gamma') // async -> 'zero gamma'
//   },
//   'delta': function (data) {
//     return Promise.resolve(data.zero + data.alpha + ' delta') // async -> 'zerozero alpha delta'
//   },
// }).then(function (results) {
//   console.log(results)
// })
