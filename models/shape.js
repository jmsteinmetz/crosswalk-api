var db = require('../dbconnection');
var async = require("async");
var DataTransform = require("node-json-transform").DataTransform;

// the full example of the data mapping example
var map_example = {
    list : 'posts',
    item: {
        name: "title",
        info: "description",
        text: "blog",
        date: "date",
        link: "extra.link",
        item: "list1.0.name",
        clearMe: "",
        fieldGroup: ['title', 'extra']
    },
    operate: [
        {
            run: "Date.parse", on: "date"
        },
        {
            run: function(val) { return val + " more info"}, on: "info"
        }
    ],
    each: function(item){
        // make changes
        item.iterated = true;
        return item;
    }
};

// data map for the transform
var mapDate = {
  item: "date"
};

var map = {
  item: {
      name: "hcpcs",
      info: "description",
      code: "status_code",
      fieldGroup: ['hcpcs', 'description']
  }
};

var shape = {
  getAll: function(callback) {
      return db.query("SELECT * FROM sc_cpt_codes", callback);
  },
  getRelated: function(q, cb) {
      var query = [q];

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
        + " GROUP BY DATE(callTime) ORDER BY callTime ASC) v"
        + " on d.callTime = v.callTime"
        + " WHERE DATE(d.callTime) BETWEEN CURDATE() - INTERVAL " + query + " DAY AND CURDATE()"
        + " group by d.callTime"
        + " order by d.callTime";

        db.query(sql, function (err, rows, fields) {
          var array = ['x'];
          for (var i in rows) {
              array.push(rows[i].eventDate);
          }
          b(err, array);
        });

      };

      var c = function (d) {

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
        + " WHERE DATE(d.callTime) BETWEEN CURDATE() - INTERVAL " + query + " DAY AND CURDATE()"
        + " group by d.callTime"
        + " order by d.callTime";

        db.query(sql, function (err, rows, fields) {

          //console.log(rows);
          var modData = [];
            var x_item = ["x"];
            var y_item = ["count"];
          for (var i in rows) {
              y_item.push(rows[i].count);
          }

          d(err, y_item);

        });

      };

      async.series([a,c], function (err, data) {
          if (err) {
              return err;
          } else {
              cb(data);
          }
      });

  }
};

module.exports = shape;
