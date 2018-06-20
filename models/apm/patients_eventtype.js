// SELECT a.id, a.seenDate, a.actionPlanName, b.eventType
// FROM
// (SELECT id, DATE(start) as seenDate, actionPlanName, status FROM sc_appointments WHERE status='fulfilled') a
// JOIN
// (SELECT callid, callTime, _id, actionplanId, actionPlanTitle, appointmentStart, callerFirstName, callerid, callerLastName, dispositionCode, dispositionDisplayText, eventType, lastUpdated, orgId, orgName, patientIdentifier,
// providerFirstName, providerId, providerLastName, tenantId, workflowStep, hashPatientId, snapshotDate FROM sc_calllogs) b
// ON
// b.actionPlanTitle = a.actionPlanName
// GROUP BY a.id
// ORDER BY a.seenDate, a.actionPlanName DESC

var db = require('../../dbconnection');
var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      eventType: "eventType",
      date: "seenDate",
      count: "count"
  }
};

var patients_eventtype = {
  getAll: function(cb) {

    let sql = "SELECT b.eventType, a.seendate, count(distinct a.id) as count, "
    + " FROM "
    + " (SELECT id, DATE(start) as seenDate, actionPlanName, status FROM sc_appointments WHERE status='fulfilled' GROUP BY id) a"
    + " JOIN "
    + " (SELECT callid, callTime, _id, actionplanId, actionPlanTitle, appointmentStart, callerFirstName, callerid, callerLastName, dispositionCode, dispositionDisplayText, eventType, lastUpdated, orgId, orgName, patientIdentifier, "
    + " providerFirstName, providerId, providerLastName, tenantId, workflowStep, hashPatientId, snapshotDate FROM sc_calllogs) b"
    + " ON "
    + " b.actionPlanTitle = a.actionPlanName"
    + " WHERE DATE(a.seendate) BETWEEN CURDATE() - INTERVAL 365 DAY AND CURDATE()"
    + " GROUP BY a.seenDate, b.eventType"

    //let sql = "select v.eventType, d.callTime AS seenDate, IFNULL( v.count, 0) AS count from"


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

      //console.log(time);

        var a = function (b) {

          let sql = "SELECT b.eventType, count(distinct a.id) as count "
          + " FROM "
          + " (SELECT id, DATE(start) as seenDate, actionPlanName, status FROM sc_appointments WHERE tenantid = '" + tenantid + "' AND status='fulfilled' GROUP BY id) a"
          + " JOIN "
          + " (SELECT callid, DATE(callTime), _id, actionplanId, actionPlanTitle, appointmentStart, callerFirstName, callerid, callerLastName, dispositionCode, dispositionDisplayText, eventType, lastUpdated, orgId, orgName, patientIdentifier, "
          + " providerFirstName, providerId, providerLastName, tenantId, workflowStep, hashPatientId, snapshotDate FROM sc_calllogs WHERE tenantid = '" + tenantid + "' AND DATE(callTime) BETWEEN CURDATE() - INTERVAL " + time + " DAY AND CURDATE()) b"
          + " ON "
          + " b.actionPlanTitle = a.actionPlanName"
          + " GROUP BY b.eventType"


          //console.log(sql);

          db.query(sql, function (err, rows, fields) {

            if (shape == 'c3') {

              var t = {};
              for (var i in rows) {
                   var name = rows[i].eventType;
                   var count = rows[i].count;
                   t[name] = [count];
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

module.exports = patients_eventtype;
