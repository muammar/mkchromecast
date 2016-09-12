/*!
 * tea-inherits
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/**
 * ### concat (arr1, arr2)
 *
 * A much faster concat for two arrays.
 * Returns a new array.
 *
 * ```js
 * var concat = require('tea-concat')
 *   , arr = concat([ 1, 2 ], [ 3, 4 ]);
 * ```
 *
 * @param {Array} first array
 * @param {Array} second array
 * @return {Array} combined
 * @api public
 */

module.exports = function concat (arr1, arr2) {
  var l1 = arr1.length
    , l2 = arr2.length
    , res = Array(l1 + l2);
  for (var i = 0; i < l1; i++) res[i] = arr1[i];
  for (var i2 = 0; i2 < l2; i2++) res[i + i2] = arr2[i2];
  return res;
}
