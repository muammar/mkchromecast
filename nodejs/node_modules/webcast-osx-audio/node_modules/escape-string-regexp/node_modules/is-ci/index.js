'use strict'

module.exports = !!(
  // Generic environment variables
  process.env.CI ||                              // Travis CI, CircleCI, GitlabCI, Appveyor, CodeShip, ...
  process.env.CONTINUOUS_INTEGRATION ||          // Travis CI, ...
  process.env.BUILD_NUMBER ||                    // Jenkins, TeamCity, ...

  // Sever specific environment variables
  process.env.JENKINS_URL ||                     // Jenkins
  process.env.bamboo_planKey ||                  // Bamboo (by Atlassian)
  process.env.TF_BUILD ||                        // Team Foundation Server (by Microsoft)
  process.env.TEAMCITY_VERSION ||                // TeamCity (by JetBrains)
  process.env.BUILDKITE ||                       // Buildkite
  process.env.HUDSON_URL ||                      // Hudson
  (process.env.TASK_ID && process.env.RUN_ID) || // TaskCluster
  process.env.GO_PIPELINE_LABEL ||               // GoCD
  process.env.BITBUCKET_COMMIT ||                // Bitbucket Pipelines
  false
)
