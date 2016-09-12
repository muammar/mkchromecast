var concat = require('..')
  , arr1 = [ 1, 2 ]
  , arr2 = [ 3, 4 ];

suite('two arrays', function () {
  bench('concat(arr1, arr2)', function () {
    var res = concat(arr1, arr2);
  });

  bench('arr1.concat(arr2)', function () {
    var res = arr1.concat(arr2);
  });
})
