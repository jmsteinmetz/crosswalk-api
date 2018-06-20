var db = require('../dbconnection');
var async = require("async");
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      product_id: "PRODUCTID",
      product_ndc: "PRODUCTNDC",
      product_type_name: "PRODUCTTYPENAME",
      name: {
        proprietary: "PROPRIETARYNAME",
        proprietary_suffix: "PROPRIETARYNAMESUFFIX",
        nonpropietary: "NONPROPRIETARYNAME"
      },
      dosage: "DOSAGEFORMNAME",
      route: "ROUTENAME",
      substance: "SUBSTANCENAME",
      marketing: {
        startdate: "STARTMARKETINGDATE",
        enddate: "ENDMARKETINGDATE",
        category: "MARKETINGCATEGORYNAME",
        application_number: "APPLICATIONNUMBER",
        label_name: "LABELERNAME"
      },
      dea_schedule: "DEASCHEDULE",
      related: "NONPROPRIETARYNAME"
  },
  operate: [
      {
          run: function(val) {
            links = [];
            ignore = ['a', 'and', 'the', 'i'];
            var query = val.split(" ");
            for (var i = 0; i < query.length; i++) {
                if (ignore.includes(query[i]) === false) {
                  var object = {}
                  object.href = "http://localhost:3000/api/lookup/rx/" + query[i];
                  object.rel  = 'Crosswalk'
                  object.type = 'GET';
                  links.push(object);
                }
            }
            return links },
            on: "related"
      },
      {
          run: function(val) {
            var d = val.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
            return d
          }, on: "marketing.startdate"
      },
      {
          run: function(val) {
            var d = val.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
            return d
          }, on: "marketing.enddate"
      }
  ]
};

var rx_generic = {

    getAll: function(cb) {

      var a = function (b) {
        let sql = "SELECT a.sc_id, "
            + " a.PRODUCTID,"
            + " a.PRODUCTNDC,"
            + " a.PRODUCTTYPENAME,"
            + " a.PROPRIETARYNAME,"
            + " a.PROPRIETARYNAMESUFFIX,"
            + " a.NONPROPRIETARYNAME,"
            + " a.DOSAGEFORMNAME,"
            + " a.ROUTENAME,"
            + " a.STARTMARKETINGDATE,"
            + " a.ENDMARKETINGDATE,"
            + " a.MARKETINGCATEGORYNAME,"
            + " a.APPLICATIONNUMBER,"
            + " a.LABELERNAME,"
            + " a.SUBSTANCENAME,"
            + " a.DEASCHEDULE"
        + " FROM sc_generic a"

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

        var a = function (b) {
          let sql = "SELECT a.sc_id, "
              + " a.PRODUCTID,"
              + " a.PRODUCTNDC,"
              + " a.PRODUCTTYPENAME,"
              + " a.PROPRIETARYNAME,"
              + " a.PROPRIETARYNAMESUFFIX,"
              + " a.NONPROPRIETARYNAME,"
              + " a.DOSAGEFORMNAME,"
              + " a.ROUTENAME,"
              + " a.STARTMARKETINGDATE,"
              + " a.ENDMARKETINGDATE,"
              + " a.MARKETINGCATEGORYNAME,"
              + " a.APPLICATIONNUMBER,"
              + " a.LABELERNAME,"
              + " a.SUBSTANCENAME,"
              + " a.DEASCHEDULE"
          + " FROM sc_generic a"
          + " WHERE ("
            + " a.PROPRIETARYNAME LIKE '%" + query + "%'"
            + " OR a.PROPRIETARYNAMESUFFIX LIKE '%" + query + "%'"
            + " OR a.NONPROPRIETARYNAME LIKE '%" + query + "%'"
            + " OR a.SUBSTANCENAME LIKE '%" + query + "%'"
          + " )";

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

    }
};

module.exports = rx_generic;
