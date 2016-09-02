module.exports = process && 'function' === typeof process.hrtime
  ? require('./hrtimer')
  : require('./date');
