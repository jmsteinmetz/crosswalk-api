var db = require('../../dbconnection');
var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      firstname: "callerFirstName",
      lastname: "callerLastName",
      eventDate: "eventDate",
      count: "count"
  }
};

var calls_user = {
  getAll: function(cb) {

    let sql = "select v.callerFirstName, v.callerLastName, d.callTime AS eventDate, IFNULL( v.count, 0) AS count from"
    + " (select adddate('1970-01-01',t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) callTime from"
    + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0, "
    + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1, "
    + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2, "
    + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3, "
    + "(select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) d "
    + " left join "
    + " (SELECT "
    + " callerFirstName, callerLastName, "
    + " count(*) AS count, "
    + " DATE(callTime) as CallTime "
    + " FROM sc_calllogs "
    + " GROUP BY callerFirstName, callerLastName, DATE(callTime)) v "
    + " on d.callTime = v.callTime "
    + " WHERE DATE(d.callTime) BETWEEN CURDATE() - INTERVAL 365 DAY AND CURDATE() "
    + " group by DATE(d.callTime), v.callerFirstName, v.callerLastName"
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

        var a = function (dt) {
          let sql = "SELECT d.callTime AS eventDate from"
          + " (select adddate('1970-01-01',t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) callTime from"
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0, "
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1, "
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2, "
          + " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3, "
          + "(select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) d "
          + " WHERE DATE(d.callTime) BETWEEN CURDATE() - INTERVAL " + time + " DAY AND CURDATE() "
          + " order by d.callTime";

          db.query(sql, function (err, rows, fields) {

            //console.log(sql)

            if (shape == 'c3') {

              var t = [];
              var dateArray = ['x']
              for (var i in rows) {
                   var d = new Date(rows[i].eventDate);
                   dateArray.push(d.toISOString().substring(0, 10));
               }

               dt(null, dateArray);

            } else {

              var dataTransform = DataTransform(rows, map);
              var result = dataTransform.transform();
              dt(null, result);

            }

          });

        };

        var b = function (dt) {

let sql = "select a.Date AS eventDate, v.callerFirstName, v.callerLastName, IFNULL( v.value, 0) AS count"
+ " from ("
+ " select curdate() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY as Date"
+ " from (select 0 as a union all select 1 union all select 2 union all select 3 union all select 4 union all select 5 union all select 6 union all select 7 union all select 8 union all select 9) as a"
+ " cross join (select 0 as a union all select 1 union all select 2 union all select 3 union all select 4 union all select 5 union all select 6 union all select 7 union all select 8 union all select 9) as b"
+ " cross join (select 0 as a union all select 1 union all select 2 union all select 3 union all select 4 union all select 5 union all select 6 union all select 7 union all select 8 union all select 9) as c"
+ " ) a"
+ " left join"
+ " (SELECT callerFirstName, callerLastName, DATE(callTime) as callTime, count(callid) as value FROM sc_calllogs WHERE tenantid = '" + tenantid + "' GROUP BY DATE(callTime), callerLastName, callerFirstName) v"
+ " on a.Date = v.callTime"
+ " WHERE a.Date BETWEEN CURDATE() - INTERVAL " + time + " DAY AND CURDATE()"
+ " GROUP BY callerLastName, callerFirstName"


          db.query(sql, function (err, rows, fields) {

            if (shape == 'c3') {
              var result = [];
              var name = "";
              for (var i in rows) {

                    var newName = rows[i].callerFirstName + " " + rows[i].callerLastName

                    if (newName !== 'null null') {
                      // does name match previous

                      // if its the first record
                      if (i = 0) {
                        var thisArray = [name];
                        thisArray.push(i)
                      }
                      // if its NOT the first record and the name matches
                      if ((newName === name) && (i > 0)) {
                        thisArray.push(i)
                      }

                      // if its NOT the first record and the name doesnt match
                      if ((newName !== name) && (i > 0)) {
                        result.push(thisArray);
                        var thisArray = [name];
                        thisArray.push(i)
                      }

                    name = newName
                    }

               }

               dt(null, result);

            } else {

              var dataTransform = DataTransform(rows, map);
              var result = dataTransform.transform();
              //dt(null, result);

            }

          });

        }

        async.series([
            a,b
        ],
        function(err, results) {
            cb(results)
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

module.exports = calls_user;
