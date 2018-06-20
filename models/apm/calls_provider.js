var db = require('../../dbconnection');
var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
    provider: {
      firstname: "providerFirstName",
      lastname: "providerLastName"
    },
    calls: "count",
    patients: "patient_count"
  }
};

var calls_provider = {
  getAll: function(cb) {

    let sql = "SELECT '365' as DayCount, concat(sc_calllogs.providerFirstName, ' ', sc_calllogs.providerLastName) AS provider, sc_calllogs.providerFirstName, sc_calllogs.providerLastName,"
        + " count(callid) AS count,"
        + " patient_count"
        + " FROM sc_calllogs"
        + " JOIN sc_providers"
        + " ON sc_calllogs.providerFirstName=sc_providers.first_name AND sc_calllogs.providerLastName=sc_providers.last_name"
        + " WHERE"
        + " DATE(callTime) BETWEEN CURDATE() - INTERVAL 365 DAY AND CURDATE()"
        + " GROUP BY provider"

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

              let sql = "SELECT providerFirstName, providerLastName, count(callid) as call_count, patient_count"
              + " FROM sc_calllogs"
              + " JOIN sc_providers"
              + " ON sc_calllogs.providerFirstName = sc_providers.first_name AND sc_calllogs.providerLastName = sc_providers.last_name"
              + " WHERE tenantid = '" + tenantid + "' AND "
              + " DATE(callTime) BETWEEN CURDATE() - INTERVAL " + time + " DAY AND CURDATE()"
              + " GROUP BY providerLastName, providerFirstName ";

            db.query(sql, function (err, rows, fields) {

              if (shape == 'c3') {

                var columns = [];
                var xsList = [];
                for (var i in rows) {
                    var provider = rows[i].providerFirstName + " " + rows[i].providerLastName;
                    var provider_x = rows[i].providerFirstName + " " + rows[i].providerLastName + "_x";
                    var provider_patient_count = rows[i].patient_count;
                    var provider_call_count = rows[i].call_count;

                    columns.push([provider, provider_call_count]);
                    columns.push([provider_x, provider_patient_count]);
                    xsList.push(provider);
                }

                t = {
                  axis: [ {
                    xAxis: "Patients",
                    yAxis: "Calls"
                  }],
                  columns: columns,
                  xs: xsList
                }

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

      }

  }
};

module.exports = calls_provider;
