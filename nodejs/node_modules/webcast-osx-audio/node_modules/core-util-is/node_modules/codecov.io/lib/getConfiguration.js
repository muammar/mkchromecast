var services = {
  'travis' : require('./services/travis'),
  'circle' : require('./services/circle'),
  'codeship' : require('./services/codeship'),
  'drone' : require('./services/drone'),
  'appveyor' : require('./services/appveyor'),
  'wercker' : require('./services/wercker'),
  'jenkins' : require('./services/jenkins'),
  'semaphore' : require('./services/semaphore'),
  'snap' : require('./services/snap'),
  'gitlab' : require('./services/gitlab')
};

module.exports = function(){
  var config;
  for (var name in services){
    if (services[name].detect()){
      config = services[name].configuration();
      break;
    }
  }
  if (!config){
    // coming soon
    // var local = require('./services/localGit');
    // config = local.configuration();
    if (!config){
      throw new Error("unknown service. could not get configuration");
    }
  }
  var token = (process.env.codecov_token || process.env.CODECOV_TOKEN);
  if (token){
    config.token = token.toLowerCase();
  }
  config.package = 'node';
  return config;
};
