var express = require('express');
var router = express.Router();
var calls_provider = require('../../models/apm/calls_provider');

var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;
var db = require('../../db');

passport.use(new Strategy(
  function(token, cb) {
    db.users.findByToken(token, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      return cb(null, user);
    });
  }));

router.get('/:q/:shape?', passport.authenticate('bearer', { session: false }),  function(req, res) {
  if (req.params.q) {
      req.params.tenantid = req.user.tenantid;
      calls_provider.getRelated(req.params, function(err, rows) {
          if (err) {
              res.json(err);
          } else {
              res.json(rows);
          }
      });
  } else {
      calls_provider.getAll(function(err, rows) {
          if (err) {
              res.json(err);
          } else {
              res.json(rows);
          }
      });
  }
});

module.exports = router;
