var split = require('split2');
var through = require('through2');
var combine = require('stream-combiner2');
var fs = require('fs');

module.exports = function (cb) {
    var files = {};
    var counts = {};
    var original = {};
    
    return combine(split(), through(write, end));

    function write (line, enc, next) {
        var m;
        if (m = /^COVERAGE\s+("[^"]+"|\S+)\s+(\S+)/.exec(line)) {
            var file = m[1], ranges = m[2];
            if (/^"/.test(file) && /"$/.test(file)) file = JSON.parse(file);
            files[file] = JSON.parse(ranges);
            original[file] = JSON.parse(ranges).filter(Boolean);
        }
        else if (m = /^COVERED\s+("[^"]+"|\S+)\s+(\S+)/.exec(line)) {
            var file = m[1], index = m[2];
            if (/^"/.test(file) && /"$/.test(file)) file = JSON.parse(file);
            delete files[file][index];
        }
        else this.push(line + '\n');
        next();
    }
    
    function end () {
        var ranges = Object.keys(files).reduce(function (acc, file) {
            return acc.concat(files[file].filter(Boolean));
        }, []);
        
        var missed = Object.keys(files).reduce(function (acc, file) {
            var seen = {};
            acc[file] = files[file].filter(Boolean).filter(function (mr) {
                var key = mr.join('-');
                if (seen.hasOwnProperty(key)) {
                    return false;
                }
                seen[key] = true;
                return !ranges.some(function (rr) {
                    return (mr[0] > rr[0] && mr[1] < rr[1])
                        || (mr[0] === rr[0] && mr[1] < rr[1])
                        || (mr[0] > rr[0] && mr[1] === rr[1])
                    ;
                });
            });
            return acc;
        }, {});
        
        var counts = Object.keys(files).reduce(function (acc, file) {
            acc[file] = {
                expr: original[file].length - missed[file].length,
                total: original[file].length
            };
            return acc;
        }, {});
        
        var sources = {};
        var pending = 0;
        Object.keys(missed).forEach(function (file) {
            pending ++;
            sources[file] = {};
            
            fs.readFile(file, 'utf8', function (err, src) {
                if (err) return cb(err);
                
                var lines = src.split('\n');
                function findLine (r) {
                    var c = 0;
                    var mlines = [];
                    for (var i = 0; i < lines.length; i++) {
                        c += lines[i].length + 1;
                        if (c < r[0]) continue;
                        
                        var row = { line: lines[i] };
                        row.range = [ 0, lines[i].length - 1 ];
                        if (mlines.length === 0) {
                            row.range[0] = r[0] - c + lines[i].length;
                        }
                        if (c > r[1]) {
                            row.range[1] = r[1] - c + lines[i].length;
                        }
                        mlines.push(row);
                        
                        if (c > r[1]) break;
                    }
                    var offset =  c - lines[i].length;
                    var lr = [ r[0] - offset, r[1] - offset + 1 ];
                    return {
                        lines: mlines,
                        num: i, // DEPRECATE
                        range: lr
                    };
                }
                
                sources[file] = [];
                missed[file].forEach(function (range) {
                    var match = findLine(range);
                    sources[file].push({
                        range: range,
                        lines: match.lines,
                        lineNum: match.num, // DEPRECATE
                        column: match.range, // DEPRECATE
                        line: lines[match.num], // DEPRECATE
                        code: src.slice(range[0], range[1])
                    });
                });
                next();
            });
        });
        
        function next () {
            if (--pending === 0) {
                cb(null, sources, counts);
            }
        }
    }
};
