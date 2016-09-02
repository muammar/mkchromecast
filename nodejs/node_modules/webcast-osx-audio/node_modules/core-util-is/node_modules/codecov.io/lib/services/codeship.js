module.exports = {

  detect : function(env){
    if (!env) env = process.env;
    return (env.CI_NAME && env.CI_NAME === 'codeship');
  },

  configuration : function(env){
    if (!env) env = process.env;
    return {
      service : 'codeship',
      build : env.CI_BUILD_NUMBER,
      build_url : env.CI_BUILD_URL,
      commit : env.CI_COMMIT_ID,
      branch : env.CI_BRANCH
    };
  }

};
