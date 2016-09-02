var Promise = require('bluebird')

function promiseSeries (arr, cb) {
  var count = 0
  return Promise.reduce(arr, function (arrActive, action) {
    return Promise.resolve(cb(action, count, arrActive)).then(function (value) {
      arrActive[count] = value
      count = count + 1
      return arrActive
    })
  }, arr)
}

module.exports = promiseSeries
