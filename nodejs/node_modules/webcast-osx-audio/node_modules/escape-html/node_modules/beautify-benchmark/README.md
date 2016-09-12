# [Beautify-Benchmark](https://npmjs.org/package/beautify-benchmark)

Beautify Benchmark.js's output into readable form.

## API

```js
var Benchmark = require('benchmark')
  , suite = new Benchmark.Suite
  , benchmarks = require('beautify-benchmark')
```

### benchmarks.add(event.target)

```js
suit.on('cycle', function(event) {
  benchmarks.add(event.target)
})
```

### benchmarks.getPercent(name)
Returns the percentage of the given benchmark's ops/sec compared to the highest ops/sec.

### benchmarks.reset()

Manually clear the stored benchmarks.

### benchmarks.log(options)

```js
suit.on('complete', function() {
  benchmarks.log()
})
```

##### default options
```js
options: {
    reset: true
  , tolerances: { pass: .95, mid: .80 }
}
```

## Result

![beautify-benchmark output](http://imgur.com/AME4QSr.png)

## License

The MIT License (MIT)

Copyright (c) 2013-2014 Jeremiah Senkpiel <fishrock123@rocketmail.com>

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