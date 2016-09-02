module.exports = process.env.concat_COV
  ? require('./lib-cov/concat')
  : require('./lib/concat');
