import {parse} from 'acorn';
import lookup from '../../src/index';
import {omit, result} from 'lodash';

describe('Lookup scope', function() {
  beforeEach(() => {
    this.ast = parse(`
      (function() {
        const x = 2;
        try {
          const x = 1;
          [1, 2, 3].map(x => x);
        } catch(o_O) {
          return 1;
        }
        console.log(x);
      })();
      module.exports = {
        x() {
          let y = this;
          console.log(y);
        }
      }
    `, {
      ecmaVersion: 6
    });
  });

  this.createTest = function(test, nodePath, expected) {
    it(test, () => {
      let scope = lookup(result(this.ast, nodePath, this.ast), this.ast);
      expect(scope).to.have.property('block');
      expect(omit(scope.block, 'body')).to.be.deep.equal(expected);
    });
  };

  this.createTest('should find the entire ast scope', null, {
    start: 0,
    end: 312,
    sourceType: 'script',
    type: 'Program'
  });

  this.createTest('should place the first function in global', 'body[0]', {
    start: 0,
    end: 312,
    sourceType: 'script',
    type: 'Program'
  });

  this.createTest('should place the first function in global', 'body[1]', {
    start: 0,
    end: 312,
    sourceType: 'script',
    type: 'Program'
  });

  this.createTest('scope within a scope', 'body[1].expression.callee.body', {
    start: 0,
    end: 312,
    sourceType: 'script',
    type: 'Program'
  });

  this.createTest('var in function scope', 'body[0].expression.callee.body.body[0]', {
    id: null,
    generator: false,
    expression: false,
    params: [],
    type: 'FunctionExpression',
    start: 8,
    end: 196
  });

  this.createTest('try in function scope', 'body[0].expression.callee.body.body[1]', {
    id: null,
    generator: false,
    expression: false,
    params: [],
    type: 'FunctionExpression',
    start: 8,
    end: 196
  });

  this.createTest('call in try scope', 'body[0].expression.callee.body.body[1].block.body[1]', {
    start: 108,
    param: {start: 128, name: 'o_O', type: 'Identifier', end: 131},
    guard: null,
    type: 'TryClause',
    end: 121
  });

  this.createTest('return in catch scope', 'body[0].expression.callee.body.body[1].handler.body.body[0]', {
    start: 122,
    param: {start: 128, name: 'o_O', type: 'Identifier', end: 131},
    guard: null,
    type: 'CatchClause',
    end: 164
  });

  this.createTest('fn call in function scope', 'body[1].expression.right.properties[0].value.body.body[1]', {
    end: 299,
    expression: false,
    generator: false,
    params: [],
    start: 235,
    type: 'FunctionExpression',
    id: null
  });
});
