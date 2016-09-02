module.exports = {

  detect : function(env){
    if (!env) env = process.env;
    return !!env.TRAVIS;
  },

  configuration : function(env){
    if (!env) env = process.env;
    return {
      service : 'travis',
      commit : env.TRAVIS_COMMIT,
      build : env.TRAVIS_JOB_NUMBER,
      branch : env.TRAVIS_BRANCH,
      job : env.TRAVIS_JOB_ID,
      pull_request: env.TRAVIS_PULL_REQUEST,
      slug : env.TRAVIS_REPO_SLUG
    };
  }

};
