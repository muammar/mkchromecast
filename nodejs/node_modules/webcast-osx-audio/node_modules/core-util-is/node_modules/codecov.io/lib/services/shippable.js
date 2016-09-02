
module.exports = {

  detect : function(env){
    if (!env) env = process.env;
    return !!env.SHIPPABLE;
  },

  configuration : function(env){
    // http://docs.shippable.com/en/latest/config.html#common-environment-variables
    if (!env) env = process.env;
    return {
      service : 'shippable',
      build : env.BUILD_NUMBER,
      build_url : env.BUILD_URL,
      pull_request: env.PULL_REQUEST,
      commit : env.COMMIT,
      branch : env.BRANCH,
      slug : env.REPO_NAME
    };
  }

};
