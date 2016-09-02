var findParent = require( './find-parent' );
var falafel = require( './falafel-helper' );
var iterateReverse = require( './iterate-reverse' );
var esformatter = require( 'esformatter' );

function replaceJSXExpressionContainer( source ) {
  var response = [ ];
  var index;

  var ast = falafel( source, function ( node ) {
    if ( node.type === 'JSXExpressionContainer' ) {
      var attribute = false;
      var replacement;
      index = response.length;

      if ( findParent( node, 'JSXAttribute' ) ) {
        attribute = true;
        replacement = '"__JSXattribute_0_' + index + '"';
      } else {
        replacement = '<__JSXExpression_0_' + index + ' />';
      }

      var loc = node.loc || node.node.loc;

      response.push( {
        jsxAttribute: attribute,
        code: node.source(),
        column: loc.start.column
      } );

      node.update( replacement );
    }
  } );



  return { containers: response, source: ast.toString() };
}

function removeEmptyLines( code ) {
  return code.split( '\n' ).filter( function ( line ) {
    return (line.trim() !== '');
  } ).join( '\n' );
}

function alingText( source, node, htmlOptions ) {
  var jsxParent = findParent( node, 'JSXElement' );
  var column = node.loc.start.column;
  if ( jsxParent ) {
    column = node.loc.start.column - jsxParent.loc.start.column;
  }
  // var jsxExpression = findParent( node, 'JSXExpressionContainer' );
  // if ( jsxExpression ) {
  //   column += 2;
  // }
  var first = false;
  return removeEmptyLines( source ).split( '\n' ).map( function ( line ) {
    line = line.replace( /\s+$/g, '' );
    if ( !first ) {
      first = true;
      return line;
    }
    var alingWith = (column + 1);
    if ( alingWith < 0 ) {
      return line;
    }
    return ( (new Array( alingWith )).join( htmlOptions.indent_char )) + line;
  } ).join( '\n' );
}

function addSpaces( container, column ) {
  var parts = container.split( '\n' );
  var first = false;

  parts = parts.map( function ( line ) {
    if ( !first ) {
      first = true;
      return line;
    }
    return (new Array( column + 1 )).join( ' ' ) + line;
  } );

  return parts.join( '\n' );
}

function restoreContainers( source, containers, space ) {

  iterateReverse( containers, function ( entry, idx ) {
    var container = entry.code;
    var column = entry.column;
    var rx = entry.jsxAttribute ?
      new RegExp( '"__JSXattribute_0_' + idx + '"' )
      : new RegExp( '<__JSXExpression_0_' + idx + '\\s\\/>' );

    if ( !entry.jsxAttribute ) {
      container = addSpaces( container, column );
    }

    if ( typeof space !== 'string' ) {
      space = ' '; // 1 space by default
    }
    // this line was causing bug#13
    // source = source.replace( rx, container.replace( /^\{\s*/, '{' + space ).replace( /\s*\}$/, space + '}' ) );
    source = source.split( rx ).join( container.replace( /^\{\s*/, '{' + space ).replace( /\s*\}$/, space + '}' ) );
  } );

  return source;
}

