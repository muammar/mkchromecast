
suite('function', function () {
  function foo () {}

  bench('foo()', function () {
    foo(1,2,3);
  });

  bench('foo.call', function () {
    foo.call(foo, 1, 2, 3);
  });

  bench('foo.apply', function () {
    foo.apply(foo, [ 1, 2, 3 ]);
  });
});
