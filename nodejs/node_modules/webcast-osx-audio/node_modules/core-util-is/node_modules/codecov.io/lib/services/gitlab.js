// http://doc.gitlab.com/ci/examples/README.html#environmental-variables
// https://gitlab.com/gitlab-org/gitlab-ci-runner/blob/master/lib/build.rb#L96

module.exports = {

  detect : function(env){
    if (!env) env = process.env;
    return env.CI_SERVER_NAME == 'GitLab CI';
  },

  configuration : function(env){
    if (!env) env = process.env;
    return {
      service : 'gitlab',
      build :  env.CI_BUILD_ID,
      commit : env.CI_BUILD_REF,
      branch : env.CI_BUILD_REF_NAME,
      slug : env.CI_BUILD_REPO.split('/').slice(3, 5).join('/').replace('.git', '')
    };
  }

};
