
module.exports = function(fn){
  var buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(s){ buf += s });
  process.stdin.on('end', function(){
    fn(buf);
  }).resume();
};