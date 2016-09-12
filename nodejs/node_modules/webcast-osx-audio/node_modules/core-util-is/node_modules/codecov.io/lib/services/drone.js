module.exports = {

  detect : function(env){
    if (!env) env = process.env;
    return !!env.DRONE;
  },

  configuration : function(env){
    if (!env) env = process.env;
    return {
      service : 'drone',
      build : env.DRONE_BUILD_NUMBER,
      commit : env.DRONE_COMMIT,
      build_url : env.DRONE_BUILD_URL,
      branch : env.DRONE_BRANCH
    };
  }

};
