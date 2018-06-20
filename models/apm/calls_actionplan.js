var db = require('../../dbconnection');
var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var mapAll = {
  item: {
      eventDate: "eventDate",
      count: "count"
  }
};
var map = {
  item: {
      actionplan: "actionPlanTitle",
      eventDate: "eventDate",
      count: "count"
  }
};

var calls_actionplan = {
  getAll: function(cb) {

    let sql = "select d.callTime AS eventDate, IFNULL( v.APCount, 0) AS count from"
      + "(select adddate('1970-01-01',t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) callTime from"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0,"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1,"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2,"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3,"
      + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) d"
      + " left join"
      + " (SELECT count(distinct actionPlanTitle) AS APCount, DATE(callTime) as callTime FROM sc_calllogs GROUP BY DATE(callTime)) v"
      + " on d.callTime = v.callTime"
      + " WHERE DATE(d.callTime) BETWEEN CURDATE() - INTERVAL 365 DAY AND CURDATE()"
      + " group by d.callTime"
      + " order by d.callTime"

      db.query(sql, function (err, rows, fields) {

        var dataTransform = DataTransform(rows, mapAll);
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

        var a = function (b) {

          let sql = "select d.callTime AS eventDate, IFNULL( v.CallsPerAp, 0) AS calls from"
         + " (select adddate('1970-01-01',t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) callTime from"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0,"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1,"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2,"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3,"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) d"
         + " left join"
         + " (SELECT"
        	+ " DATE(callTime) as callTime,"
        	+ " count(distinct actionPlanTitle) as APs,"
        	+ " count(*) as calls,"
          + " (count(*)/count(distinct actionPlanTitle)) AS CallsPerAp"
          + " FROM sc_calllogs"
          + " WHERE tenantid = '" + tenantid + "'"
          + " GROUP BY"
        	+ " DATE(callTime)) v"
         + " on d.callTime = v.callTime"
         + " WHERE DATE(d.callTime) BETWEEN CURDATE() - INTERVAL " + time + " DAY AND CURDATE()"
         + " group by d.callTime"
         + " order by d.callTime"

            db.query(sql, function (err, rows, fields) {

              if (shape == 'c3') {

                var x_item = [];
                var y_item = [];
                for (var i in rows) {
                    var d = new Date(rows[i].eventDate);
                    x_item.push(d.toISOString().substring(0, 10));
                    y_item.push(rows[i].calls);
                }

                var t = {
                  x: x_item,
                  'calls per action plan': y_item
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
          query: '?'+ q,
          expected: 'numeric',
          description: 'Query must be a numeric value.'
        }
        return cb([err])

      }


  }
};

module.exports = calls_actionplan;
