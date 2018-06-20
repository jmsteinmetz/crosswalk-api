var express = require('express');
var router = express.Router();
var patients_eventtype = require('../../models/apm/patients_eventtype');

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
      patients_eventtype.getRelated(req.params, function(err, rows) {
          if (err) {
              res.json(err);
          } else {
              res.json(rows);
          }
      });
  } else {
      patients_eventtype.getAll(function(err, rows) {
          if (err) {
              res.json(err);
          } else {
              res.json(rows);
          }
      });
  }
});

module.exports = router;
