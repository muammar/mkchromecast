#!/bin/bash
browserify test/ok.js | node | bin/cmd.js \
    || (echo FAIL test/ok.js; exit 1) || exit 1

browserify test/ok-trailing-comment.js \
    || (echo FAIL test/ok-trailing-comment.js; exit 1) || exit 1

browserify test/fn-call.js | node | bin/cmd.js \
    || (echo FAIL test/fn-call; exit 1) || exit 1

browserify test/fn-src | node | bin/cmd.js \
    || (echo FAIL test/fn-src; exit 1) || exit 1

browserify test/fail.js | node | bin/cmd.js \
    && echo FAIL test/fail.js && exit 1

browserify test/fail-return.js | node | bin/cmd.js \
    && echo FAIL test/fail-return.js && exit 1

browserify test/fail-delete | node | bin/cmd.js \
    && echo FAIL test/fail-delete && exit 1

browserify test/fail-scope | node | bin/cmd.js \
    && echo FAIL test/fail-scope && exit 1

echo OK
