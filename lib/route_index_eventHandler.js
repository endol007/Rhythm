var db = require('./mongoose');

var options = db.getOptions;

function updateOption(req, res, next) {
  var query = {
    $set: {
      mapsDefaultLocation: {
        lat: req.body.latitude,
        lng: req.body.longitude
      }
    }
  };

  db.getConnection('INFO').model('option', db.Schema.option).update({ _id: options.id }, query)
  .then(function(res) {
    if (res.n == 0) req.flash('error', 'Option not found.');
    else {
      options.mapsDefaultLocation = {
        lat: req.body.latitude,
        lng: req.body.longitude
      };
      req.flash('message', 'Option successfully updated.');
    }
    next();
  })
  .catch(function(err) {
    console.log('# [Err] index.updateOption\n', err);
    req.flash('error', 'Failed to update option.');
    next();
  });
}

module.exports = {
  updateOption: updateOption
};
