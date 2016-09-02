# tea-concat [![Build Status](https://secure.travis-ci.org/qualiancy/tea-concat.png?branch=master)](https://travis-ci.org/qualiancy/tea-concat)

> A must faster concat for Arrays

                        two arrays
        22,378,432 op/s ⨠ concat(arr1, arr2)
         9,739,072 op/s ⨠ arr1.concat(arr2)

    Suites:  1
    Benches: 2
    Elapsed: 2,671.53 ms

## Installation

### Node.js

`tea-concat` is available on [npm](http://npmjs.org).

    $ npm install tea-concat

### Component

`tea-concat` is available as a [component](https://github.com/component/component).

    $ component install qualiancy/tea-concat

## Usage

### concat (arr1, arr2)

* **@param** _{Array}_ first array
* **@param** _{Array}_ second array
* **@return** _{Array}_  combined

A much faster concat for two arrays.
Returns a new array.

```js
var concat = require('tea-concat')
  , arr = concat([ 1, 2 ], [ 3, 4 ]);
```

## License

(The MIT License)

Copyright (c) 2012 Jake Luer <jake@qualiancy.com> (http://qualiancy.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
