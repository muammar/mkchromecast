var nextTick = setImmediate || process.nextTick;

var bef = false;
var aft = false;

suite('async', function () {
  set('mintime', 2000);

  before(function(next) {
    setTimeout(function() {
      bef = true;
      next();
    }, 1000);
  });

  bench('setImmediate || nextTick', function (done) {
    nextTick(done);
  });

  bench('setTimeout 1', function (done) {
    setTimeout(done, 1);
  });

  after(function() {
    aft = true;
  });
});

process.on('exit', function() {
  if (!bef) throw new Error('before did not run');
  if (!aft) throw new Error('after did not run');
});
