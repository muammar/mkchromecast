# esformatter-semicolon-first

[esformatter](https://github.com/millermedeiros/esformatter) plugin to add
semicolon before `[` and `(` if they are the first things on the line.

created mainly to be used by [standard-format](https://github.com/maxogden/standard-format)

## Usage

Add to your esformatter config file:

```json
{
  "plugins": [
    "esformatter-semicolon-first"
  ]
}
```

Or you can manually register the plugin if not using `esformatter` directly:

```js
// register plugin
esformatter.register(require('esformatter-semicolon-first'));
```

# Config

By default we add at least one line break before the semicolon and remove line
breaks afterwards, but you can use the
`lineBreak.before['esformatter-semicolon-first']` and
`lineBreak.after['esformatter-semicolon-first']` to configure it tho.

```json
{
  "lineBreak": {
    "before": {
      "esformatter-semicolon-first": ">0"
    },
    "after": {
      "esformatter-semicolon-first": 0
    }
  }
}
```

## Examples

Given this input program:

```js
var x = 2
[1,2,3].map(function() {})

var y = 8
(function() {
  bar()
}())
```

It will output:

```js
var x = 2
;[1,2,3].map(function() {})

var y = 8
;(function() {
  bar()
}())
```

For more examples see the test files inside the `test/` folder.

## License

Released under the [MIT License](http://opensource.org/licenses/MIT).

