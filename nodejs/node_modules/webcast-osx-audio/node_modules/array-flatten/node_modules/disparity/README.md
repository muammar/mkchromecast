# disparity

Colorized string diff ideal for text/code that spans through multiple lines.

This is basically just a wrapper around
[diff](https://www.npmjs.com/package/diff) and
[ansi-styles](https://www.npmjs.com/package/ansi-styles) + line numbers and
omitting lines that don't have changes and/or that wouldn't help user identify
the diff "context".

We also replace some *invisible* chars to make it easier to understand what
really changed from one file to another:

 - `\r` becomes `<CR>`
 - `\n` becomes `<LF>`
 - `\t` becomes `<tab>`

Created mainly to be used by
[esformatter](https://www.npmjs.com/package/esformatter) and other tools that
might need to display a nice looking diff of source files.


## API

```js
var disparity = require('disparity');
```

### chars(oldStr, newStr[, opts]):String

Diffs two blocks of text, comparing character by character and returns
a `String` with ansi color codes.

```js
var diff = disparity.chars(file1, file2);
console.log(diff);
```

Will return an empty string if `oldStr === newStr`;

```js
// default options
var opts = {
  // how many lines to display before/after a line that contains diffs
  context: 3,
  // file paths displayed just before the diff
  paths: [disparity.removed, disparity.added]
};
```

![screenshot char diff](https://raw.githubusercontent.com/millermedeiros/disparity/master/screenshots/chars.png)

### unified(oldStr, newStr[, opts]):String

Returns ansi colorized [unified
diff](http://en.wikipedia.org/wiki/Diff_utility#Unified_format).

Will return an empty string if `oldStr === newStr`;

```js
var diff = disparity.unified(file1, file2, {
  paths: ['test/file1.js', 'test/file2.js']
});
console.log(diff);
```

![screenshot unified diff](https://raw.githubusercontent.com/millermedeiros/disparity/master/screenshots/unified.png)

### unifiedNoColor(oldStr, newStr[, opts]):String

Returns [unified diff](http://en.wikipedia.org/wiki/Diff_utility#Unified_format).
Useful for terminals that [doesn't support colors](https://www.npmjs.com/package/supports-color).

Will return an empty string if `oldStr === newStr`;

```js
var diff = disparity.unifiedNoColor(file1, file2, {
  paths: ['test/file1.js', 'test/file2.js']
});
console.log(diff);
```

![screenshot unified diff no color](https://raw.githubusercontent.com/millermedeiros/disparity/master/screenshots/unified_no_color.png)

### removed:String

String used on the diff headers to say that chars/lines was removed.

```js
// default value
disparity.removed = 'removed';
```

### added:String

String used on the diff headers to say that chars/lines was added.

```js
// default value
disparity.added = 'added';
```

### colors:Object

Object containing references to all the colors used by disparity.

If you want a different output than `ansi` (eg. HTML) you can replace the color
values:

```js
// wrap blocks into custom tags
disparity.colors = {
  // chars diff
  charsRemoved: { open: '<bggreen>', close: '</bggreen>' },
  charsAdded: { open: '<bgred>', close: '</bgred>' },

  // unified diff
  removed: { open: '<red>', close: '</red>' },
  added: { open: '<green>', close: '</green>' },
  header: { open: '<yellow>', close: '</yellow>' },
  section: { open: '<magenta>', close: '</magenta>' }
};
```

## CLI

`disparity` also have a command line interface:

```
disparity [OPTIONS] <file_1> <file_2>

Options:
  -c, --chars           Output char diff (default mode).
  -u, --unified         Output unified diff.
  --unified-no-color    Don't output colors.
  -v, --version         Display current version.
  -h, --help            Display this help.
```

PS: cli can only compare 2 external files at the moment, no `stdin` support.

## License

Released under the MIT license.

