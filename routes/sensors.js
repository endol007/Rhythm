var express = require('express');
var router = express.Router();
var passport = require('../lib/passport');
var db = require('../lib/mongoose');
var handler = require('../lib/route_sensors_eventHandler');

router.get('/', passport.checkAuthenticate, function(req, res, next) {
  res.render('index', { content: 'sensors', sensors: JSON.stringify(db.listSensors), msg: req.flash('message'), errmsg: req.flash('error') });
});

router.post('/add', passport.checkAuthenticate, handler.save, function(req, res, next) {
  res.redirect('/sensors');
});

router.post('/update', passport.checkAuthenticate, handler.update, function(req, res, next) {
  res.redirect('/sensors');
});

router.post('/delete', passport.checkAuthenticate, handler.remove, function(req, res, next) {
  res.redirect('/sensors');
});

module.exports = router;
