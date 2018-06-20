var db = require('../dbconnection');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      name: "username",
      display: "displayName",
      status: "status"
  }
};

var userlogin = {
  doLookup: function(d, cb) {
      var query = [d];
      var id = query[0].id;
      var pw = query[0].pw;

      let sql = "SELECT username, displayName, active, 'authorized' as status FROM users WHERE username='" + id + "' and password='" + pw + "' AND active='1'";

      db.query(sql, function (err, rows, fields) {

        if (rows.length > 0) {
          var dataTransform = DataTransform(rows, map);
          var result = dataTransform.transform();
          cb(err, result);
        } else {
          var response = {
            status: 'not authorized'
          };

          cb(response)
        }

      });
  },
};

module.exports = userlogin;
