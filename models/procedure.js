var db = require('../dbconnection');
var async = require("async");
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      hcpcs: {
        code: "hcpcs",
        mod: "mod",
        desc: "description",
        status_code: "status_code",
        detail: {
          for_medicare_payment: "for_medicare_payment",
          work_rvu: "work_rvu",
          non_fac_pe_rvu: "non_fac_pe_rvu",
          non_fac_na_indicator: "non_fac_na_indicator",
          facility_pe_rvu: "facility_pe_rvu",
          fac_na_indicator: "fac_na_indicator",
          mp_rvu: "mp_rvu",
          non_facility_total: "non_facility_total",
          facility_total: "facility_total",
          pctc_ind: "pctc_ind",
          glob_days: "glob_days",
          pre_op: "pre_op",
          intra_op: "intra_op",
          post_op: "post_op",
          mult_proc: "mult_proc",
          bilat_surg: "bilat_surg",
          asst_surg: "asst_surg",
          co_surg: "co_surg",
          team_surg: "team_surg",
          endo_base: "endo_base",
          conv_factor: "conv_factor",
          phys_supervision_of_diag_proc: "phys_supervision_of_diag_proc",
          calculation_flag: "calculation_flag",
          diag_imaging_fmly_indicator: "diag_imaging_fmly_indicator",
          non_fac_pe_used_opps_paymt_amt: "non_fac_pe_used_opps_paymt_amt",
          fac_pe_used_opps_paymt_amt: "fac_pe_used_opps_paymt_amt",
          mp_used_opps_paymt_amt: "mp_used_opps_paymt_amt"
        }
      }
  }
};


var procedure = {
    getAll: function(callback) {
        return db.query("SELECT * FROM sc_cpt_codes", callback);
    },
    getRelated: function(q, cb) {
        var query = [q];

        var a = function (b) {
          let sql = "SELECT * FROM sc_cpt_codes WHERE (hcpcs LIKE '%" + query + "%' OR description LIKE '%" + query + "%')";

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

module.exports = procedure;
