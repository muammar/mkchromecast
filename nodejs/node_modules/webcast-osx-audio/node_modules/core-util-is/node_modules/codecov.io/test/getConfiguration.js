var getConfiguration = require("../lib/getConfiguration");

describe("getConfiguration", function(){

  it ("can get a token passed via env variable (uppercase)", function(){
    process.env.TRAVIS = "true";
    process.env.TRAVIS_JOB_ID = '1234';
    process.env.TRAVIS_COMMIT = '5678';
    process.env.TRAVIS_JOB_NUMBER = '91011';
    process.env.TRAVIS_PULL_REQUEST = 'false';
    process.env.TRAVIS_BRANCH = 'master';
    process.env.TRAVIS_REPO_SLUG = 'owner/repo';
    process.env.CODECOV_TOKEN = 'ASDF-ASDF-ASDF-ASDF';
    if (process.env.TRAVIS_PULL_REQUEST) {
      process.env.TRAVIS_PULL_REQUEST = 'false';
    }
    expect(getConfiguration()).to.eql({
      package : 'node',
      service : 'travis',
      commit : '5678',
      build : '91011',
      branch : 'master',
      pull_request: 'false',
      job : '1234',
      token : 'asdf-asdf-asdf-asdf',
      slug : 'owner/repo'
    });
  });
  it ("can get a token passed via env variable (lowercase)", function(){
    process.env.TRAVIS = "true";
    process.env.TRAVIS_JOB_ID = '1234';
    process.env.TRAVIS_COMMIT = '5678';
    process.env.TRAVIS_JOB_NUMBER = '91011';
    process.env.TRAVIS_PULL_REQUEST = 'false';
    process.env.TRAVIS_BRANCH = 'master';
    process.env.TRAVIS_REPO_SLUG = 'owner/repo';
    process.env.codecov_token = 'asdf-asdf-asdf-asdf';
    if (process.env.TRAVIS_PULL_REQUEST) {
      process.env.TRAVIS_PULL_REQUEST = 'false';
    }
    expect(getConfiguration()).to.eql({
      package : 'node',
      service : 'travis',
      commit : '5678',
      build : '91011',
      pull_request: 'false',
      job : '1234',
      branch : 'master',
      token : 'asdf-asdf-asdf-asdf',
      slug : 'owner/repo'
    });
  });

});
