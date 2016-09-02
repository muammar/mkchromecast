# Project Structure / Contributing


Check open issues for a list of features/bugs that we would like to see
fixed/implemented.


## EditorConfig

To make sure we all use the same basic settings (indent, EOL, EOF) please
install [EditorConfig](http://editorconfig.org/#download). It will make code
review/merge easier.


## New Features / Bugs

The easiest way to add new features and fix bugs is to create a test file with
mixed input and use the [rocambole-visualize](http://piuccio.github.io/rocambole-visualize/)
or the [esprima parser demo](http://esprima.org/demo/parse.html) to visualize
the syntax tree and implement each step separately.

A good example of a commit that fixes a bug:
https://github.com/millermedeiros/esformatter/commit/ebafa00f76 and a good
example of a commit that introduces a new feature:
https://github.com/millermedeiros/esformatter/commit/e7d82cc81e



## How it works?

We augment the AST with
[rocambole](https://github.com/millermedeiros/rocambole), so every `node` have
[extra
properties](https://github.com/millermedeiros/rocambole#extra-properties) that
can be used to traverse the AST (similar to the DOM).

The whole process is very similar to working with the DOM. Don't feel
intimidated by *complex names* like `ConditionalExpressionConsequent`, use the
[esprima parser demo](http://esprima.org/demo/parse.html) and/or
[rocambole-visualize](http://piuccio.github.io/rocambole-visualize/) as reference
and you should be good to go.

We rely on some external libraries to add/remove/find tokens:

 - [rocambole-token](https://github.com/millermedeiros/rocambole-token)
 - [rocambole-whitespace](https://github.com/millermedeiros/rocambole-whitespace)
 - [rocambole-linebreak](https://github.com/millermedeiros/rocambole-linebreak)
 - [rocambole-indent](https://github.com/millermedeiros/rocambole-indent)

### Recursion

The recursion starts from the *leaf nodes* and moves till it reaches the
`Program` root. It works this way because child nodes usually affects the
parent nodes structure (specially line breaks), that gives the option for the
parent node to override the child node behavior if needed.

### Adding/Removing line breaks and white spaces

The `format` method of each object exposed on `lib/hooks.js` is called once for
each matching `node`. The `format` method is responsible for adding/removing
line breaks and white spaces based on the node structure and config options.

### Indentation

We do the indentation after the whole process; that is necessary since the
parent nodes affects the indentation of the child nodes (line breaks might be
added or removed during the process).

Indentation starts from root node and moves up the tree until it reaches the
leaf nodes (this allow child nodes to decrement the indent added by parent
nodes and is more intuitive).

The core logic is handled by `lib/indent.js` and
[rocambole-indent](https://github.com/millermedeiros/rocambole-indent), but
most nodes actually require specific rules to detect the *indent edges*, so
most `lib/hooks` also implement a method `getIndentEdges` that can return:

 - *falsy* value: means the node should **not** be indented;
 - single `IndentEdge` object: indent in between `startToken` and `endToken`;
 - array containing multiple `IndentEdge` objects and/or *falsy* values: indent
   inside any `IndentEdge` object and ignore *falsy* values.

The `IndentEdge` is just a Plain JavaScript Object with the properties:

 - `startToken:Token`: points to token that delimits the indent start (eg. a token
   with value "{")
 - `endToken:Token`: pointer to a token that sets the last token that should be
   indented (eg. a line break just before `]`)
 - `level:Int` (optional): sets how many indents should be added for that
   `IndentEdge`, that is very useful for cases where you might have different
   options for the same parent node (eg. the `FunctionExpression` hook also
   handles the `ParameterList` indentation); if `level === 0` that *edge* is not
   indented, if `level < 0` we decrement one indent level.

If the hook doesn't implement `getIndentEdges` we consider `node.startToken`
and `node.endToken` as the default edge. We only indent nodes that have a value
greater than zero on the configuration options.

Also important to notice that we only add `Indent` tokens to the beginning of
lines.

The reason why we decided to handle indentation as multiple `IndentEdge`s is
because there are many cases where the lines between `node.startToken` and
`node.endToken` are not really the *range* that you want to indent (eg. on
`IfStatement` you what to indent the `test`, `consequent` and `alt` but not the
lines that open/close the curly braces). Trying to handle all the cases
automatically is a path doomed to failure. This is the most flexible
abstraction, and cleanest implementation, that we could think of so far but it
is indeed complex; it would be way easier if we had a real CST (concrete syntax
tree) but that ship already sailed.



## Branches and Pull Requests

We will create `-wip` branches (work in progress) for *unfinished* features
(mostly because of failing tests) and try to keep master only with *stable*
code. We will try hard to not rewrite the commit history of `master` branch but
will do it for `-wip` branches.

Sometimes we even open pull requests just to notify/discuss the work in
progress, specially if it's a new feature or a bug that will take many days to
solve.

If you plan to implement a new feature check the existing branches, I will push
all my local `-wip` branches if I don't complete the feature in the same day.
So that should give a good idea on what I'm currently working.

Try to split your pull requests into small chunks (separate features), that way
it is easier to review and merge. But feel free to do large refactors as well,
will be harder to merge but we can work it out. - see [issue-guidelines for
more info about good pull
requests](https://github.com/necolas/issue-guidelines/blob/master/CONTRIBUTING.md#pull-requests)



## Default Settings

The default settings should be as *conservative* as possible, [Google
JavaScript Style
Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
is a good reference.

We have plans to support other presets like
[Idiomatic.js](https://github.com/rwldrn/idiomatic.js/) and [jQuery Style
Guide](http://contribute.jquery.org/style-guide/js) as external plugins.



## Tests

Tests are done by comparing the result of `esformatter.parse()` of files with
name ending on `-in.js` with the files `-out.js`. The folder
`test/compare/default` tests the default settings and files inside
`test/compare/custom` tests custom settings. Tests inside the `compare/custom`
folder should try to test the *opposite* of the default settings whenever
possible.

To run the tests install the `devDependencies` by running `npm install`
(only required once) and then run `npm test`.

`mocha` source code was edited to provide better error
messages. See [mocha/issues/710](https://github.com/visionmedia/mocha/pull/710)
for more info.

```sh
# runs all tests
npm test
# bail stops at first failed test
BAIL=true npm test
# GREP is used to filter the specs to run (only specs that contain "indent" in the name)
GREP='indent' npm test
# can also use "INVERT=true" to only execute specs that doesn't contain "cli" in the name
GREP=cli INVERT=true npm test
# to set the mocha reporter
REPORTER=dot npm test
# enable logging for the specified module
DEBUG=rocambole:br:* npm test
```

**protip:** files starting with double underscore (`__`) are on our
`.gitignore` file and won't be commited, so I usually have a `__tmp-in.js` and
`__tmp-out.js` test files that contains the bare minimum code that reproduces
the bug that I'm trying to fix and execute that with
`DEBUG=esformatter:*:*,rocambole:*:* GREP=tmp npm test` to get all the logs.


## IRC

We have an IRC channel [#esformatter on
irc.freenode.net](http://webchat.freenode.net/?channels=esformatter) for quick
discussions about the project development/structure.



