var i = 0;

suite('single', function() {
  set('iterations', 1);
  set('type', 'static');

  bench('i', function() {
    i++;
  });
});

process.on('exit', function() {
  if (1 !== i) throw new Error('single ran for ' + i + ' iterations');
});
