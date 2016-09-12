# Contributing to esformatter-semicolon-first

Please add test cases to the `test/compare/input.js` and
`test/compore/output.js`. That will reduce the chance of introducing regressions
and make it clear what is the expected behavior.

Install the npm dependencies:

```
$ cd esformatter-semicolon-first
$ npm install
```

And to run it you just need to do:

```
$ npm test
```

It will compare the `input.js` with the `output.js`.

Thanks!
