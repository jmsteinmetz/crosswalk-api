var db = require('../dbconnection');
var async = require("async");
var DataTransform = require("node-json-transform").DataTransform;

Number.prototype.formatMoney = function(c, d, t){
var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

var map = {
  item: {
      id: "mco_id",
      apc: "APC",
      provider: {
        provider_id: "Provider_ID",
        name: "Provider_Name",
        street_address: "Provider_Street_Address",
        city: "Provider_City",
        state: "Provider_State",
        zip: "Provider_Zip_Code"
      },
      hospital_referral_region: "Hospital_Referral_Region",
      outpatient_services: "Outpatient_Services",
      avg_submitted_charges: "Average_Submitted_Charges",
      avg_total_patients: "Average_Total_Payments",
      yr: "yr"
  },
  operate: [
      {
          run: function(val) {
            var d = val.formatMoney(2);
            return parseFloat(d)
          }, on: "avg_submitted_charges"
      }
  ]
};

var outpatient_charge = {

    getAll: function(cb) {

      var a = function (b) {
        let sql = "SELECT mco_id, APC,"
    + " Provider_ID,"
    + " Provider_Name,"
    + " Provider_Street_Address,"
    + " Provider_City,"
    + " Provider_State,"
    + " Provider_Zip_Code,"
    + " Hospital_Referral_Region,"
    + " Outpatient_Services,"
    + " Average_Submitted_Charges,"
    + " Average_Total_Payments,"
    + " yr"
    + "FROM medicare_charge_outpatient"

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
        var time = query[0].q;
        var page = query[0].page;
        var limit = query[0].limit;

        var page = parseInt(query[0].page, 10);
        if (isNaN(page) || page < 1) {
          page = 1;
        }

        var offset = (page - 1) * limit;

        var a = function (b) {
          let sql = "SELECT mco_id, APC,"
      + " Provider_ID,"
      + " Provider_Name,"
      + " Provider_Street_Address,"
      + " Provider_City,"
      + " Provider_State,"
      + " Provider_Zip_Code,"
      + " Hospital_Referral_Region,"
      + " Outpatient_Services,"
      + " Average_Submitted_Charges,"
      + " Average_Total_Payments,"
      + " yr"
      + " FROM medicare_charge_outpatient"
      + " WHERE yr = " + time + " LIMIT " + offset + ", " + limit + "";

      //console.log(sql)

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

module.exports = outpatient_charge;
