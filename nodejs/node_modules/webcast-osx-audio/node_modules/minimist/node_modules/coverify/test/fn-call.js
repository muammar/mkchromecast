var test = require('tape');
var call = Function.prototype.call;

test('Function.prototype.call', function (t) {
    t.plan(1);
    var res = call.bind(Array.prototype.map)([1,2,3],function (x) {
        return x * 100;
    });
    t.deepEqual(res, [100,200,300]);
});
