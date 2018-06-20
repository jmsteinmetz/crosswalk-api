var express = require('express');
var router = express.Router();
var shape_spline = require('../models/shape_spline');

var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;
var db = require('../db');

passport.use(new Strategy(
  function(token, cb) {
    db.users.findByToken(token, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      return cb(null, user);
    });
  }));

router.get('/:q?', passport.authenticate('bearer', { session: false }),  function(req, res) {
  if (req.params.q) {
      shape_spline.getRelated(req.params.q, function(err, rows) {
          if (err) {
              res.json(err);
          } else {
              res.json(rows);
          }
      });
  } else {
      shape_spline.getAll(function(err, rows) {
          if (err) {
              res.json(err);
          } else {
              res.json(rows);
          }
      });
  }
});

module.exports = router;
