# last-line-stream 

> A PassThrough stream that keeps track of last line written.

[![Build Status](https://travis-ci.org/jamestalmage/last-line-stream.svg?branch=master)](https://travis-ci.org/jamestalmage/last-line-stream) [![Coverage Status](https://coveralls.io/repos/jamestalmage/last-line-stream/badge.svg?branch=master&service=github)](https://coveralls.io/github/jamestalmage/last-line-stream?branch=master)


## Install

```
$ npm install --save last-line-stream
```


## Usage

```js
const lastLineStream = require('last-line-stream');

const stream = lastLineStream();

stream.write('foo');

assert(stream.lastLine === 'foo');

stream.write('bar');

assert(stream.lastLine === 'foobar');

stream.write('baz\nquz');

assert(stream.lastLine === 'quz');
```


## API

### lastLineStream([pipeTo])

Returns a new instance of the spying PassThrough stream, 

#### pipeTo

Type: `stream`

If supplied, the new instance will automatically be piped to this stream.

### stream.lastLine

Type: `string`

The last line written out to this stream. The `lastLine` value will grow until the stream sees a newline character (`'\n'`).

## Low Level API

A low-level non-stream based API is available. It has only two methods.

```js
var createTracker = require('last-line-stream/tracker');
var tracker = createTracker();

// append some text.
tracker.update(someString);

// Find the complete last line of all the text appended.
tracker.lastLine();
```

## License

MIT © [James Talmage](http://github.com/jamestalmage)
