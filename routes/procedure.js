var express = require('express');
var router = express.Router();
var procedure = require('../models/procedure');

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
      procedure.getRelated(req.params.q, function(err, rows) {
          if (err) {
              res.json(err);
          } else {
              res.json(rows);
          }
      });
  } else {
      procedure.getAll(function(err, rows) {
          if (err) {
              res.json(err);
          } else {
              res.json(rows);
          }
      });
  }
});

module.exports = router;
