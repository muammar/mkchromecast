
module.exports = {

  detect : function(env){
    if (!env) env = process.env;
    return !!env.SEMAPHORE;
  },

  configuration : function(env){
    if (!env) env = process.env;
    return {
      service : 'semaphore',
      build : env.SEMAPHORE_BUILD_NUMBER + '.' + env.SEMAPHORE_CURRENT_THREAD,
      commit : env.REVISION,
      branch : env.BRANCH_NAME,
      slug : env.SEMAPHORE_REPO_SLUG
    };
  }

};
