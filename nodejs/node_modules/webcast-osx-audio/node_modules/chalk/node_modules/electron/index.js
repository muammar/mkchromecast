module.exports = process.env.ELECTRON_COV
  ? require('./lib-cov/electron')
  : require('./lib/electron');
