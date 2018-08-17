var express = require('express');
var router = express.Router();
var passport = require('../lib/passport');
var db = require('../lib/mongoose');
var handler = require('../lib/route_devices_eventHandler');

router.get('/', passport.checkAuthenticate, function(req, res, next) {
  res.render('index', { content: 'devices', options: JSON.stringify(db.getOptions.devicesDefaultLocation), gateways: JSON.stringify(db.listGateways), nodes: JSON.stringify(db.listNodes), msg: req.flash('message'), errmsg: req.flash('error') });
});

router.post('/option/update', passport.checkAuthenticate, handler.updateOption, function(req, res, next) {
  res.redirect('/devices');
});

router.post('/gw/add', passport.checkAuthenticate, handler.saveGateway, function(req, res, next) {
  res.redirect('/devices');
});

router.post('/gw/update', passport.checkAuthenticate, handler.updateGateway, function(req, res, next) {
  res.redirect('/devices');
});

router.post('/gw/delete', passport.checkAuthenticate, handler.removeGateway, function(req, res, next) {
  res.redirect('/devices');
});

router.post('/node/add', passport.checkAuthenticate, handler.saveNode, function(req, res, next) {
  res.redirect('/devices');
});

router.post('/node/update', passport.checkAuthenticate, handler.updateNode, function(req, res, next) {
  res.redirect('/devices');
});

router.post('/node/delete', passport.checkAuthenticate, handler.removeNode, function(req, res, next) {
  res.redirect('/devices');
});

module.exports = router;
