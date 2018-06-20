var db = require('../dbconnection');
var async = require("async");
var DataTransform = require("node-json-transform").DataTransform;

var map = {
  item: {
      uuid: "id",
      rx: {
        rx: "rx",
        rx_code: "rx_code",
        rx_type: "rx_type",
        rx_brand: "rx_brand"
      },
      ndc: "ndc"
  }
};

var rx = {

    getAll: function(cb) {

      var a = function (b) {
        let sql = "SELECT a.id, a.rx, a.rx_code, a.rx_type, a.rx_brand, a.ndc FROM sc_rxnorm_ndc a";

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
          let sql = "SELECT a.id, a.rx, a.rx_code, a.rx_type, a.rx_brand, a.ndc FROM sc_rxnorm_ndc a "
          + "WHERE (a.rx LIKE '%" + query + "%' OR a.rx_code LIKE '%" + query + "%' OR a.rx_type LIKE '%" + query + "%' OR a.rx_brand LIKE '%" + query + "%' OR a.ndc LIKE '%" + query + "%')";

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

module.exports = rx;

/**
* @apiDescription Request rx information and all codes related to that request.
* For example, if you know the RX Norm code and want to find the related NCD code,
* you can use the API to request that information.
*
* @apiName GetRx
* @apiGroup Rx Lookup
* @apiExample {curl} Example usage:
*     curl -i http://localhost:3000/api/v1/lookup/rx/577095
*
* @api {get} api/v1/lookup/rx/:id
* @apiVersion 0.1.0
*
* @apiParam {string} search string for rx code (optional), if nothing entered, return all.
*
* @apiSuccess {String} id Unique SocialCare ID (may change over time).
* @apiSuccess {String} rx code for the requested query.
* @apiSuccess {String} rx_code The RX Norm Code for the requested query.
* @apiSuccess {String} rx_type The RX type (ex: clinical) for the requested query.
* @apiSuccess {String} rx_brand RX brand for for the requested query.
* @apiSuccess {String} ndc NDC code for the requested query.
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*       id: 1,
*       rx: "6809",
*       rx_code: "577095",
*       rx_type: "Clinical",
*       rx_brand: "Metformin 850 MG / pioglitazone 15 MG Oral Tablet",
*       ndc: "11532002201"
*     }
*
* @apiSampleRequest http://localhost:3000/api/v1/lookup/rx/
*/
