var test = require('tape');
var pkg = require('./package.json');

test('not covered', function (t) {
    t.plan(3);
    
    forEach([ 10, 5, 24 ], function (n) {
        var sum = 0;
        for (var i = 0; i <= n; i++) {
            if (i > 30) unreachable(
                2 + 5
            ); var z = 3;
            sum += i;
        }
        t.equal(sum, (n * (n+1)) / 2);
    });
});

test('whatever', whatever);

function whatever (t) {
    t.plan(1);
    t.throws(function () {
        (function () {
            return undefined;
            whaaaaa();
            beep('boop');
        })().blah
    });
}

function forEach (xs, f) {
    if (xs.forEach) return xs.forEach(f);
    for (var i = 0; i < xs.length; i++) {
        f(xs[i], i);
    }
}
