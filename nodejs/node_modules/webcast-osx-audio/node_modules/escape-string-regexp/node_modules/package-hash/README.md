# package-hash

Generates a hash for an installed npm package, useful for salting caches.
[AVA](https://github.com/sindresorhus/ava) for example caches precompiled test
files. It generates a salt for its cache based on the various packages that are
used when compiling the test files.

`package-hash` can generate an appropriate hash based on the package location
(on disk) and the `package.json` file. This hash is salted with a hash
for the `package-hash` itself.

`package-hash` can detect when the package-to-be-hashed is a Git repository. In
the AVA example this is useful when you're debugging one of the packages used to
compile the test files. You can clone it locally and use `npm link` so AVA can
find the clone. The hash will include the HEAD (`.git/HEAD`) and its
corresponding ref (e.g. `.git/refs/heads/master`), any packed refs
(`.git/packed-refs`), as well as the diff (`git diff`) for any non-committed
changes. This makes it really easy to test your changes without having to
explicitly clear the cache in the parent project.

## Installation

```console
$ npm install --save package-hash
```

## Usage

```js
const sync = require('package-hash').sync

const hash = sync(require.resolve('babel-core/package.json'))
```

`sync()` can be called with a directory or file path. File paths are translated
to directories using
[`path.dirname()`](https://nodejs.org/api/path.html#path_path_dirname_p). The
path must exist. A `package.json` must exist within the directory.

To get the path to an npm package it's best to use
`require.resolve('the-name/package.json')`, since `require.resolve('the-name')`
may resolve to a subdirectory of the package.

You can provide multiple paths:

```js
const hash = sync([
  require.resolve('babel-core/package.json'),
  require.resolve('babel-preset-es2015/package.json')
])
```

An optional salt value can also be provided:

```js
const hash = sync(require.resolve('babel-core/package.json'), 'salt value')
```

Currently only a synchronous interface is available.

## API

### `sync(paths, salt?)`

`paths: string | string[]` ➜ can be a single directory or file path, or an array of paths.

`salt: Array | Buffer | Object | string` ➜ optional. If an `Array` or `Object` (not `null`) it is first converted to a JSON string.

## Compatibility

`package-hash` has been tested with Node 0.10 and above, including Windows
support. Note that `git diff` support is not available in Node 0.10.
