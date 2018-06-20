var db = require('../../dbconnection');
var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      begin: "beginDate",
      end: "endDate",
      count: "count"
  }
};

var calls_summary = {
  getAll: function(cb) {

    let sql = "SELECT CURDATE() as endDate, CURDATE() - INTERVAL 365 DAY AS beginDate, count(*) as count FROM sc_calllogs "
    + " WHERE DATE(callTime) BETWEEN CURDATE() - INTERVAL 365 DAY AND CURDATE()";

    db.query(sql, function (err, rows, fields) {

      var dataTransform = DataTransform(rows, map);
      var result = dataTransform.transform();
      cb(err, result);

    });

  },
  getRelated: function(q, cb) {
    var query = [q];
    var tenantid = query[0].tenantid;
    if (validator.isNumeric(q) === true) {

      var a = function (b) {
        let sql = "SELECT CURDATE() as endDate, CURDATE() - INTERVAL " + query + " DAY AS beginDate, count(*) as count FROM sc_calllogs "
        + " WHERE tenantid = '" + tenantid + "' AND DATE(callTime) BETWEEN CURDATE() - INTERVAL " + query + " DAY AND CURDATE()";

        db.query(sql, function (err, rows, fields) {

          var dataTransform = DataTransform(rows, map);
          var result = dataTransform.transform();
          b(err, result);

        });

      };

      async.series([a], function (err, data) {
          if (err) {
              return err;
          } else {
              cb(data);
          }
      });

    } else {

      var err = {
        error: true,
        query: '?'+ q,
        expected: 'numeric',
        description: 'Query must be a numeric value.'
      }
      return cb([err])

    };



  }
};

module.exports = calls_summary;
