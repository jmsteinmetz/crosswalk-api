var mysql = require('mysql');
// var connection = mysql.createPool({
//   host     : 'us-cdbr-iron-east-05.cleardb.net',
//   user     : 'be632e61bef4c4',
//   password : '5db024ac',
//   database : 'heroku_3fb9033ff0be812'
// });
var connection = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'api'
});
module.exports = connection;
