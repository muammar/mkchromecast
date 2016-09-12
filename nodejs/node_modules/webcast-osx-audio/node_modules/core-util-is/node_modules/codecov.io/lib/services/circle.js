module.exports = {

  detect : function(env){
    if (!env) env = process.env;
    return !!env.CIRCLECI;
  },

  configuration : function(env){
    if (!env) env = process.env;
    return {
      service : 'circleci',
      build : env.CIRCLE_BUILD_NUM + '.' + env.CIRCLE_NODE_INDEX,
      job : env.CIRCLE_BUILD_NUM + '.' + env.CIRCLE_NODE_INDEX,
      commit : env.CIRCLE_SHA1,
      branch : env.CIRCLE_BRANCH,
      pr: env.CIRCLE_PR_NUMBER,
      owner : env.CIRCLE_PROJECT_USERNAME,
      repo : env.CIRCLE_PROJECT_REPONAME,
    };
  }

};
