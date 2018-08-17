var db = require('./mongoose');

var charts = db.listCharts;
var nodes = db.listNodes;

function save(req, res, next) {
  var start = new Date(req.body.start);
  var end = new Date(req.body.end);
  start.setTime(start.getTime() - 60000*60*9);
  end.setTime(end.getTime() + 60000*60*15 - 1);

  var query = {
    description: req.body.description,
    id: req.body.id,
    deveui: req.body.deveui,
    params: req.body.params,
    start: start,
    end: end
  };

  db.getConnection('INFO').model('chart', db.Schema.chart)(query).save()
  .then(function(doc) {
    charts.add(doc);
    req.flash('message', 'Chart successfully added.');
    next();
  })
  .catch(function(err) {
    console.log('# [Err] charts.save\n', err);
    req.flash('error', 'Failed to add chart.');
    next();
  });
}

function remove(req, res, next) {
  var query = {
    id: req.body.id
  };

  db.getConnection('INFO').model('chart', db.Schema.chart).remove(query)
  .then(function(res) {
    if (res.n == 0) req.flash('error', 'Chart not found.');
    else {
      delete charts[req.body.id];
      req.flash('message', 'Chart successfully deleted.');
    }
    next();
  })
  .catch(function(err) {
    console.log('# [Err] charts.remove\n', err);
    req.flash('error', 'Failed to delete chart.');
    next();
  });
}

function find(req, res, next) {
  if (!req.query.id || !charts[req.query.id]) return res.render('highcharts', { errmsg: 'Wrong access' });

  var eui = charts[req.query.id].deveui;
  if (!nodes[eui]) return res.render('highcharts', { errmsg: 'Node not found.' });

  var query = {
    time: {
      $gte: charts[req.query.id].start,
      $lte: charts[req.query.id].end
    }
  };

  db.getConnection(nodes[eui].gateway).model('node_' + eui, db.Schema.data).find(query)
  .then(function(docs) {
    if (docs.length) {
      var chart = JSON.stringify(charts[req.query.id]);
      var sensors = JSON.stringify(db.listSensors);
      var data = JSON.stringify(docs);
      res.render('highcharts', { chart: chart, sensors: sensors, data: data, msg: 'Data successfully found.' });
    }
    else res.render('highcharts', { errmsg: 'Data not found.' });
  })
  .catch(function(err) {
    console.log('# [Err] charts.find\n', err);
    res.render('highcharts', { errmsg: 'Failed to find data.' });
  });
}

module.exports = {
  save: save,
  remove: remove,
  find: find
};
