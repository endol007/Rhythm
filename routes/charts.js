var express = require('express');
var router = express.Router();
var passport = require('../lib/passport');
var db = require('../lib/mongoose');
var handler = require('../lib/route_charts_eventHandler');

router.get('/', passport.checkAuthenticate, function(req, res, next) {
  res.render('index', { content: 'charts', charts: JSON.stringify(db.listCharts), nodes: JSON.stringify(db.listNodes), msg: req.flash('message'), errmsg: req.flash('error') });
});

router.get('/draw', passport.checkAuthenticate, handler.find);

router.post('/add', passport.checkAuthenticate, handler.save, function(req, res, next) {
  res.redirect('/charts');
});

router.post('/delete', passport.checkAuthenticate, handler.remove, function(req, res, next) {
  res.redirect('/charts');
});

module.exports = router;
