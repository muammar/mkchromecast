# acorn-umd

Parse acorn ast for AMD, CommonJS, and ES6 definitions.

[![Travis build status](http://img.shields.io/travis/megawac/acorn-umd.svg?style=flat)](https://travis-ci.org/megawac/acorn-umd)
[![Test Coverage](https://codeclimate.com/github/megawac/acorn-umd/badges/coverage.svg)](https://codeclimate.com/github/megawac/acorn-umd)
[![Code Climate](https://codeclimate.com/github/megawac/acorn-umd/badges/gpa.svg)](https://codeclimate.com/github/megawac/acorn-umd)
[![Dependency Status](https://david-dm.org/megawac/acorn-umd.svg)](https://david-dm.org/megawac/acorn-umd)
[![devDependency Status](https://david-dm.org/megawac/acorn-umd/dev-status.svg)](https://david-dm.org//acorn-umd#info=devDependencies)

The Nodes created align as closely as possible with the nodes generated for acorns ES6 import nodes. Example below

```js
var acorn = require('acorn');
var umd = require('acorn-umd');

var code = `
    import {a, b, c as d} from 'library';
    import foo from 'foo-library';
    
    let _ = require('lodash');
`;

var ast = acorn.parse(code, {ecmaVersion: 6});
var imports = umd(ast, {
    es6: true, amd: false, cjs: true
});

console.log(imports);
```

```js
[
  { type: 'CJSImport',
    reference: 
     { type: 'VariableDeclaration',
       start: 87,
       end: 113,
       declarations: [Object],
       kind: 'let' },
    specifiers: [ [Object] ],
    start: 87,
    end: 113,
    source: 
     { type: 'Literal',
       reference: [Object],
       value: 'lodash',
       raw: '\'lodash\'',
       start: 103,
       end: 111 }
  },
  { type: 'ImportDeclaration',
    start: 5,
    end: 42,
    specifiers: [ [Object], [Object], [Object] ],
    source: 
     { type: 'Literal',
       start: 32,
       end: 41,
       value: 'library',
       raw: '\'library\'' }
  },
  { type: 'ImportDeclaration',
    start: 47,
    end: 77,
    specifiers: [ [Object] ],
    source: 
     { type: 'Literal',
       start: 63,
       end: 76,
       value: 'foo-library',
       raw: '\'foo-library\'' }
  }
]
```


# AMD Imports

```js
let code = `
  foo();
  define(['foo', 'unused-import'], function($) {
      return $();
  });
`;

let ast = acorn.parse(code, {ecmaVersion: 6});
let parsed = umd(ast, {
  es6: false, amd: true, cjs: false
});

console.log(parsed);

[
 {
  type: 'AMDImport',
  reference: { DEFINE_NODE },
  start: 12,
  end: 81,

  specifiers: [ { type: 'Identifier', start: 54, end: 55, name: '$' } ],
  sources: 
   [ { type: 'Literal',
       reference: [Object],
       value: 'foo',
       raw: '\'foo\'',
       start: 20,
       end: 25 },
     { type: 'Literal',
       reference: [Object],
       value: 'unused-import',
       raw: '\'unused-import\'',
       start: 27,
       end: 42 } ],

  // Grouped [source, variable] name array
  imports: [ [ {SOURCE_NODE}, {VARIABLE_NODE} ], [ {SOURCE_NODE}, undefined ] 
 }
]
```

#### Get the scope of a node


```
import {sample} from 'lodash'

let parsed = umd(ast, {
  es6: false, amd: true, cjs: false
});

let node = sample(parsed);

let scope = node.scope; // scope is null if global otherwise a function node
```