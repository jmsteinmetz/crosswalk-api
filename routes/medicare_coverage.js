var express = require('express');
var router = express.Router();
var medicare_coverage = require('../models/medicare_coverage');
router.get('/:id?', function(req, res, next) {
    if (req.params.id) {
        medicare_coverage.getRelated(req.params.id, function(err, rows) {
            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        });
    } else {
        medicare_coverage.getAll(function(err, rows) {
            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        });
    }
});
module.exports = router;
