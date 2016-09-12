var test = require('tape');
var pkg = require('./package.json');

test('ok ok', function (t) {
    t.plan(3);
    
    forEach([ 10, 5, 24 ], function (n) {
        var sum = 0;
        for (var i = 0; i <= n; i++) {
            sum += i;
        }
        t.equal(sum, (n * (n+1)) / 2);
    });
});

test('ok ok (shim)', function (t) {
    t.plan(3);
    var xs = [ 10, 5, 24 ];
    xs.forEach = undefined;
    
    forEach(xs, function (n) {
        var sum = 0;
        for (var i = 0; i <= n; i++) {
            sum += i;
        }
        t.equal(sum, (n * (n+1)) / 2);
    });
});

test('assignment', function (t) {
    t.plan(3);
    
    var obj = { a: 1, b: 2 };
    t.equal(obj.a --, 1);
    t.equal(++ obj.b, 3);
    t.equal((obj.c = 5) * 2, 10);
});

test('throws expression', function (t) {
    t.plan(1);
    t.throws(function () {
        undefined.blah;
    });
});

test('throws function', function (t) {
    t.plan(1);
    t.throws(function () {
        (function () {
            1 + 2;
            return undefined;
        })().blah
    });
});

test('return arguments', function (t) {
    t.plan(1);

    t.equal((function () {
        return arguments[0]
    })(5), 5)
});

function forEach (xs, f) {
    if (xs.forEach) return xs.forEach(f);
    for (var i = 0; i < xs.length; i++) {
        f(xs[i], i);
    }
}
