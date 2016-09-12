module.exports = (process && process.env && process.env.DRIP_COV)
  ? require('./lib-cov/drip')
  : require('./lib/drip');
