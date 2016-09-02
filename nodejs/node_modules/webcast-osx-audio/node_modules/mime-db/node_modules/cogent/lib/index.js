var url = require('url')
var util = require('util')
var zlib = require('zlib')
var http = require('http')
var https = require('https')
var Netrc = require('netrc')
var write = require('write-to')
var status = require('statuses')
var rawBody = require('raw-body')
var debug = require('debug')('cogent')

var inspect = util.inspect

exports = module.exports = extend()
exports.extend = extend

function extend(defaults) {
  defaults = defaults || {}
  defaults.retries = defaults.retries || 0
  defaults.redirects = 'redirects' in defaults ? defaults.redirects : 3
  defaults.timeout = defaults.timeout || 5000
  defaults.method = defaults.method || 'GET'
  defaults.gunzip = defaults.gunzip === false ? false : true
  defaults.netrc = Netrc(defaults.netrc)

  return cogent

  function* cogent(uri, options) {
    // options type checking stuff
    if (options === true)
      options = { json: true }
    else if (typeof options === 'string')
      options = { destination: options }
    else if (!options)
      options = {}

    // setup defaults
    var redirects = options.redirects || ( options.redirects !== 0 ? defaults.redirects : 0 )
    var timeout = options.timeout || ( options.timeout !== 0 ? defaults.timeout : 0 )
    var netrc = options.netrc ? Netrc(options.netrc) : defaults.netrc

    // setup headers
    var headers = options.headers = options.headers || {}
    headers['accept-encoding'] = headers['accept-encoding'] || 'gzip'
    headers['user-agent'] = headers['user-agent'] || 'https://github.com/cojs/cogent'
    if (options.json) headers.accept = 'application/json'

    // keep a history of redirect urls
    var urls = []

    var o, req, res, code, stream, securrrr, retries
    // while loop to handle redirects
    while (true) {
      // create the request options object
      urls.push(o = url.parse(uri))
      securrrr = o.protocol === 'https:'
      o.headers = options.headers
      o.method = options.method || defaults.method

      // auth, either by .auth or by .netrc
      if (options.auth || defaults.auth) {
        o.auth = options.auth || defaults.auth
      } else {
        var auth = netrc[o.hostname]
        if (auth) o.auth =
            (auth.login || auth.user || auth.username)
          + ':'
          + (auth.pass || auth.password)
      }

      // setup agent or proxy agent
      if ('agent' in options) {
        o.agent = options.agent
      } else if (defaults.agent != null) {
        o.agent = defaults.agent
      }

      // retries is on a per-URL-request basis
      retries = options.retries || defaults.retries

      debug('options: %s', inspect(o))

      res = yield request()
      code = res.statusCode

      // redirect
      if (redirects-- && status.redirect[code]) {
        debug('redirecting from %s to %s', uri, res.headers.location)
        uri = url.resolve(uri, res.headers.location)
        res.resume() // dump this stream
        continue
      }

      // return early on HEAD requests
      if (o.method.toUpperCase() === 'HEAD') {
        res.req = req
        res.resume()
        return res
      }

      // unzip
      var gunzip = typeof options.gunzip === 'boolean'
        ? options.gunzip
        : defaults.gunzip
      if (!gunzip && (options.buffer || options.string || options.json))
        throw new Error('must gunzip if buffering the response')
      if (res.headers['content-encoding'] === 'gzip' && gunzip) {
        stream = res.pipe(zlib.createGunzip())
        stream.res = res
        // pass useful response stuff
        stream.statusCode = code
        stream.headers = res.headers
        // forward errors
        res.on('error', stream.emit.bind(stream, 'error'))
        // forward close
        // creates the following error:
        // Assertion failed: (!write_in_progress_ && "write in progress"), function Close, file ../src/node_zlib.cc, line 99.
        // make: *** [test] Abort trap: 6
        // res.on('close', stream.close.bind(stream))
        // forward destroy
        // note: if zlib adds a .destroy method, we have to change this
        stream.destroy = res.destroy.bind(res)
        res = stream
      } else {
        res.res = res
      }

      res.req = req
      res.urls = urls

      // save the file
      if (code === 200 && options.destination) {
        yield write(res, options.destination)
        res.destination = options.destination
        return res
      }

      // buffer the response
      if (options.buffer)
        res.buffer = yield rawBody(res)
      // buffer the response as a string or object
      if (options.string || options.json)
        res.text = res.buffer
          ? res.buffer.toString('utf8')
          : yield rawBody(res, { encoding: options.string || true })
      // buffer the response as JSON
      if (options.json) try {
        res.body = JSON.parse(res.text)
      } catch (err) {
        debug('"%s" is not valid JSON', uri)
      }

      return res
    }

    function request() {
      return new Promise(function (resolve, reject) {
        var called = false

        // timeout
        // note: timeout is only for the response,
        // not the entire request
        var id = setTimeout(function () {
          debug('timeout exceeded for %s %s', o.method, o.href)
          var err = new Error('timeout of ' + timeout + 'ms exceeded for "' + o.href + '"')
          err.url = o
          next(err)
        }, timeout)

        req = (securrrr ? https : http).request(o)
        req.once('response', next)
        req.once('error', next)
        req.end()

        function next(err, res) {
          if (called) {
            // dump the stream in case there are any
            // to avoid any possible leaks
            if (res) res.resume()
            return
          }

          called = true
          clearTimeout(id)

          if (!(err instanceof Error)) {
            res = err
            err = null
          }

          // kill the request, specifically for timeouts
          // to do: tests for this #7
          if (err) req.abort()

          if (retries && (err
            || (res && status.retry[res.statusCode])
          )) {
            debug('retrying %s %s', o.method, o.href)
            retries--
            resolve(request())
          } else if (err) {
            debug('received error "%s" with "%s"', err.message, o.href)
            reject(err)
          } else {
            resolve(res)
          }
        }
      })
    }
  }
}
