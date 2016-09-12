# Rocambole [![Build Status](https://secure.travis-ci.org/millermedeiros/rocambole.svg?branch=master)](https://travis-ci.org/millermedeiros/rocambole)

![rocambole](https://raw.github.com/millermedeiros/rocambole/master/rocambole.jpg)

Recursively walk and add extra information/helpers to [Esprima / Mozilla
SpiderMonkey Parser API](http://esprima.org/doc/index.html#ast) compatible AST.

The main difference between other tools is that it also keeps information about
tokens and white spaces and it is meant to be used to transform the tokens and
not the string values itself.

This library is specially useful for non-destructive AST manipulation.


## Inspiration

This module was heavily inspired by
[node-falafel](https://github.com/substack/node-falafel) and
[node-burrito](https://github.com/substack/node-burrito) but I needed more
information than what is currently available on falafel (specially about
tokens, empty lines and white spaces) and also needed to do the node traversing
on the opposite order (start from leaf nodes). The amount of changes required
to introduce the new features and the differences on the concept behind the
tool justified a new project.

It was created mainly to be used on
[esformatter](https://github.com/millermedeiros/esformatter/).



## Extra Tokens

Besides all the regular tokens returned by `esprima` we also add a few more
that are important for non-destructive transformations:

 * `WhiteSpace`
   - Can store multiple white spaces (tabs are considered white space, line
     breaks not). Important if you want to do non-destructive replacements that
     are white-space sensitive.
   - Multiple subsequent white spaces are treated as a single token.
 * `LineBreak`
 * `LineComment`
 * `BlockComment`

It's way easier to rebuild the JS string if the tokens already have line breaks
and comments. It's also easier to identify if previous/next/current token is a
LineBreak or Comment (sometimes needed for non-destructive transformations).

Rocambole structure might change in the future to keep the extraneous tokens
outside the `tokens` array and also add an option to toggle the behavior.
([issue #7](https://github.com/millermedeiros/rocambole/issues/7))


## Extra Properties

Each Node have the following extra properties/methods:

  - `parent` : Node|undefined
  - `toString()` : string
  - `next` : Node|undefined
  - `prev` : Node|undefined
  - `depth` : Number
  - `startToken` : Token
  - `endToken` : Token

Each token also have:

 - `prev` : Token|undefined
 - `next` : Token|undefined

BlockComment also have:

  - `originalIndent`: String|undefined

To get a better idea of the generated AST structure try out
[rocambole-visualize](http://piuccio.github.io/rocambole-visualize/).


## Linked List

You should **treat the tokens as a linked list instead of reading the
`ast.tokens` array** (inserting/removing items from a linked list is very cheap
and won't break the loop). You should grab a reference to the `node.startToken`
and get `token.next` until you find the desired token or reach the end of the
program. To loop between all tokens inside a node you can do like this:

```js
var token = node.startToken;
while (token !== node.endToken.next) {
    doStuffWithToken(token);
    token = token.next;
}
```

The method `toString` loops through all tokens between `node.startToken` and
`node.endToken` grabbing the `token.raw` (used by comments) or `token.value`
properties. To implement a method similar to falafel `update()` you can do
this:

```js
function update(node, str){
    var newToken = {
        type : 'Custom', // can be anything (not used internally)
        value : str
    };
    // update linked list references
    if ( node.startToken.prev ) {
        node.startToken.prev.next = newToken;
        newToken.prev = node.startToken.prev;
    }
    if ( node.endToken.next ) {
        node.endToken.next.prev = newToken;
        newToken.next = node.endToken.next;
    }
    node.startToken = node.endToken = newToken;
}
```


## Helpers

I plan to create helpers as separate projects when possible.

 - [rocambole-token](https://github.com/millermedeiros/rocambole-token): helpers for token manipulation/traversal
 - [rocambole-node](https://github.com/millermedeiros/rocambole-node): helpers for node manipulation/traversal
 - [rocambole-whitespace](https://github.com/millermedeiros/rocambole-whitespace): helpers for whitespace manipulation
 - [rocambole-linebreak](https://github.com/millermedeiros/rocambole-linebreak): helpers for line break manipulation
 - [rocambole-indent](https://github.com/millermedeiros/rocambole-indent): helpers for indentation


## API


### rocambole.parse(source, [opts])

Parses a string and instrument the AST with extra properties/methods.

```js
var rocambole = require('rocambole');
var ast = rocambole.parse(string);
console.log( ast.startToken );
// to get a string representation of all tokens call toString()
console.log( ast.toString() );
```

You can pass custom options as the second argument:

```js
rocambole.parse(source, {
    loc: true,
    // custom options are forwarded to the rocambole.parseFn
    ecmaFeatures: {
        arrowFunctions: true
    }
});
```

**IMPORTANT:** rocambole needs the `range`, `tokens` and `comment` info to
build the token linked list, so these options will always be set to `true`.

### rocambole.parseFn:Function

Allows you to override the function used to parse the program. Defaults to
`esprima.parse`.

```js
// espree is compatible with esprima AST so things should work as expected
var espree = require('espree');
rocambole.parseFn = espree.parse;
rocambole.parseContext = espree;
```

### rocambole.parseContext:Object

Sets the context (`this` value) of the `parseFn`. Defaults to `esprima`.

### rocambole.parseOptions:Object

Sets the default options passed to `parseFn`.

```js
// default values
rocambole.parseOptions = {
    // we need range/tokens/comment info to build the tokens linked list!
    range: true,
    tokens: true,
    comment: true
};
```

### rocambole.moonwalk(ast, callback)

The `moonwalk()` starts at the leaf nodes and go down the tree until it reaches
the root node (`Program`). Each node will be traversed only once.

```js
rocambole.moonwalk(ast, function(node){
    if (node.type == 'ArrayExpression'){
        console.log( node.depth +': '+ node.toString() );
    }
});
```

Traverse order:

```
 Program [#18]
 `-FunctionDeclaration [#16]
   |-BlockStatement [#14]
   | |-IfStatement [#12]
   | | |-BynaryExpression [#9]
   | | | |-Identifier [#4]
   | | | `-Literal [#5]
   | | `-BlockStatement [#10]
   | |   `-ExpressionStatement [#6]
   | |     `-AssignmentExpression [#3]
   | |       |-Identifier [#1 walk starts here]
   | |       `-Literal [#2]
   | `-VariableDeclaration [#13]
   |   `-VariableDeclarator [#11]
   |     |-Identifier [#7]
   |     `-Literal [#8]
   `-ReturnStatement [#17]
     `-Identifier [#15]
```

This behavior is very different from node-falafel and node-burrito.


### rocambole.walk(ast, callback)

It loops through all nodes on the AST starting from the root node (`Program`),
similar to `node-falafel`.

```js
rocambole.walk(ast, function(node){
    console.log(node.type);
});
```


## Popular Alternatives

 - [burrito](https://github.com/substack/node-burrito)
 - [falafel](https://github.com/substack/node-falafel)



## Unit Tests

Besides the regular unit tests we also use
[istanbul](https://github.com/yahoo/istanbul) to generate code coverage
reports, tests should have at least 95% code coverage for statements, branches
and lines and 100% code coverage for functions or travis build will fail.

We do not run the coverage test at each call since it slows down the
performnace of the tests and it also makes it harder to see the test results.
To execute tests and generate coverage report call `npm test --coverage`, for
regular tests just do `npm test`.

Coverage reports are not committed to the repository since they will change at
each `npm test --coverage` call.



## License

MIT

