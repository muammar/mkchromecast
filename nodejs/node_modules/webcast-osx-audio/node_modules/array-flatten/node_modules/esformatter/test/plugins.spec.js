//jshint node:true
/*global describe, it, beforeEach, afterEach*/
'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var esformatter = require('../lib/esformatter');
var esformatterOptions = require('../lib/options');
var rocambole = require('rocambole');
var testPlugin = require('esformatter-test-plugin');

var input = 'var foo=lorem?"bar":"baz";';
var output = 'var foo = lorem ? "bar" : "baz";';


describe('plugin API', function() {

  describe('> register plugin', function() {
    var plugin;

    beforeEach(function() {
      plugin = makePlugin();
      esformatter.register(plugin);
      esformatter.format(input);
    });

    afterEach(function() {
      esformatter.unregister(plugin);
    });

    it('should call setOptions and not override user set options', function() {
      expect(plugin.setOptions.count).to.eql(1);
      expect(plugin.setOptions.args[0].indent.value).to.eql('  ');
    });

    it('should call tokenBefore for each token', function() {
      expect(plugin.tokenBefore.count).to.eql(10);
      expect(plugin.tokenBefore.args.length).to.eql(10);
      expect(plugin.tokenBefore.args[0].value).to.eql('var');
      expect(plugin.tokenBefore.args[4].value).to.eql('lorem');
    });

    it('should call tokenAfter for each token', function() {
      expect(plugin.tokenAfter.count).to.eql(16);
      expect(plugin.tokenAfter.args.length).to.eql(16);
      expect(plugin.tokenAfter.args[0].value).to.eql('var');
      expect(plugin.tokenAfter.args[6].value).to.eql('lorem');
    });

    it('should call stringBefore at the begining of process', function() {
      expect(plugin.stringBefore.count).to.eql(1);
      expect(plugin.stringBefore.args).to.eql([input]);
    });

    it('should call stringAfter at end of process', function() {
      expect(plugin.stringAfter.count).to.eql(1);
      expect(plugin.stringAfter.args).to.eql([output]);
    });

    it('should call nodeBefore for each node', function() {
      expect(plugin.nodeBefore.count).to.eql(8);
      expect(plugin.nodeBefore.args[3].toString()).to.eql('foo');
    });

    it('should call nodeAfter for each node', function() {
      expect(plugin.nodeAfter.count).to.eql(8);
      expect(plugin.nodeAfter.args[3].toString()).to.eql('foo');
    });

    it('should call transformBefore once', function() {
      expect(plugin.transformBefore.count).to.eql(1);
      expect(plugin.transformBefore.args[0].type).to.eql('Program');
    });

    it('should call transformAfter once', function() {
      expect(plugin.transformAfter.count).to.eql(1);
      expect(plugin.transformAfter.args[0].type).to.eql('Program');
    });

    describe('> multiple calls', function() {
      it('should call plugin once per transform call', function() {
        esformatter.format(input);
        expect(plugin.transformAfter.count).to.eql(2);
        expect(plugin.transformAfter.args[1].type).to.eql('Program');

      });

      it('should not execute plugin if unregistered', function() {
        esformatter.unregisterAll();
        esformatter.format(input);
        expect(plugin.transformAfter.count).to.eql(1);
        expect(plugin.transformAfter.args[0].type).to.eql('Program');
      });
    });

  });

  describe('> load from node_modules', function() {
    var plugin1;
    var plugin2;

    beforeEach(function() {
      plugin1 = makePlugin();
      // this should be enough to ensure plugin methods are optional and that
      // multiple plugins are executed in a row.
      plugin2 = {
        // "transform" was deprecated on v0.4 but we still have a test for it
        // to make sure we are backwards compatible.
        transform: stub()
      };
      mockery.registerMock('esformatter-foo', plugin1);
      mockery.registerMock('bar', plugin2);
      mockery.enable();
    });

    afterEach(function() {
      mockery.deregisterAll();
      mockery.disable();
    });

    it('format: should load plugins from node_modules and register it', function() {
      esformatter.format(input, {
        plugins: ['esformatter-foo', 'bar']
      });

      expect(plugin1.stringBefore.count).to.eql(1);
      expect(plugin1.transformBefore.count).to.eql(1);
      expect(plugin1.transformAfter.count).to.eql(1);
      expect(plugin1.nodeAfter.count).to.eql(8);
      expect(plugin2.transform.count).to.eql(1);
      expect(plugin1.stringAfter.count).to.eql(1);
    });

    it('transform: should load plugins from node_modules and register it', function() {
      esformatter.transform(rocambole.parse(input), {
        plugins: ['esformatter-foo', 'bar']
      });

      expect(plugin1.stringBefore.count).to.eql(0);
      expect(plugin1.transformBefore.count).to.eql(1);
      expect(plugin1.transformAfter.count).to.eql(1);
      expect(plugin1.nodeAfter.count).to.eql(8);
      expect(plugin2.transform.count).to.eql(1);
      expect(plugin1.stringAfter.count).to.eql(0);
    });

    it('format: error message', function() {
      expect(function() {
        esformatter.format(input, {
          plugins: ['my-invalid-plugin']
        });
      }).to.throws(
        'Error: Cannot find plugin \'my-invalid-plugin\'. Make ' +
        'sure you used the correct name on the config file or run ' +
        '`npm install --save-dev my-invalid-plugin` to add it as a project ' +
        'dependency.'
      );
    });
  });

  describe('> execute in the right order', function() {
    var plugin;

    beforeEach(function() {
      plugin = makePlugin();
      esformatter.register(plugin);
      esformatter.format('\/\/ foo');
    });

    afterEach(function() {
      esformatter.unregister(plugin);
    });

    it('should call methods in the right order', function() {
      expect(plugin.callOrder).to.eql([
        'setOptions',
        'stringBefore',
        'transformBefore',
        'tokenBefore',
        'nodeBefore',
        'nodeAfter',
        'tokenAfter',
        'transformAfter',
        'stringAfter'
      ]);
    });
  });

  describe('> setOptions', function() {
    var plugin = testPlugin;
    var opts = {
      foo: 'ipsum'
    };

    beforeEach(function() {
      esformatter.register(plugin);
      esformatter.format(input, opts);
    });

    afterEach(function() {
      esformatter.unregister(plugin);
    });

    it('should set default options and allow user and plugin to override them', function() {
      var o = plugin.opts;
      // it clones the user proveid options object to avoid undesired side effects
      expect(o).not.to.eql(opts);
      // it should pass options object by reference
      expect(o).to.eql(esformatterOptions.get());
      // user should be able to override options
      expect(o.foo).to.eql('ipsum');
      // plugin should be able to create a new value
      expect(o.bar).to.eql(123);
      // plugin should be able to override a value
      expect(o.indent.ArrayExpression).to.eql(3);
      // default value
      expect(o.indent.value).to.eql('  ');
    });

    it('should pass esformatter instance as second argument', function() {
      // allows plugins to reuse esformatter logic
      expect(plugin.esformatter).to.equal(esformatter);
    });

  });

});


// extremely basic stub method, I know I could have used something more
// complex like sinon, but this is good enough for now
function stub(name, isIdentity) {
  var fn = function() {
    fn.count += 1;
    fn.args.push.apply(fn.args, arguments);
    if (this.callOrder) this.callOrder.push(name);
    if (isIdentity) {
      return arguments[0];
    }
  };

  fn.count = 0;
  fn.args = [];

  return fn;
}


function makePlugin() {
  return {
    callOrder: [],
    setOptions: stub('setOptions'),
    stringBefore: stub('stringBefore', true),
    stringAfter: stub('stringAfter', true),
    tokenBefore: stub('tokenBefore'),
    tokenAfter: stub('tokenAfter'),
    nodeBefore: stub('nodeBefore'),
    nodeAfter: stub('nodeAfter'),
    transformAfter: stub('transformAfter'),
    transformBefore: stub('transformBefore')
  };
}
