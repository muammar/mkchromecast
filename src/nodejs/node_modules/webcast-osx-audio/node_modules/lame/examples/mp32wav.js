
/**
 * An example using node-lame and node-wav to decode an MP3 file and save it into
 * a WAVE file.
 */

var fs = require('fs');
var lame = require('../');
var wav = require('wav');
var filename = process.argv[2];

if (process.stdin.isTTY && !filename) {
  // print help
  console.error('usage:');
  console.error('  decode an mp3 file:');
  console.error('    $ %s <infile.mp3> <outfile.wav>', process.argv.join(' '));
  console.error('  or decode mp3 data from stdin:');
  console.error('    $ cat song.mp3 | %s | ffplay -', process.argv.join(' '));
  process.exit(1);
}

// first figure out if we're decoding from a filename, or from stdin
var input;
var output;
if (filename) {
  var outfile = process.argv[3];
  if (!outfile) {
    console.error('FATAL: must specify an output .wav file!');
    process.exit(1);
  }
  console.error('encoding %j', filename);
  console.error('to %j', outfile);
  input = fs.createReadStream(filename);
  output = fs.createWriteStream(outfile);
} else {
  input = process.stdin;
  output = process.stdout;
}

// start reading the MP3 file from the input
var decoder = new lame.Decoder();

// we have to wait for the "format" event before we can start encoding
decoder.on('format', onFormat);

// and start transferring the data
input.pipe(decoder);

function onFormat (format) {
  console.error('MP3 format: %j', format);

  // write the decoded MP3 data into a WAV file
  var writer = new wav.Writer(format);
  decoder.pipe(writer).pipe(output);
}
