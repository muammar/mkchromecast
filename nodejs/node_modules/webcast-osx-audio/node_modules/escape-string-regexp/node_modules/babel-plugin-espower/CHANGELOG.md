### [2.3.1](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v2.3.1) (2016-06-21)


#### Bug Fixes

* stop capturing SequenceExpression itself since SequenceExpressions are not enclosed in parentheses in some cases ([bf64b96a](https://github.com/power-assert-js/babel-plugin-espower/commit/bf64b96a139e0872590d39f2e5f4df02a2472eb3))


## [2.3.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v2.3.0) (2016-06-21)


#### Features

* [Support SequenceExpression (i.e., comma operator)](https://github.com/power-assert-js/babel-plugin-espower/pull/17)


## [2.2.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v2.2.0) (2016-05-31)


#### Features

* [`embedAst` option to embed assertion's AST and tokens to make runtime side parser unnecessary](https://github.com/power-assert-js/babel-plugin-espower/pull/13)
* [Make babel-plugin-espower customizable via plugin options](https://github.com/power-assert-js/babel-plugin-espower/pull/16)


### [2.1.2](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v2.1.2) (2016-02-14)


#### Bug Fixes

* do not include comments in one-line format assertion ([c5af6c55](https://github.com/power-assert-js/babel-plugin-espower/commit/c5af6c558f2caad8e30c1494c218d7ad3203eb16))


### [2.1.1](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v2.1.1) (2016-01-26)


### Performance Improvements

* [Use prototype based Recorder for performance boost](https://github.com/power-assert-js/babel-plugin-espower/pull/12) (by [@jamestalmage](https://github.com/jamestalmage))


## [2.1.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v2.1.0) (2016-01-10)


#### Features

* [Embed value capturing helper into transpiled code](https://github.com/power-assert-js/babel-plugin-espower/pull/11)


## [2.0.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v2.0.0) (2015-11-13)


#### Features

* [Babel 6.x support](https://github.com/power-assert-js/babel-plugin-espower/pull/5)


#### Breaking Changes

Babel6 is incompatible with Babel5. For Babel 5 or lower, you need to use the 1.x release of babel-plugin-espower.

```
$ npm install --save-dev babel-plugin-espower@1.1.0
```


## [1.1.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v1.1.0) (2015-11-06)


#### Features

* [async/await support](https://github.com/power-assert-js/babel-plugin-espower/pull/7) (by [@jamestalmage](https://github.com/jamestalmage))


### [1.0.1](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v1.0.1) (2015-11-07)


#### Bug Fixes

* pin espower dependency to >=1.0.0 <=1.2.0 since there was a little breaking change ([6420b3dc](https://github.com/power-assert-js/babel-plugin-espower/commit/6420b3dc49a00f731eebbee695c90be8f13d5e73), closes [#8](https://github.com/power-assert-js/babel-plugin-espower/issues/8))


## [1.0.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v1.0.0) (2015-05-25)


#### Features

* use `process.cwd()` for `sourceRoot` option value ([71016432](https://github.com/power-assert-js/babel-plugin-espower/commit/71016432565568e2b7325b11cf07ae90d029c45b))
* update espower to 1.0.0 ([337cdfd2](https://github.com/power-assert-js/babel-plugin-espower/commit/337cdfd26a2868addd1aabdd7787733a79eab11a))


### [0.4.1](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v0.4.1) (2015-05-21)


#### Bug Fixes

* eliminate remaining babel-core dependencies ([7735ed5f](https://github.com/power-assert-js/babel-plugin-espower/commit/7735ed5f8e6c38660c0328404057c6497370ebd7))


## [0.4.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v0.4.0) (2015-05-21)


#### Bug Fixes

* avoid visiting replacement node ([c4da8f8f](https://github.com/power-assert-js/babel-plugin-espower/commit/c4da8f8f8d3a56ccfe64812ef4f2c839ebec892c))


#### Features

* use new 5.2.0+ API with shared babel-core. No more peerDependencies. ([39eb684b](https://github.com/power-assert-js/babel-plugin-espower/commit/39eb684b733729a0b0d6752bd52a008c5b08159b))


#### Breaking Changes

* function returned by `babel-plugin-espower/create` takes babel instance as a first argument.

If you are customizing babel-plugin-espower using `babel-plugin-espower/create`, you may have to migrate.

To migrate, change your code from the following:

```
var babel = require('babel-core');
var createEspowerPlugin = require('babel-plugin-espower/create');
var transformed = babel.transform(jsCode, {
    plugins: [
        createEspowerPlugin({
            patterns: [
                'assert.isNull(object, [message])',
                'assert.same(actual, expected, [message])',
                'assert.near(actual, expected, delta, [message])'
            ]
        })
    ]
});
```

To:

```
var babel = require('babel-core');
var createEspowerPlugin = require('babel-plugin-espower/create');
var transformed = babel.transform(jsCode, {
    plugins: [
        createEspowerPlugin(babel, {
            patterns: [
                'assert.isNull(object, [message])',
                'assert.same(actual, expected, [message])',
                'assert.near(actual, expected, delta, [message])'
            ]
        })
    ]
});
```

([39eb684b](https://github.com/power-assert-js/babel-plugin-espower/commit/39eb684b733729a0b0d6752bd52a008c5b08159b))


### [0.3.1](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v0.3.1) (2015-05-18)


#### Bug Fixes

* use version range since babel-core 5.4.3 does not work. ([3b586fa9](https://github.com/power-assert-js/babel-plugin-espower/commit/3b586fa9c20650871f7420c70d6e9c189be7412c)


## [0.3.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v0.3.0) (2015-05-01)


#### Bug Fixes

* deal with babel 5.2.x internal changes. ([17698583](https://github.com/power-assert-js/babel-plugin-espower/commit/17698583a871e59c0af660cd888c2e98f85aea38), closes [#3](https://github.com/power-assert-js/babel-plugin-espower/issues/3))


### [0.2.2](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v0.2.2) (2015-04-24)


* update escallmatch to 1.3.2 ([941c75c2](https://github.com/power-assert-js/babel-plugin-espower/commit/941c75c29504284fee7fa916752e4096fd65011f))


### [0.2.1](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v0.2.1) (2015-04-21)


* down peerDependencies to minimum version to make dedupe friendly ([093ce106](https://github.com/power-assert-js/babel-plugin-espower/commit/093ce1068a11ac1550830c5e541f93a3271623af))


## [0.2.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v0.2.0) (2015-04-19)


* export create.js to customize assertion patterns ([092c3464](https://github.com/power-assert-js/babel-plugin-espower/commit/092c3464ae37ab27a91cd01e3dd8fa2062a08dfe))
* docs about customizing assertion patterns via Babel API ([f72a9b1](https://github.com/power-assert-js/babel-plugin-espower/commit/f72a9b19b68d3d12287ba8b33878c7ff63049175))


## [0.1.0](https://github.com/power-assert-js/babel-plugin-espower/releases/tag/v0.1.0) (2015-04-18)


The first release.
