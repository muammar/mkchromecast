# es-lookup-scope
[![Travis build status](http://img.shields.io/travis/megawac/es-lookup-scope.svg?style=flat)](https://travis-ci.org/megawac/es-lookup-scope)
[![Code Climate](https://codeclimate.com/github/megawac/es-lookup-scope/badges/gpa.svg)](https://codeclimate.com/github/megawac/es-lookup-scope)
[![Test Coverage](https://codeclimate.com/github/megawac/es-lookup-scope/badges/coverage.svg)](https://codeclimate.com/github/megawac/es-lookup-scope)
[![Dependency Status](https://david-dm.org/megawac/es-lookup-scope.svg)](https://david-dm.org/megawac/es-lookup-scope)
[![devDependency Status](https://david-dm.org/megawac/es-lookup-scope/dev-status.svg)](https://david-dm.org/megawac/es-lookup-scope#info=devDependencies)

Using [escope](https://github.com/estools/escope) we find the scope of any estree compatible AST node.

```js
import {parse} from 'acorn';
import lookup from 'es-lookup-scope';
import {traverse} from 'estraverse'

let ast = parse(`
      (function() {
        const x = 2;
        try {
          const x = 1;
          [1, 2, 3].map(x => x);
        } catch(o_O) {}
        console.log(x);
      })();
      module.exports = {
        x() {
          let y = this;
          console.log(y);
        }
      }
    `, { ecmaVersion: 6});
    
traverse(ast, {
    enter(node) {
        console.log(lookup(node));
    }
});
```