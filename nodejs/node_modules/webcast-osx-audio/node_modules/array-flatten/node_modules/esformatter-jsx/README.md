# [esformatter](https://github.com/millermedeiros/esformatter)-jsx
> esformatter plugin: format javascript files that contain React JSX blocks

[![NPM Version](http://img.shields.io/npm/v/esformatter-jsx.svg?style=flat)](https://npmjs.org/package/esformatter-jsx)
[![Build Status](http://img.shields.io/travis/royriojas/esformatter-jsx.svg?style=flat)](https://travis-ci.org/royriojas/esformatter-jsx)

## Demo

Live demo: [esformatter-jsx](http://requirebin.com/embed?gist=0d67452e01754269660f)

### Usage with [JSFMT](https://github.com/ionutvmi/sublime-jsfmt) 

check this [guide](https://github.com/royriojas/esformatter-jsx/wiki/Usage-with-jsfmt)

### best configuration

If you're running into troubles with the formatting applied to your files I found this configuration to work the best:

```javascript
{
  "jsx": {
    "formatJSX": true, //Duh! that's the deafault
    "attrsOnSameLineAsTag": false, // move each attribute to its own line
    "maxAttrsOnTag": 3, // if lower or equal than 3 attributes, they will be kept on a single line
    "firstAttributeOnSameLine": true, // keep the first attribute in the same line as the tag
    "alignWithFirstAttribute": false, // do not align attributes with the first tag
    "spaceInJSXExpressionContainers": " ", // default to one space. Make it empty if you don't like spaces between JSXExpressionContainers
    "htmlOptions": {
      // put here the options for js-beautify.html
    }
  }
}
```

## Overview

**Esformatter-jsx** is a plugin for [esformatter](https://github.com/millermedeiros/esformatter) meant to allow the
code formatting of jsx files or js files with React code blocks, using [js-beautify](https://www.npmjs.com/package/js-beautify) to
beautify the "html like" syntax of the react components. **Use at your own risk**. I have tested this against complex JSX structures and seems to be workfing fine, but bugs might appear, so don't blame me :).

It works for my main use case and I hope it works for you too.

This plugin is based on [esformatter-jsx-ignore](https://github.com/royriojas/esformatter-jsx-ignore)

If you want a bit of history about what this plugin was develop, check:
- https://github.com/millermedeiros/esformatter/issues/242
- https://github.com/facebook/esprima/issues/74

So this plugin will turn this:
```js
var React = require('react');

var Hello = React.createClass({
render: function () {
return <div

className="hello-div">{this.props.message}</div>;
}
});

React.render(<Hello
message="world"/>,      document.body);
```

into:
```js
var React = require('react');

var Hello = React.createClass({
  render: function() {
    return <div className="hello-div">{this.props.message}</div>;
  }
});

React.render(<Hello message="world"/>, document.body);
```

## Installation

```sh
$ npm install esformatter-jsx --save-dev
```

## Config

Newest esformatter versions autoload plugins from your `node_modules` [See this](https://github.com/millermedeiros/esformatter#plugins)

Add to your esformatter config file:

In order for this to work, this plugin should be the first one! (I Know too picky, but who isn't).

```javascript
{
  "plugins": [
    "esformatter-jsx"
  ],
  // this is the section this plugin will use to store the settings for the jsx formatting
  "jsx": {
    // by default is true if set to false it works the same as esformatter-jsx-ignore
    "formatJSX": true,
    // keep the node attributes on the same line as the open tag. Default is true.
    // Setting this to false will put each one of the attributes on a single line
    "attrsOnSameLineAsTag": true,
     // how many attributes should the node have before having to put each
     // attribute in a new line. Default 1
    "maxAttrsOnTag": 1,
    // if the attributes are going to be put each one on its own line, then keep the first
    // on the same line as the open tag
    "firstAttributeOnSameLine": false,
    // default to one space. Make it empty if you don't like spaces between JSXExpressionContainers
    "spaceInJSXExpressionContainers": " ",
    // align the attributes with the first attribute (if the first attribute was kept on the same line as on the open tag)
    "alignWithFirstAttribute": true,
    "htmlOptions": { // same as the ones passed to js-beautifier.html
      "brace_style": "collapse",
      "indent_char": " ",
      "indent_size": 2,
      "max_preserve_newlines": 2,
      "preserve_newlines": true
      //wrap_line_length: 250
    }
  }
}
```

The `htmlOptions` are passed directly to [js-beautify](https://www.npmjs.com/package/js-beautify), please check its
documentation for all the possible options.

Or you can manually register your plugin:

```js
// register plugin
esformatter.register(require('esformatter-jsx'));
```

## Usage

```js
var fs = require('fs');
var esformatter = require('esformatter');
//register plugin manually
esformatter.register(require('esformatter-jsx'));

var str = fs.readFileSync('someKewlFile.js').toString();
var output = esformatter.format(str);
//-> output will now contain the formatted code
```

See [esformatter](https://github.com/millermedeiros/esformatter) for more options and further usage info.

## License

[MIT](License)
