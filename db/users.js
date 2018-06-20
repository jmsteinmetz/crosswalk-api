var db = require('../dbconnection');
var LocalStorage = require('node-localstorage');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
};

db.query("select * from users", function (err, rows) {
  exports.findByToken = function(token, cb) {
    process.nextTick(function() {
      for (var i = 0, len = rows.length; i < len; i++) {
        var record = rows[i];
        if (record.token === token) {
          localStorage.setItem('t', record.tenantid);
          //console.log(localStorage.getItem('t'));
          return cb(null, record);
        }
      }
      return cb(null, null);
    });
  }
});
