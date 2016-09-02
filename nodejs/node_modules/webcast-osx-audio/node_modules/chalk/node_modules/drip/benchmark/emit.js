var DripEmitter = require('..').EventEmitter
  , EnhancedEmitter = require('..').EnhancedEmitter
  , EventEmitter = require('events').EventEmitter;

suite('require(\'drip\').EventEmitter', eventBench(DripEmitter));
suite('require(\'drip\').EnhancedEmitter', eventBench(DripEmitter));
suite('require(\'events\').EventEmitter', eventBench(EventEmitter));

function eventBench (Emitter) {
  return function () {
    var ee = new Emitter();
    ee.on('event', function () {});

    bench('.emit(\'event\')', function () {
      ee.emit('event');
    });

    bench('.emit(\'event\', arg)', function () {
      ee.emit('event', 1);
    });

    bench('.emit(\'event\', arg, arg)', function () {
      ee.emit('event', 1, 2);
    });

    bench('.emit(\'event\', arg, arg, arg)', function () {
      ee.emit('event', 1, 2, 3);
    });
  }
}
