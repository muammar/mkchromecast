var fs = require('fs');
var lame = require('../');
var path = require('path');

fs.createReadStream(process.argv[2] || path.resolve(__dirname, 'sample.float.pcm'))
  .pipe(new lame.Encoder({ channels: 2, bitDepth: 32, float: true }))
  .pipe(fs.createWriteStream(path.resolve(__dirname, 'sample_pcm.mp3')))
  .on('close', function () {
    console.error('done!');
  });
