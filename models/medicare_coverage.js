var db = require('../dbconnection'); //reference of dbconnection.js

var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
    id: "id",
    name: "name",
    lastUpdated: "lastUpdated",
    details: "[url]"
  }
};

var medicare_coverage = {
  getAll: function(cb) {

    var a = function (b) {
      let sql = "SELECT * FROM medicare_coverage";

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

  },
  getRelated: function(q, cb) {
      var query = [q];
      console.log(query)

      async.parallel([
        function(callback) {
            var queryData = '' +
                'SELECT * FROM medicare_coverage WHERE id= ?';
            db.query(queryData, query, function (err, rows1) {
                if (err) {
                    return callback(err);
                }
                return callback(null, rows1);
            });
        },
        function(callback) {
            db.query('SELECT id, description FROM medicare_coverage_qualify WHERE screening_id = ?', query, function (err, rows5) {
                if (err) {
                    return callback(err);
                }
                return callback(null, rows5);
            });
        },
        function(callback) {
            db.query('SELECT id, code, code_description FROM medicare_coverage_codes WHERE active = "1" AND screening_id = ?', query, function (err, rows2) {
                if (err) {
                    return callback(err);
                }
                return callback(null, rows2);
            });
        },
        function(callback) {
            db.query('SELECT id, description FROM medicare_coverage_frequency WHERE screening_id = ?', query, function (err, rows3) {
                if (err) {
                    return callback(err);
                }
                return callback(null, rows3);
            });
        },
        function(callback) {
            db.query('SELECT id, description FROM medicare_beneficiary_responsibility WHERE screening_id = ?', query, function (err, rows4) {
                if (err) {
                    return callback(err);
                }
                return callback(null, rows4);
            });
        }
    ], function(error, callbackResults) {
        if (error) {
            //handle error
            console.log(error);
        } else {
            // create object
            var obj = {
              screening: callbackResults[0],
              qualifications: callbackResults[1],
              codes: callbackResults[2],
              frequency: callbackResults[3],
              beneficiary_responsibility: callbackResults[4]
            }
            cb(obj)
        }
    });

  }
};

module.exports = medicare_coverage;
