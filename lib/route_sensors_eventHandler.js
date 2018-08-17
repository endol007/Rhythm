var db = require('./mongoose');

var sensors = db.listSensors;

function save(req, res, next) {
  var query = {
    description: req.body.description,
    name: req.body.name,
    code: req.body.code,
  };

  db.getConnection('INFO').model('sensor', db.Schema.sensor)(query).save()
  .then(function(doc) {
    sensors.add(doc);
    req.flash('message', 'Sensor successfully added.');
    next();
  })
  .catch(function(err) {
    console.log('# [Err] sensors.save\n', err);
    req.flash('error', 'Failed to add sensor.');
    next();
  });
}

function update(req, res, next) {
  var query = {
    $set: {
      description: req.body.description,
      name: req.body.name
    }
  };

  db.getConnection('INFO').model('sensor', db.Schema.sensor).update({ code: req.body.code }, query)
  .then(function(res) {
    if (res.n == 0) req.flash('error', 'Sensor not found.');
    else {
      sensors[req.body.code].description = req.body.description;
      sensors[req.body.code].name = req.body.name;
      req.flash('message', 'Successfully updated the sensor.');
    }
    next();
  })
  .catch(function(err) {
    console.log('# [Err] sensors.update\n', err);
    req.flash('error', 'Failed to update sensor.');
    next();
  });
}

function remove(req, res, next) {
  var query = {
    code: req.body.code
  };

  db.getConnection('INFO').model('sensor', db.Schema.sensor).remove(query)
  .then(function(res) {
    if (res.n == 0) req.flash('error', 'Sensor not found.');
    else {
      delete sensors[req.body.code];
      req.flash('message', 'Sensor successfully deleted.');
    }
    next();
  })
  .catch(function(err) {
    console.log('# [Err] sensors.remove\n', err);
    req.flash('error', 'Failed to delete sensor.');
    next();
  });
}

module.exports = {
  save: save,
  update: update,
  remove: remove
};
