Building node and npm
=====================

This directory contains all related to nodejs. `webcast-osx-audio` only works
for `node 0.10.38`. So, **mkchromecast**  ships that version of `node` and also
`npm` to operate correctly and ease the updating of `node_modules` directory.

To build node, just execute;

```
./recompile_node.sh
```

This will install the package at `mkchromecast/nodejs/node-0.10.38`.
