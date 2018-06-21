var mysql = require('mysql');
var connection = mysql.createPool({
  host     : 'us-cdbr-iron-east-04.cleardb.net',
  user     : 'b238200554591a',
  password : '9d34fb8b',
  database : 'heroku_1d38aec91fa44ed'
});

// var connection = mysql.createPool({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'root',
//   database : 'api'
// });
module.exports = connection;
