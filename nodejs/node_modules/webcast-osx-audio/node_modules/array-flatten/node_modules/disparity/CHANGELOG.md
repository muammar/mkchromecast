# disparity changelog

## v2.0.0 (2015/04/03)

 - change API so all methods have same signature (str1, str2, opts).
 - merge CLI options `--unified --no-color ` into `--unified-no-color`.
 - better error messages on the CLI.
 - show paths on chars diff as well (if supplied) or fallback to
   `disparity.removed` and `disparity.added`.

## v1.3.1 (2015/04/01)

 - fix line number alignment.

## v1.3.0 (2015/04/01)

 - add support for custom colors.
 - update unified color scheme.
 - simplify line splitting logic.
 - improve way strings are colorized (avoids `\n` and `\r` chars).

## v1.2.0 (2015/04/01)

 - add `unifiedNoColor` support.

## v1.1.0 (2015/04/01)

 - allow override of `removed` and `added` strings.

## v1.0.0 (2015/04/01)

 - initial release
