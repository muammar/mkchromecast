module.exports = {

  detect : function(env){
    if (!env) env = process.env;
    return !!env.SNAP_CI;
  },

  configuration : function(env){
    if (!env) env = process.env;
    return {
      service : 'snap',
      build : env.SNAP_PIPELINE_COUNTER,
      commit : env.SNAP_COMMIT || env.SNAP_UPSTREAM_COMMIT,
      branch : env.SNAP_BRANCH || env.SNAP_UPSTREAM_BRANCH,
      pull_request: env.SNAP_PULL_REQUEST_NUMBER,
    };
  }

};
