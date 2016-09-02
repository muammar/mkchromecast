# v8-argv [![Build Status](https://travis-ci.org/logicalparadox/v8-argv.png?branch=master)](https://travis-ci.org/logicalparadox/v8-argv)

> Proxy v8 argv (including harmony) to v8/node while forwarding the remaining arguments to a custum script.

#### Installation

`v8-argv` is available on [npm](http://npmjs.org).

    npm install v8-argv

#### Usage


- **@param** _{String}_ path to resolve to actual bin (repeatable)

##### bin/app

```js
#!/usr/bin/env node
require('v8-argv')(__dirname, '_app');
```

##### bin/_app

```js
#!/usr/bin/env node
program.parse(process.argv); // etc...
```

#### Test

    npm test

#### Credit Due

- [logicalparadox/matcha#8](https://github.com/logicalparadox/matcha/pull/8) by [visionmedia](https://github.com/visionmedia)

#### License

[WTFPL](http://wtfpl.org/)
