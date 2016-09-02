import {parse} from 'acorn';
import umd from '../../src/acorn-umd';
import _ from 'lodash';

describe('Parsing AST for CommonJS imports', function() {

    describe('var|let|const cases', function() {
        let code = `
        var noise;
        var x = require('foo')
        var x1 = require('bar');
        let noisey;
        let y = require('foo')
        let y1 = require('bar');
        const noisez = 1;
        const z = require('foo')
        const z1 = require('bar');
        `;

        let ast = parse(code, {ecmaVersion: 6});
        let imports = umd(ast, {
            es6: false, amd: false, cjs: true
        });

        it('identifies the right nodes', function() {
            expect(imports).to.have.length(6);
            _(imports).chunk(2)
            .each(_.spread((a, b) => {
                expect(a.end - a.start).to.be.equal(b.end - b.start - 1);
            })).value();
        });

        it('nodes have correct settings', function() {
            imports.forEach(node => {
                expect(node).to.have.property('source');
                expect(node).to.have.property('specifiers');
                expect(node).to.have.property('type', 'CJSImport');
                expect(node).to.have.property('reference');
            });
        });

        it('`var` node is correct', function() {
            let test = imports[0];

            expect(test.specifiers[0]).to.be.deep.equal({
                type: 'ImportSpecifier',
                start: 32,
                end: 33,
                local: { type: 'Identifier', start: 32, end: 33, name: 'x' },
                default: true
            });

            expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
                type: 'Literal',
                value: 'foo',
                raw: '\'foo\'',
                start: 44,
                end: 49
            });
        });

        it('`let` node is correct', function() {
            let test = imports[3];

            expect(test.specifiers[0]).to.be.deep.equal({
                type: 'ImportSpecifier',
                start: 147,
                end: 149,
                local: { type: 'Identifier', start: 147, end: 149, name: 'y1' },
                default: true
            });

            expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
                type: 'Literal',
                value: 'bar',
                raw: '\'bar\'',
                start: 160,
                end: 165
            });
        });

        it('`const` node is correct', function() {
            let test = imports[5];

            expect(test.specifiers[0]).to.be.deep.equal({
                type: 'ImportSpecifier',
                start: 241,
                end: 243,
                local: { type: 'Identifier', start: 241, end: 243, name: 'z1' },
                default: true
            });

            expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
                type: 'Literal',
                value: 'bar',
                raw: '\'bar\'',
                start: 254,
                end: 259
            });
        });
    });

    describe('identifies property cases', function() {
        let code = `
            var f = {
                a: 1, b: 2,
                foo: require('bar')
            }

            f.x = require('foo');
        `;

        let ast = parse(code);
        let imports = umd(ast, {
            es6: false, amd: false, cjs: true
        });

        it('identifies all cases', function() {
            expect(imports).to.have.length(2);
            imports.forEach(node => {
                expect(node).to.have.property('source');
                expect(node).to.have.property('specifiers');
                expect(node).to.have.property('type', 'CJSImport');
                expect(node).to.have.property('reference');
            });
        });

        it('object declaration property style', function() {
            let test = imports[0];

            expect(test.specifiers[0]).to.be.deep.equal({
                type: 'ImportSpecifier',
                start: 67,
                end: 70,
                local: { type: 'Identifier', start: 67, end: 70, name: 'foo' },
                default: false
            });

            expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
                type: 'Literal',
                value: 'bar',
                raw: '\'bar\'',
                start: 80,
                end: 85
            });
        });

        it('additional property style', function() {
            let test = imports[1];
            // console.log(test);
            expect(test.specifiers[0]).to.be.deep.equal({
                type: 'ImportSpecifier',
                start: 114,
                end: 117,
                local: { type: 'MemberExpression', start: 114, end: 117, name: 'x' },
                default: false
            });

            expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
                type: 'Literal',
                value: 'foo',
                raw: '\'foo\'',
                start: 128,
                end: 133
            });
        });
    });

    it ('should identify direct require calls', function() {
        let code = `
            require('mocha');
            require('smt')
            var x = 1;
        `;

        let ast = parse(code);
        let imports = umd(ast, {
            es6: false, amd: false, cjs: true
        });

        expect(imports).to.have.length(2);
        imports.forEach(node => {
            expect(node).to.have.property('source');
            expect(node).to.have.property('specifiers');
            expect(node).to.have.property('type', 'CJSImport');
            expect(node).to.have.property('reference');
        });

        let test = imports[0];
        expect(test.specifiers).to.be.empty;

        expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
            type: 'Literal',
            value: 'mocha',
            raw: '\'mocha\'',
            start: 21,
            end: 28
        });
    });

    describe('in different scope', function() {
        let code = `
            define(['a'], function(a) {
                var test = require('test');
                return test(a);
            });
        `;
        let ast = parse(code);
        let imports = umd(ast, {
            es6: false, amd: false, cjs: true
        });
        it ('should identify require calls', function() {
            expect(imports).to.have.length(1);
            imports.forEach(node => {
                expect(node).to.have.property('source');
                expect(node).to.have.property('specifiers');
                expect(node).to.have.property('type', 'CJSImport');
                expect(node).to.have.property('reference');
            });
        });

        it('should have the correct settings', function() {
            let test = imports[0];
            expect(test.specifiers).to.be.deep.equal([{
                type: 'ImportSpecifier',
                local: {
                    name: 'test',
                    start: 61, end: 65,
                    type: 'Identifier'
                },
                start: 61, end: 65,
                default: true
            }]);
            expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
                type: 'Literal',
                value: 'test',
                raw: '\'test\'',
                start: 76,
                end: 82
            });
        });
    });

    describe('non default import specifiers', function() {
        let code = `
            let test = require('prova').test;
        `;
        let ast = parse(code, {ecmaVersion: 6});
        let imports = umd(ast, {
            es6: false, amd: false, cjs: true
        });
        it ('should identify require calls', function() {
            expect(imports).to.have.length(1);
            imports.forEach(node => {
                expect(node).to.have.property('source');
                expect(node).to.have.property('specifiers');
                expect(node).to.have.property('type', 'CJSImport');
                expect(node).to.have.property('reference');
            });
        });

        it('should have the correct settings', function() {
            let test = imports[0];
            expect(test.specifiers).to.be.deep.equal([{
                type: 'ImportSpecifier',
                local: {
                    name: 'test',
                    start: 17, end: 21,
                    type: 'Identifier'
                },
                imported: {
                    name: 'test',
                    start: 41, end: 45,
                    type: 'Identifier'
                },
                start: 17, end: 21,
                default: false
            }]);
            expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
                type: 'Literal',
                value: 'prova',
                raw: '\'prova\'',
                start: 32, end: 39
            });
        });
    });

    describe('global and comma assignments', function() {
        let code = `
            x = require('global');
            let x, y = require('sec');
        `;
        let ast = parse(code, {ecmaVersion: 6});
        let imports = umd(ast, {
            es6: false, amd: false, cjs: true
        });
        it ('should identify require calls', function() {
            expect(imports).to.have.length(2);
            imports.forEach(node => {
                expect(node).to.have.property('source');
                expect(node).to.have.property('specifiers');
                expect(node).to.have.property('type', 'CJSImport');
                expect(node).to.have.property('reference');
            });
        });

        it('globals', function() {
            let test = imports[0];
            expect(test.specifiers).to.be.deep.equal([{
                type: 'ImportSpecifier',
                local: {
                    name: 'x',
                    start: 13, end: 14,
                    type: 'Identifier'
                },
                start: 13, end: 14,
                default: false
            }]);
            expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
                type: 'Literal',
                value: 'global',
                raw: '\'global\'',
                start: 25, end: 33
            });
        });

        it('comma assign', function() {
            let test = imports[1];
            expect(test.specifiers).to.be.deep.equal([{
                type: 'ImportSpecifier',
                local: {
                    name: 'y',
                    start: 55, end: 56,
                    type: 'Identifier'
                },
                start: 55, end: 56,
                default: true
            }]);
            expect(_.omit(test.source, '_ast', 'reference')).to.be.deep.equal({
                type: 'Literal',
                value: 'sec',
                raw: '\'sec\'',
                start: 67, end: 72
            });
        });
    });
});
