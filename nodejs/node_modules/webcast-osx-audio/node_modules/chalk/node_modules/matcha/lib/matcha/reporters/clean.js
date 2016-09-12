/*!
 * Matcha - Clean Reporter
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function(runner, utils) {
  var color = utils.color;
  var humanize = utils.humanize;
  var padBefore = utils.padBefore;
  var cursor = utils.cursor;

  runner.on('start', function () {
    console.log();
  });

  runner.on('end', function (stats) {
    console.log();
    console.log(color('  Suites:  ', 'gray') + stats.suites);
    console.log(color('  Benches: ', 'gray') + stats.benches);
    console.log(color('  Elapsed: ', 'gray') + humanize(stats.elapsed.toFixed(2)) + ' ms');
    console.log();
  });

  runner.on('suite start', function (suite) {
    console.log(padBefore('', 23) + suite.title);
  });

  runner.on('suite end', function (suite) {
    console.log();
  });

  runner.on('bench start', function (bench) {
    process.stdout.write('\r' + color(padBefore('wait » ', 25), 'yellow')
                              + color(bench.title, 'gray'));
  });

  runner.on('bench end', function (results) {
    cursor.CR();
    var ops = humanize(results.ops.toFixed(0));
    console.log(color(padBefore(ops + ' op/s', 22), 'cyan')
              + color(' » ' + results.title, 'gray'));
  });
};
