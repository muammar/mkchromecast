# Dethroy [![Build Status](https://travis-ci.org/stream-utils/dethroy.svg)](https://travis-ci.org/stream-utils/dethroy)

Destroy a stream.

## API

```js
var destroy = require('dethroy')

var fs = require('fs')
var stream = fs.createReadStream('package.json')
destroy(stream)
```
