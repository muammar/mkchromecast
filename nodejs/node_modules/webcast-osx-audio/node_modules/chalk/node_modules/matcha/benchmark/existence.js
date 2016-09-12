
suite('existence', function () {
  set('mintime', 1000);
  var foo = { c: 'hey' }
    , bar = { __proto__: foo, b: 'hey' }
    , obj = { __proto__: bar, a: 'hey' };

  before(function (done) {
    setTimeout(done, 1000);
  });

  after(function (done) {
    setTimeout(done, 1000);
  });

  bench('\'bar\' in foo', function(){
    'a' in obj;
    'b' in obj;
    'c' in obj;
  });

  bench('foo.prop', function(){
    obj.a;
    obj.b;
    obj.c;
  });

  bench('foo.hasOwnProperty()', function(){
    obj.hasOwnProperty('a');
    obj.hasOwnProperty('b');
    obj.hasOwnProperty('c');
  });
});
