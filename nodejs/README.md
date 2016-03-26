Building bin/node
=================

This directory contains all related to nodejs. `webcast-osx-audio` only works
for node 0.10.38. So, the version shipped with `mkchromecast` is that one to
operate correctly.

To build node, just execute;

```
./recompile_node.sh
```

This will install everything in `mkchromecast/nodejs/node-0.10.38`.
