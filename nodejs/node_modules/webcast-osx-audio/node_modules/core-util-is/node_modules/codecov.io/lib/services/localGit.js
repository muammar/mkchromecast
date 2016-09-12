// var execSync = require('exec-sync');

// module.exports = {

//   configuration : function(){
//     if (process.version.substr(0, 5) === 'v0.10') {
//       var branch = execSync("git rev-parse --abbrev-ref HEAD").trim();
//       if (branch === 'HEAD') {
//         branch = 'master';
//       }
//       var head = execSync("git rev-parse HEAD").trim();
//       return {
//         commit : head,
//         branch : branch
//       };
//     } else {
//       // need to do
//       throw new Error("Local git currently not supported in node v0.11");
//     }
//   }

// };
