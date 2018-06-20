var db = require('../../dbconnection');
var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      eventDate: "eventDate",
      count: "count"
  }
};

var calls_daily = {
  getAll: function(cb) {

      let sql = "select d.callTime AS eventDate, IFNULL( v.value, 0) AS count from"
      + " (select adddate('1970-01-01',t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) callTime from"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0,"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1,"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2,"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3,"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) d"
      + " left join"
      + " (SELECT count(*) AS value, DATE(callTime) AS callTime"
      + " FROM sc_calllogs"
      + " GROUP BY DATE(callTime) ORDER BY callTime ASC) v"
      + " on d.callTime = v.callTime"
      + " WHERE DATE(d.callTime) BETWEEN CURDATE() - INTERVAL 365 DAY AND CURDATE()"
      + " group by d.callTime"
      + " order by d.callTime";

      db.query(sql, function (err, rows, fields) {

        var dataTransform = DataTransform(rows, map);
        var result = dataTransform.transform();
        cb(err, result);

      });
  },
  getRelated: function(q, cb) {
    var query = [q];
    var time = query[0].q;
    var shape = query[0].shape;
    var tenantid = query[0].tenantid;

    if (validator.isNumeric(time) === true) {

      var rootArray = [];

        var a = function (b) {
          let sql = "select d.callTime AS eventDate, IFNULL( v.value, 0) AS count from"
          + " (select adddate('1970-01-01',t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) callTime from"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0,"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1,"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2,"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3,"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) d"
          + " left join"
          + " (SELECT count(*) AS value, DATE(callTime) AS callTime"
          + " FROM sc_calllogs"
          + " WHERE tenantid = '" + tenantid + "'"
          + " GROUP BY DATE(callTime) ORDER BY callTime ASC) v"
          + " on d.callTime = v.callTime"
          + " WHERE DATE(d.callTime) BETWEEN CURDATE() - INTERVAL " + time + " DAY AND CURDATE()"
          + " group by d.callTime"
          + " order by d.callTime";

          console.log(sql)

          db.query(sql, function (err, rows, fields) {

            if (shape == 'c3') {

              var x_item = [];
              var y_item = [];
              for (var i in rows) {
                  var d = new Date(rows[i].eventDate);
                  x_item.push(d.toISOString().substring(0, 10));
                  y_item.push(rows[i].count);
              }

              var t = {
                x: x_item,
                count: y_item
              };

              cb(err, t);

            } else {

              var dataTransform = DataTransform(rows, map);
              var result = dataTransform.transform();
              cb(err, result);

            }

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
        query: '?'+ time,
        expected: 'numeric',
        description: 'Query must be a numeric value.'
      }
      return cb([err])

    };

  }
};

module.exports = calls_daily;
