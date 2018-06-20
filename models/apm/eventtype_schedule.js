var db = require('../../dbconnection');
var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
    eventType: "eventType",
    count: "count"
  }
};

var eventtype_schedule = {
  getAll: function(cb) {

    let sql = "SELECT eventType, count(*) as count FROM sc_calllogs"
      + " WHERE DATE(callTime) BETWEEN CURDATE() - INTERVAL 365 DAY AND CURDATE()"
      + " GROUP BY eventType";

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

        var a = function (b) {

          let sql = "SELECT eventType, count(*) as count FROM sc_calllogs"
            + " WHERE tenantid = '" + tenantid + "' AND DATE(callTime) BETWEEN CURDATE() - INTERVAL " + time + " DAY AND CURDATE()"
            + " GROUP BY eventType";

            db.query(sql, function (err, rows, fields) {

              if (shape == 'c3') {

                //var x_item = [];
                // var y_item = [];
                var t = {};
                for (var i in rows) {
                     var name = rows[i].eventType;
                     var count = rows[i].count;
                     t[name] = [count];
                //     y_item.push(rows[i].count);
                 }
                //


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

module.exports = eventtype_schedule;
