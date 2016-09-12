var extend = require( 'extend' );
var findParent = require( './find-parent' );
var falafel = require( './falafel-helper' );

var ignore = require( 'esformatter-ignore' );

module.exports = {
  setOptions: function ( opts ) {
    var me = this;
    opts = opts || { };
    me.opts = opts;

    var jsxOptions = opts.jsx || { };

    me.jsxOptions = extend( true, {
      formatJSX: true,
      attrsOnSameLineAsTag: true,
      maxAttrsOnTag: null,
      firstAttributeOnSameLine: false,
      alignWithFirstAttribute: true
    }, jsxOptions );

    if ( me.jsxOptions.maxAttrsOnTag < 1 ) {
      me.jsxOptions.maxAttrsOnTag = 1;
    }

    var htmlOptions = jsxOptions.htmlOptions || { };
    me.htmlOptions = extend( true, {
      brace_style: 'collapse', //eslint-disable-line
      indent_char: ' ', //eslint-disable-line
      //indentScripts: "keep",
      indent_size: 2, //eslint-disable-line
      max_preserve_newlines: 2, //eslint-disable-line
      preserve_newlines: true, //eslint-disable-line
      //indent_handlebars: true
      unformatted: require( './default-unformatted' ),
      wrap_line_length: 160 //eslint-disable-line
    }, htmlOptions );
  },

  stringBefore: function ( code ) {
    var me = this;

    me.jsxElements = me.jsxElements || [ ];
    var jsxElements = [ ];

    if ( !me.jsxOptions.formatJSX ) {
      return code;
    }
    me._ignore = me._ignore || [ ];

    var _ignore = Object.create( ignore );
    me._ignore.push( _ignore );

    code = _ignore.stringBefore( code );

    me._staticProps = me._staticProps || [ ];

    var staticProps = [ ];

    var ast = falafel( code, function ( node ) {

      if ( node.type === 'AwaitExpression' ) {
        node.update( node.source().replace( /^await/, '/*__await_token__*/' ) );
      }

      if ( node.type === 'FunctionDeclaration' ) {
        node.update( node.source().replace( /^async/, '/*__async_token__*/' ) );
      }

      if ( node.type === 'ExportNamedDeclaration' ) {
        var nodeSource = node.source();
        nodeSource = nodeSource.replace( /\/\*.*?\*\//g, ' ' );

        if ( !node.declaration && nodeSource.match( /\bfrom\s*['"]/ ) ) {
          node.update( node.source().replace( /^export/, 'import/*___fake_import_token__*/' ) );
        }
      }
      if ( node.type === 'Decorator' ) {
        node.update( node.source().replace( /^\s*@/, '____decorator__at_sign___' ) + ';/*__decorator__semi__*/' );
      }
      if ( node.type === 'SpreadProperty' ) {
        var _source = node.source().replace( /^\s*\.\.\./, '____esfmt_spread_sign___:' );
        node.update( _source );
      }
      if ( node.type === 'ClassProperty' ) {
        var staticIdx = staticProps.length;
        staticProps.push( {
          loc: node.loc,
          code: node.source()
        } );
        //console.log(node);
        node.update( '/*__ESFORMATTER__STATIC_PROPS__' + staticIdx + '__*/' );
      }

      if ( node.type === 'JSXElement'
        && !findParent( node, 'JSXElement' ) ) {
        var index = jsxElements.length;

        jsxElements.push( {
          loc: node.loc, code: node.source()
        } );

        node.update( '<__ESFORMATTER__JSX_NODE_0_' + index + ' />' );
      }
    } );

    me.jsxElements.push( jsxElements );
    me._staticProps.push( staticProps );

    return ast.toString();
  },

  _restoreJSXElements: function ( source ) {
    var me = this;
    //new RegExp( '<__JSXExpression_0_' + idx + '\\s\\/>' )
    var jsxElements = me.jsxElements.pop();

    jsxElements = jsxElements || [ ];

    jsxElements.forEach( function ( entry, idx ) {
      var container = entry.code;
      var rx = new RegExp( '<__ESFORMATTER__JSX_NODE_0_' + idx + '\\s\\/>' );

      // this is causing bug#13 using split/join fixed the issue
      // source = source.replace( rx, container );
      source = source.split( rx ).join( container );
    } );
    return source;
  },
  _restoreStaticProps: function ( source ) {
    var me = this;

    var staticProps = me._staticProps.pop();

    staticProps = staticProps || [ ];

    staticProps.forEach( function ( entry, idx ) {
      var container = entry.code;
      var rx = new RegExp( '\\/\\*__ESFORMATTER__STATIC_PROPS__' + idx + '__\\*\\/' );

      // this is causing bug#13 using split/join fixed the issue
      // source = source.replace( rx, container );
      source = source.split( rx ).join( container );
    } );
    return source;
  },
  stringAfter: function ( code ) {
    var me = this;

    if ( !me.jsxOptions.formatJSX ) {
      return code;
    }

    code = me._restoreJSXElements( code );

    // restore the static props
    // TODO: format the static props
    code = me._restoreStaticProps( code );

    var jsxOptions = me.jsxOptions;
    var htmlOptions = me.htmlOptions;

    var formatter = require( './format-jsx' ).create( htmlOptions, jsxOptions, me.opts );

    var ast = falafel( code, function ( node ) {
      if ( node.type !== 'JSXElement' ) {
        return;
      }
      var conditionalParent = findParent( node, 'ConditionalExpression' );
      if ( conditionalParent ) {
        var formatted = formatter.format( node );
        node.update( formatted );
        return;
      }
    } );

    code = ast.toString();

    // replace the spread operators
    code = code.replace( /____esfmt_spread_sign___\s*:\s*/g, '...' );

    // replace the NamedExports
    code = code.replace( /import\s+\/\*___fake_import_token__\*\//g, 'export' );

    // replace async/await
    code = code.replace( /\/\*__await_token__\*\//g, 'await' );
    code = code.replace( /\/\*__async_token__\*\/\s*\n*/g, 'async ' );

    ast = falafel( code, function ( node ) {
      // support for ES7 Decorators
      if ( node.type === 'CallExpression' && node.callee.source().indexOf( '____decorator__at_sign___' ) > -1 ) {
        node.callee.update( node.callee.source().replace( '____decorator__at_sign___', '@' ) );
      }
      if ( node.type === 'Identifier' && node.source().indexOf( '____decorator__at_sign___' ) > -1 ) {
        node.update( node.source().replace( '____decorator__at_sign___', '@' ) );
      }
      if ( node.type !== 'JSXElement' ) {
        return;
      }

      var formatted;
      if ( !findParent( node, 'JSXElement' ) ) {
        formatted = formatter.format( node );
        node.update( formatted );
      }
    } );

    code = ast.toString();

    // this is to make sure all decorators comments were removed from the source
    code = code.replace( /;\s*\/\*__decorator__semi__\*\//g, '' );

    var _ignore = me._ignore.pop();

    code = _ignore.stringAfter( code );
    return code;
  }
};
