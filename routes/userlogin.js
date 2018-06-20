var express = require('express');
var router = express.Router();
var userlogin = require('../models/userlogin');

var db = require('../db');

router.get('/:id/:pw?', function(req, res, next) {
    if (req.params) {
        userlogin.doLookup(req.params, function(err, rows) {
            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        });
    } else {
        res.json(rows);
    }
});

module.exports = router;
