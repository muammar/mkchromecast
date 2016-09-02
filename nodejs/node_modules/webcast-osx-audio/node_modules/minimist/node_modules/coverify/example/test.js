var test = require('tape');
var foo = require('./foo.js');

test('beep boop', function (t) {
    t.plan(1);
    
    foo(function (err, x) {
        if (err) deadCode();
        t.equal(x * 5, 555);
    });
});
