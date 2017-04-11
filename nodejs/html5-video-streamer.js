/*
 * Inspired by: http://stackoverflow.com/questions/4360060/video-streaming-with-html-5-via-node-js
 */

var http = require('http'),
    fs = require('fs'),
    util = require('util');

http.createServer(function (req, res) {
  var path = process.argv[2];
  var stat = fs.statSync(path);
  var total = stat.size;
  if (req.headers['range']) {
    var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total-1;
    var chunksize = (end-start)+1;
    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

    var file = fs.createReadStream(path, {start: start, end: end});
    res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
    });
    file.pipe(res);
  } else {
    console.log('ALL: ' + total);
    res.writeHead(200, {
        'Content-Length': total,
        'Content-Type':
        'video/mp4' });
    fs.createReadStream(path).pipe(res);
  }
}).listen(5000, '0.0.0.0');
console.log('Server running at http://0.0.0.0:5000/');
