Building node and npm
=====================

This directory contains all related to nodejs. **mkchromecast**  ships a local
version of `node` and also `npm` to operate correctly and ease the updating of
`node_modules` directory.

To build node, just execute:

```
./recompile_node.sh $version
```

Example:

```
./recompile_node.sh 6.3.0
```

This will install the package at `mkchromecast/nodejs/node-$version`.

**Note**: I am now just using node shipped by Homebrew. I might remove this in
the future.
