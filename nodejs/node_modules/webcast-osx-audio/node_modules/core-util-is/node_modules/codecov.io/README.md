# codecov.io

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url] [![codecov.io](https://codecov.io/github/cainus/codecov.io/coverage.svg?branch=master)](https://codecov.io/github/cainus/codecov.io?branch=master)
[![Dependency Status][depstat-image]][depstat-url]
[![Dev Dependency Status][devdepstat-image]][devdepstat-url]

[Codecov.io](https://codecov.io/) support for node.js.  Get the great coverage reporting of codecov.io and add a cool coverage button ( like the one above ) to your README.

## Installation:
Add the latest version of `codecov.io` to your package.json:
```
npm install codecov.io --save
```

## Usage:

This script ( `bin/codecov.io.js` ) can take standard input from any tool that emits the lcov, gcov or standardized json data format and send it to codecov.io to report your code coverage there.

Once your app is instrumented for coverage, and building, you need to pipe the coverage reports output to `./node_modules/codecov.io/bin/codecov.io.js`.

This library currently supports the following CI companies: [Travis CI](https://travis-ci.org/), [Appveyor](https://appveyor.com/), [CircleCI](https://circleci.com/), [Codeship](https://codeship.io/), [Drone](https://drone.io/), [Jenkins](http://jenkins-ci.org/), [Shippable](https://shippable.com/), [Semaphore](https://semaphoreapp.com/), [Wercker](https://wercker.com/).

### CI Companies Supported
Jenkins, Travis CI, Codeship, Circle CI, Semaphore, drone.io, AppVeyor, Wercker, Magnum, Shippable, and Gitlab CI. Otherwise fallbacks on `git`.

#### Upload repo tokens
> Repo tokens are **not** required for public repos tested on Travis, CircleCI or AppVeyor.

Repo tokens are neccessary to distinquish your repository from others. You can find your repo token on your repository page at Codecov. Set this unique uuid to `CODECOV_TOKEN` in your environment variables.

```
export CODECOV_TOKEN=":uuid-repo-token"
```

#### [Istanbul](https://github.com/gotwarlost/istanbul)

**With Mocha:**

```sh
istanbul cover ./node_modules/mocha/bin/_mocha -- -R spec && cat ./coverage/lcov.info | ./node_modules/.bin/codecov
```

**With Jasmine:**

```sh
istanbul cover jasmine-node --captureExceptions spec/ && cat ./coverage/lcov.info | ./node_modules/.bin/codecov
```

**With Tape:**

```sh
istanbul cover test.js && cat ./coverage/lcov.info | ./node_modules/.bin/codecov
```

----

## Advanced: Partial Line Coverage
**Codecov does support parital line coverage**. However, some node projects do not report partial coverage accurate enough.
You can decide to upload the partial coverage report by chaning the target upload file to `./coverage/coverage.json`.
View your report on Codecov, if the reports are not accurate then switch back to the `lcov` provided above.

We are working on improving this implementation and appreciate your patience.

## Contributing

I generally don't accept pull requests that are untested, or break the build, because I'd like to keep the quality high (this is a coverage tool afterall!).

I also don't care for "soft-versioning" or "optimistic versioning" (dependencies that have ^, x, > in them, or anything other than numbers and dots).  There have been too many problems with bad semantic versioning in dependencies, and I'd rather have a solid library than a bleeding edge one.

[travis-image]: https://travis-ci.org/cainus/codecov.io.svg?branch=master
[travis-url]: https://travis-ci.org/cainus/codecov.io

[npm-url]: https://npmjs.org/package/codecov.io
[npm-image]: https://img.shields.io/npm/v/codecov.io.svg

[depstat-url]: https://david-dm.org/cainus/codecov.io
[depstat-image]: https://img.shields.io/david/cainus/codecov.io/master.svg

[devdepstat-url]: https://david-dm.org/cainus/codecov.io#info=devDependencies
[devdepstat-image]: https://img.shields.io/david/dev/cainus/codecov.io/master.svg
