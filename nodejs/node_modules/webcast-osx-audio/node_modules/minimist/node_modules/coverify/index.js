var falafel = require('falafel');
var through = require('through2');
var sourceMap = require('source-map');
var convertSourceMap = require('convert-source-map');
var slash = require('slash');

module.exports = function (file, opts) {
    if (typeof file === 'object') {
        opts = file;
        file = undefined;
    }
    if (!opts) opts = {};
    var outputFn = opts.output || 'console.log';
    
    var expected = [];
    
    var chunks = [];
    var stream = through(write, end);
    return stream;
    
    function write (buf, enc, next) { chunks.push(buf); next() }
    
    function end () {
        var body = Buffer.concat(chunks)
            .toString('utf8')
            .replace(/^#!/, '//#!')
        ;

        if (file.match(/\.json$/)) {
            this.push('module.exports=' + body);
            this.push(null);
            return;
        }
        
        var fopts = { locations: true, ecmaVersion: 6 };
        try { var src = falafel(body, fopts, walk) + '' }
        catch (err) { return onerror(err, file,body) }
        var sfile = JSON.stringify(JSON.stringify(file));

        var origBody = body;
        var bodySourceMap = convertSourceMap.fromSource(body);
        if (bodySourceMap && bodySourceMap.sourcemap.mappings) {
            bodySourceMap = new sourceMap.SourceMapConsumer(bodySourceMap.sourcemap);
            origBody = bodySourceMap.sourceContentFor(slash(file));
            function originalLoc (loc) {
                var pos = bodySourceMap.originalPositionFor(loc);
                if (pos.line && pos.column) {
                    return { line: pos.line, column: pos.column };
                }
            }
            expected = expected.map(function (loc) {
                var origStart = originalLoc(loc.start);
                var origEnd = originalLoc(loc.end);
                if (origStart && origEnd) {
                    return { start: originalLoc(loc.start), end: originalLoc(loc.end) };
                }
                else return false;
            });
        }

        var lines = origBody.split('\n');
        var lineOffsets = [];
        var offset = 0;
        for (var i = 0; i < lines.length; i++) {
            lineOffsets[i] = offset;
            offset += lines[i].length + 1;
        }
        expected = expected.map(function(loc) {
            if (!loc) return false;
            return [
                lineOffsets[loc.start.line - 1] + loc.start.column,
                lineOffsets[loc.end.line - 1] + loc.end.column
            ];
        });
        
        this.push(
            outputFn + '("COVERAGE " + ' + sfile + ' + " " + '
                + JSON.stringify(JSON.stringify(expected))
            + ');'
            + 'var __coverage = '
            + JSON.stringify(expected.reduce(function (acc, x, ix) {
                acc[ix] = x;
                return acc;
            }, {})) + ';'
            + 'var __coverageFunction = function () {'
                + 'var a=[].slice.call(arguments);'
                + 'a.splice(-1, 0, "__coverageWrap");'
                + 'var f=Function.apply(this, a);'
                + 'return function(){'
                    + 'var b=[].slice.call(arguments);'
                    + 'b.push(__coverageWrap);'
                    + 'return f.apply(this, b);'
                + '}'
            + '};'
            + '__coverageFunction.prototype = Function.prototype;'
            + 'var __coverageWrap = function (index) {'
                + 'if (__coverage[index]) ' + outputFn
                    + '("COVERED " + ' + sfile
                    + ' + " " + index);'
                + 'delete __coverage[index];'
                + 'return function (x) { return x }'
            + '};'
            + '(function (Function) {\n'
        );
        this.push(src);
        this.push('\n})(__coverageFunction)');
        this.push(null);
    }
    
    function walk (node) {
        var index = expected.length;
        if (node.type === 'VariableDeclarator' && node.init) {
            expected.push(node.init.loc);
            node.init.update(
                '(__coverageWrap(' + index + ')('
                + node.init.source() + '))'
            );
        }
        else if (/Expression$/.test(node.type)
        && node.parent.type !== 'UnaryExpression'
        && node.parent.type !== 'AssignmentExpression'
        && node.parent.type !== 'UpdateExpression'
        && (node.type !== 'MemberExpression'
            || node.parent.type !== 'CallExpression'
        )) {
            expected.push(node.loc);
            node.update('(__coverageWrap(' + index + ')(' + node.source() + '))');
        }
        else if ((node.type === 'ExpressionStatement'
        || node.type === 'VariableDeclaration')
        && node.parent.type !== 'ForStatement'
        && node.parent.type !== 'ForInStatement') {
            var s = '{ __coverageWrap(' + index + ');' + node.source() + '\n}';
            if (node.parent.type === 'IfStatement') {
                node.update(s);
            }
            else node.update(s + ';');
            expected.push(node.loc);
        }
        else if (node.type === 'ReturnStatement') {
            node.update('return __coverageWrap(' + index + ')(function () {'
                + node.source() + '}).apply(this, [].slice.call(arguments));');
            expected.push(node.loc);
        }
    }
    
    function onerror (err, file, body) {
        if (err && err.lineNumber !== undefined) {
            var lines = body.split('\n');
            var line = lines[err.lineNumber-1];
            
            var msg = err.description + '\n\n'
                + file + ':' + err.lineNumber + '\n'
                + line + '\n'
                + Array(err.column).join(' ') + '^'
            ;
            var e = new Error(msg);
            e.lineNumber = err.lineNumber;
            e.column = err.column;
            e.line = line;
            stream.emit('error', e);
        }
        else stream.emit('error', err);
    }
};
