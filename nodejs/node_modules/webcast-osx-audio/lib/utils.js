var interfaces = require('os').networkInterfaces();

var utils = {};

utils.getLocalIp = function(device) {
  var ip = null;
  if (device) {
    var dv = {};
    dv[device] = null;
  }
  for (dev in (dv ? dv : interfaces)) {
    interfaces[dev].forEach(function(a) {
      if (a.family === 'IPv4' && a.internal === false && !ip) {
        ip = a.address;
      }
    });
  }

  return ip;
};

module.exports = utils;
