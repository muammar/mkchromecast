// http://devcenter.wercker.com/articles/steps/variables.html

module.exports = {

  detect : function(env){
    if (!env) env = process.env;
    return !!env.WERCKER_MAIN_PIPELINE_STARTED;
  },

  configuration : function(env){
    if (!env) env = process.env;
    return {
      service : 'wercker',
      build :  env.WERCKER_MAIN_PIPELINE_STARTED,
      commit : env.WERCKER_GIT_COMMIT,
      build_url : env.WERCKER_BUILD_URL,
      branch : env.WERCKER_GIT_BRANCH,
      owner : env.WERCKER_GIT_OWNER,
      repo : env.WERCKER_GIT_REPOSITORY
    };
  }

};
