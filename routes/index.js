var express = require('express');
var router = express.Router();
var passport = require('../lib/passport');
var db = require('../lib/mongoose');
var handler = require('../lib/route_index_eventHandler');

router.get('/', passport.checkAuthenticate, function(req, res, next) {
  res.render('index', { content: 'maps', options: JSON.stringify(db.getOptions.mapsDefaultLocation), gateways: JSON.stringify(db.listGateways), nodes: JSON.stringify(db.listNodes), msg: req.flash('message'), errmsg: req.flash('error') });
});

router.post('/option/update', passport.checkAuthenticate, handler.updateOption, function(req, res, next) {
  res.redirect('/');
});

router.get('/realtime', passport.checkAuthenticate, function(req, res, next) {
  res.render('realtime');
});

router.get('/login', function(req, res, next) {
  if (req.isAuthenticated()) res.redirect('/logout');
  else res.render('login', { errmsg: req.flash('error') });
});

router.get('/logout', function(req, res, next) {
  if (req.isAuthenticated()) req.logout();
  res.redirect('/login');
});

router.post('/auth', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

module.exports = router;
