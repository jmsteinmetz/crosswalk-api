var db = require('../dbconnection');
var async = require("async");
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      snomed: {
        id: "snomed",
        desc: "snomed_name"
      },
      icd9: {
        id: "icd9_code",
        desc: "icd9_name"
      },
      icd10: {
        id: "icd10_code",
        desc: "icd10_name"
      }
  }
};

var diagnosis = {

    getAll: function(cb) {
        return db.query("SELECT a.uid, a.effectiveTime, a.active, a.moduleId, a.refSetId, a.snomed_code, a.sctName, a.mapGroup, a.mapPriority, a.mapRule, a.mapAdvice, a.icd10_code, a.icdName, a.mapCategoryId, a.mapCategoryValue FROM sc_snomed_map a", callback);
    },
    getRelated: function(q, cb) {
          var query = [q];

          var a = function (b) {
            let sql = "SELECT "
            + "a.snomed_code AS snomed, a.sctName AS snomed_name, "
            + "a.icd10_code, a.icdName AS icd10_name, "
            + "b.icd_code AS icd9_code, b.icd_Name AS icd9_name "
            + "FROM sc_icd10_map a JOIN sc_icd9_map b ON a.snomed_code=b.snomed_cid WHERE (a.sctName LIKE '%" + query + "%' OR a.snomed_code LIKE '%" + query + "%' OR a.icd10_code LIKE '%" + query + "%' OR b.icd_code LIKE '%" + query + "%' OR b.icd_name LIKE '%" + query + "%')";

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

module.exports = diagnosis;

/**
* @apiDescription Request diagnosis information and all codes related to that request.
* For example, if you know the SNOMED code and want to find the related ICD9 or ICD10 code,
* you can use the API to request that information.
*
* @apiName GetDiagnosis
* @apiGroup Diagnosis Lookup
* @apiExample {curl} Example usage:
*     curl -i http://localhost:3000/api/v1/lookup/diagnosis/V57.89
*
* @api {get} /api/v1/lookup/diagnosis/:id
* @apiVersion 0.1.1
*
* @apiParam {string} query string for diagnosis code (optional), if nothing entered, return all.
*
* @apiSuccess {String} snomed SNOMED code.
* @apiSuccess {String} snomed_name SNOMED description / name.
* @apiSuccess {String} icd10_code ICD10 code.
* @apiSuccess {String} icd10_name ICD10 description / name.
* @apiSuccess {String} icd9_code ICD9 code.
* @apiSuccess {String} icd9_name ICD9 description / name.
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*       snomed: "305839006",
*       snomed_name: "Seen by arts therapy service (finding)",
*       icd10_code: "Z76.89",
*       icd10_name: "Persons encountering health services in other specified circumstances",
*       icd9_code: "V57.89",
*       icd9_name: "Care involving other specified rehabilitation procedure"
*     }
*
* @apiSampleRequest http://localhost:3000/api/v1/lookup/rx/
*/
