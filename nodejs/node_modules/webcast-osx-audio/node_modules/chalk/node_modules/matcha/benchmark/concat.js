
suite('array concat', function () {
  set('iterations', 10);

  var arr1 = [ 'a', 'b', 'c' ]
    , arr2 = [ 'd', 'e', 'f' ];

  bench('concat', function () {
    var arr3 = arr1.concat(arr2);
  });

  bench('for loop', function () {
    var l1 = arr1.length
      , l2 = arr2.length
      , arr3 = Array(l1 + l2);
    for (var i = 0; i < l1; i++) arr3[i] = arr1[i];
    for (var i2 = 0; i2 < l2; i2++) arr3[i + i2] = arr2[i2];
  });

});
