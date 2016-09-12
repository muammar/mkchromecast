# cogent

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]

[npm-image]: https://img.shields.io/npm/v/cogent.svg?style=flat
[npm-url]: https://npmjs.org/package/cogent
[travis-image]: https://img.shields.io/travis/cojs/cogent.svg?style=flat
[travis-url]: https://travis-ci.org/cojs/cogent
[coveralls-image]: https://img.shields.io/coveralls/cojs/cogent.svg?style=flat
[coveralls-url]: https://coveralls.io/r/cojs/cogent?branch=master
[gittip-image]: https://img.shields.io/gittip/jonathanong.svg?style=flat
[gittip-url]: https://www.gittip.com/jonathanong/

A simple HTTP request agent designed primarily for `GET`ing stuff.

## Features

- Resolve redirects
- Timeout support
- Automatic gunzipping
- First-class JSON support
- Buffer the response or save it to a file

## API

```js
var request = require('cogent')

var uri = 'https://raw.github.com/visionmedia/express/master/package.json'

// Pipe stdout
var res = yield* request(uri)
res.pipe(process.stdout)

// Save to a file
var res = yield* request(uri, require('os').tmpdir() + '/express.package.json')
if (res.destination) console.log('ok')

// Get as JSON
var res = yield* request(uri, true)
var json = res.body
```

You can also use it without generators by wrapping it with [co](https://github.com/visionmedia/co):

```js
var co = require('co')
var request = co(require('cogent'))

request('https://github.com', function (err, res) {
  res.pipe(process.stdout)
})
```

### var response = yield* request(url, [options])

`url` is the URL of the request.
The options are passed to [http.request()](http://nodejs.org/api/http.html#http_http_request_options_callback).
Additional options are:

- `buffer` - buffer the response and save it as `res.buffer`
- `string` - buffer the response as a string and save it as `res.text`
- `json` - buffer the response as an object and save it as `res.body`
- `destination` - cojs/cogent the response to the file `destination`
- `timeout` - response header timeout per try, default `5000 milliseconds`
- `retries` - number of retries when request fails due to common server errors, default `0`
- `redirects` - resolve redirects, default `1`

If `options === true`, it defaults to `{ json: true }`.
If `typeof options === 'string'`, it defaults to `{ destination: string }`.

`response` will have the following properties:

- `res.req` - the request object
- `res.res` - the response object, itself if the response was not gzipped
- `res.statusCode`
- `res.headers`
- `res.destination` - populated only if the file was successfully saved on a `200`
- `res.buffer`
- `res.text`
- `res.body` - JSON body populated only on a `200`

### request = request.extend(options)

Create a new `cogent` instance with default options. This allows you to avoid setting the same options every time. See the options listed above.

- `retries`
- `redirects`
- `timeout`
- `method`
- `gunzip`
- `netrc`
- `agent`


```js
var request = require('cogent').extend({
  auth: 'username:password'
})

var res = yield* request('http://localhost/', true)
// will send with auth header
```
