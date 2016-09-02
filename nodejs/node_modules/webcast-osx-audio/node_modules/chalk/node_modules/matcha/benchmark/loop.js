
suite('array loop', function () {
  var arr = [ 1, 2, 3, 4, 5, 6 ];

  bench('foo.forEach', function () {
    var s = 0;
    arr.forEach(function (n) {
      s = s + n;
    });
  });

  bench('for i in foo', function () {
    var s = 0;
    for (var i in arr) {
      s = s + arr[i];
    }
  });

  bench('for count', function () {
    var s = 0;
    for (var i = 1; i < arr.length; i++) {
      s = s + arr[i];
    }
  });

});
