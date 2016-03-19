# osx-audio v0.2.0

A library that provides access to Mac OS X Audio I/O as streams. Only input is supported so far.

Audio captured is Signed 16-bit PCM, Stereo, 44100Hz, in little-endian byte-order. Alternate capture modes will be supported in future versions.

## Installation

To install the module for use in your projects:

```bash
npm install osx-audio
```

## Usage

Pipe input to a writeable file stream:

```js
var fs = require('fs');
var audio = require('osx-audio');

var input = new audio.Input();

var writable = fs.createWriteStream('output.txt');
input.pipe(writable);
```

### Options

None yet.

### API

#### audio.Input()

Creates a readable stream from the system audio's selected input.

## Environment Variables

None yet.

## Known Issues

- Opening, closing, then opening an input will fail to open. Re-instantiating works fine.

## Contributing

Feel free to send pull requests! I'm not picky, but would like the following:

1. Write tests for any new features, and do not break existing tests.
2. Be sure to point out any changes that break API.

## History

- **v0.2.0**  
Reimplements streams (again) and fixes stuttering bugs. Exposes audio event emitter directly if you wanted to use it.

- **v0.1.0**  
Reimplement streams and change API.

- **v0.0.2**  
Fixup stream resume crash.

- **v0.0.1**  
Initial Release. Only input is supported.

## The MIT License (MIT)

Copyright (c) 2014 Nathan Wittstock

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