module.exports = {
  create: function ( htmlOptions, jsxOptions, options ) {

    var ins = {
      htmlOptions: htmlOptions,
      jsxOptions: jsxOptions,
      _keepUnformatted: function ( tag ) {
        var me = this;
        var unformatted = me.htmlOptions.unformatted || [ ];

        return unformatted.indexOf( tag ) > -1;
      },
      prepareToProcessTags: function ( source ) {
        var me = this;
        var code = falafel( source, function ( node ) {
          if ( node.type === 'JSXElement' && !node.selfClosing ) {
            if ( node.children && node.children.length > 0 ) {
              if ( !me._keepUnformatted( node.openingElement.name.name ) ) {
                node.openingElement.update( node.openingElement.source() + '\n' );
                node.closingElement.update( '\n' + node.closingElement.source() );
              } else {

                var childrenSource = node.children.map( function ( n, idx ) {
                  var src = n.source().replace( /\n/g, ' ' ).replace( /\s+/g, ' ' );

                  var prev = node.children[ idx - 1 ] || { };
                  var next = node.children[ idx + 1 ] || { };

                  if ( src.trim() === ''
                    && prev.type === 'JSXExpressionContainer'
                    && next.type === 'JSXExpressionContainer' ) {
                    src = '';
                  }
                  return src;
                } ).join( '' ).trim();

                var openTag = node.openingElement.source().replace( /\n/g, ' ' ).replace( /\s+/g, ' ' ).trim();
                var closeTag = node.closingElement.source().replace( /\n/g, ' ' ).replace( /\s+/g, ' ' ).trim();
                var nSource = openTag + childrenSource + closeTag;

                node.update( nSource );
              }
            }
          }
        } );
        return removeEmptyLines( code.toString() );
      //        return removeEmptyLines( ast.toString() );
      },
      operateOnOpenTags: function ( source ) {
        var me = this;

        // make sure tags are in a single line
        var ast = falafel( source, function ( node ) {
          if ( node.type === 'JSXOpeningElement' ) {
            if ( node.attributes && node.attributes.length > (me.jsxOptions.maxAttrsOnTag || 0) ) {
              if ( node.selfClosing ) {
                node.update( node.source().split( /\n/ ).map( function ( line ) {
                  return line.trim();
                } ).join( ' ' ) );
              }
            }
          }
        } );

        ast = falafel( ast.toString(), function ( node ) {
          if ( node.type === 'JSXOpeningElement' ) {
            if ( node.attributes && node.attributes.length > (me.jsxOptions.maxAttrsOnTag || 0) ) {
              var first = node.attributes[ 0 ];
              var firstAttributeInSameLine = me.jsxOptions.firstAttributeOnSameLine;

              var alignWith = me.jsxOptions.alignWithFirstAttribute ? first.loc.start.column + 1 : node.loc.start.column + 3;
              var tabPrefix = (new Array( alignWith )).join( ' ' );

              var index = 0;
              //console.log( node.attributes );
              node.attributes.forEach( function ( cNode ) {
                index++;
                if ( firstAttributeInSameLine && index === 1 ) {
                  //first = false;
                  return cNode;
                }

                cNode.update( '\n' + tabPrefix + cNode.source() );
              } );
            }
          }

        } );

        return ast.toString();
      },

      _recursiveFormat: function ( node ) {
        //console.log('node.expression.type', node.type, node.source());
        var originalSource = node.source();
        var source = originalSource;

        var code;

        try {

          if ( node.type === 'ObjectExpression' || node.type === 'ArrayExpression' ) {
            source = 'var __OE_AE_VAR_TOKEN__ = ' + source;
          }
          if ( node.type === 'BindExpression' && source.match( /^::/ ) ) {
            source = source.replace( '::', '' );
          }
          code = esformatter.format( source, options ).trim();

          if ( node.type === 'BindExpression' ) {
            code = '::' + code;
          }

          falafel( code, function ( _node ) {
            // this deals with the expressions that can be either object expressions or arrays
            if ( _node.type === 'VariableDeclarator' && _node.id.name === '__OE_AE_VAR_TOKEN__' ) {
              if ( _node.init.type === 'ObjectExpression' || _node.init.type === 'ArrayExpression' ) {
                code = _node.init.source();
                code = code.replace( /\n/g, '' );
              }
            }
          } );
        } catch (ex) {
          code = originalSource;
        }
        return code;
      },

      format: function ( ast, noAlign ) {
        var me = this;
        var source = ast.source();
        var response = replaceJSXExpressionContainer( source );

        var containers = response.containers;
        source = response.source;

        if ( !jsxOptions.attrsOnSameLineAsTag ) {
          source = me.prepareToProcessTags( source );
        }

        var beautifier = require( 'js-beautify' );

        source = beautifier.html( source, htmlOptions );

        if ( !jsxOptions.attrsOnSameLineAsTag ) {
          source = me.operateOnOpenTags( source );
        }

        if ( !noAlign ) {
          source = alingText( source, ast, htmlOptions );
        }

        source = restoreContainers( source, containers, jsxOptions.spaceInJSXExpressionContainers );

        if ( containers.length > 0 ) {
          var expressionContainers = { };
          var ast2 = falafel( source, function ( node ) {
            if ( node.type === 'JSXExpressionContainer' && !findParent( node, 'JSXExpressionContainer' ) ) {
              if ( node.expression.type === 'Literal' || node.expression.type === 'Identifier' ) {
                return;
              }
              //console.log('node.type', node.expression.type);
              //if ( node.expression.type === 'JSXElement' ) {
              //var f = me.format(node.expression, true);
              var idx = Object.keys( expressionContainers ).length;
              var token = '__##__TOKEN__##__' + idx + '_#_';
              //console.log('node.expression.type', node.expression.type, node.source());
              var formatted = node.expression.type === 'JSXElement' ?
                me.format( node.expression, true ) :
                me._recursiveFormat( node.expression );

              expressionContainers[ token ] = {
                token: token,
                formatted: formatted,
                index: idx
              };

              node.expression.update( token );

            }
          } );

          source = ast2.toString().split( '\n' );

          source = source.map( function ( line ) {
            var keys = Object.keys( expressionContainers );
            keys.forEach( function ( key ) {
              var index = line.indexOf( key );
              if ( index > -1 ) {
                var parts = expressionContainers[ key ].formatted.split( '\n' ).map( function ( part, i ) {
                  if ( i === 0 ) {
                    return part;
                  }
                  return new Array( index + 1 ).join( ' ' ) + part;
                } );

                line = line.replace( key, parts.join( '\n' ) ).replace( /\s+$/, '' );
                delete expressionContainers[ key ];
              }
            } );
            return line.replace( /\s+$/, '' );
          } ).join( '\n' );

        }
        return source;
      // return source.split('\n').map(function (line) {
      //   return line.replace(/\s+$/, '');
      // }).join('\n');
      }
    };

    return ins;
  }
};
