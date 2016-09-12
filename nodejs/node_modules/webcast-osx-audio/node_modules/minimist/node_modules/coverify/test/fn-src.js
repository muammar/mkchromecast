var test = require('tape');

test('Function coverage', function (t) {
    t.plan(2);
    function f (test, x) {
      test.equal(x, 5);
      return x * 111;
    }
    var res = Function(['a','b'],'return ('+f+')(a,b)')(t, 5);
    t.equal(res, 555);
});
