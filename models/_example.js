var db = require('../dbconnection'); //reference of dbconnection.js

var async = require("async");
var validator = require('validator');
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
    field: "fieldname",
    count: "count"
  }
};

var task = {
  addTask: function(Task, cb) {
      return db.query("Insert into task values(?,?,?)", [Task.Id, Task.Title, Task.Status], cb);
  },
  deleteTask: function(id, cb) {
      return db.query("delete from task where Id=?", [id], cb);
  },
  updateTask: function(id, Task, cb) {
      return db.query("update task set Title=?,Status=? where Id=?", [Task.Title, Task.Status, id], cb);
  },
  getAll: function(cb) {

    let sql = "SELECT * FROM table";

      db.query(sql, function (err, rows, fields) {

        var dataTransform = DataTransform(rows, map);
        var result = dataTransform.transform();
        cb(err, result);

      });

  },
  getRelated: function(q, cb) {
      var query = [q];

      if (validator.isNumeric(q) === true) {

        var a = function (b) {

          let sql = "SELECT * FROM table";

            db.query(sql, function (err, rows, fields) {

              var dataTransform = DataTransform(rows, map);
              var result = dataTransform.transform();
              cb(err, result);

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

module.exports = task;
