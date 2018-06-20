var db = require('../../dbconnection');
var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      practitioner: {
        firstname: "practitionerFirstName",
        lastname: "practitionerLastName",
        id: "id"
      },
      eventDate: "eventdate",
      count: "count"
  }
};

var provider_patients = {
  getAll: function(cb) {

    let sql = "SELECT practitionerFirstName, practitionerLastName, id, eventdate, patientCount FROM sc_patientcounts "
    + "order by eventdate"

    db.query(sql, function (err, rows, fields) {

      var dataTransform = DataTransform(rows, map);
      var result = dataTransform.transform();
      cb(err, result);

    });

  },
  getRelated: function(q, cb) {
    var query = [q];
    var time = query[0].q;
    var lookup = query[0].lookup;
    var shape = query[0].shape;
    var tenantid = query[0].tenantid;

    if (validator.isNumeric(time) === true) {

        if (lookup != 'all') {
          var where = "WHERE tenantid = '" + tenantid + "' AND practitionerLastName LIKE '%" + lookup + "%' OR practitionerFirstName LIKE '%" + lookup + "%' ";
        } else {
          var where = "WHERE tenantid = '" + tenantid + "' ";
        }

        var a = function (b) {
          let sql = "SELECT practitionerFirstName, practitionerLastName, id, eventdate, patientCount AS count FROM sc_patientcounts " + where + ""
          + " order by eventdate";

          //console.log(sql);

          db.query(sql, function (err, rows, fields) {

            if (shape == 'c3') {

              // var x_item = [];
              // var y_item = [];
              // for (var i in rows) {
              //     var d = new Date(rows[i].eventDate);
              //     x_item.push(d.toISOString().substring(0, 10));
              //     y_item.push(rows[i].count);
              // }
              //
              // var t = {
              //   x: x_item,
              //   count: y_item
              // };
              //
              // cb(err, t);

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

      }

  }
};

module.exports = provider_patients;
