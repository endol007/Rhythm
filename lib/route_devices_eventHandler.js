var db = require('./mongoose');

var options = db.getOptions;
var gateways = db.listGateways;
var nodesInGw = db.nodesInGw;
var nodes = db.listNodes;

function updateOption(req, res, next) {
  var query = {
    $set: {
      devicesDefaultLocation: {
        lat: req.body.latitude,
        lng: req.body.longitude
      }
    }
  };

  db.getConnection('INFO').model('option', db.Schema.option).update({ _id: options.id }, query)
  .then(function(res) {
    if (res.n == 0) req.flash('error', 'Option not found.');
    else {
      options.devicesDefaultLocation = {
        lat: req.body.latitude,
        lng: req.body.longitude
      };
      req.flash('message', 'Option successfully updated.');
    }
    next();
  })
  .catch(function(err) {
    console.log('# [Err] devices.updateOption\n', err);
    req.flash('error', 'Failed to update option.');
    next();
  });
}

function saveGateway(req, res, next) {
  var query = {
    description: req.body.description,
    database: generateId(),
    eui: req.body.eui,
    location: {
      lat: req.body.latitude,
      lng: req.body.longitude
    }
  };

  db.getConnection('INFO').model('gateway', db.Schema.gateway)(query).save()
  .then(function(doc) {
    gateways.add(doc);
    db.addConnection(doc);
    req.flash('message', 'Gateway successfully added.');
    next();
  })
  .catch(function(err) {
    console.log('# [Err] devices.saveGateway\n', err);
    req.flash('error', 'Failed to update gateway.');
    next();
  });
}

function updateGateway(req, res, next) {
  var query = {
    $set: {
      description: req.body.description,
      location: {
        lat: req.body.latitude,
        lng: req.body.longitude
      }
    }
  };

  db.getConnection('INFO').model('gateway', db.Schema.gateway).update({ eui: req.body.eui }, query)
  .then(function(res) {
    if (res.n == 0) req.flash('error', 'Gateway not found.');
    else {
      gateways[req.body.eui].description = req.body.description;
      gateways[req.body.eui].location = {
        lat: req.body.latitude,
        lng: req.body.longitude
      };
      req.flash('message', 'Gateway successfully updated.');
    }
    next();
  })
  .catch(function(err) {
    console.log('# [Err] devices.updateGateway\n', err);
    req.flash('error', 'Failed to update gateway.');
    next();
  });
}

function removeGateway(req, res, next) {
  if (nodesInGw[req.body.eui]) {
    req.flash('error', 'There is a registered node on the gateway.');
    next();

  } else {
    var query = {
      eui: req.body.eui
    };

    db.getConnection('INFO').model('gateway', db.Schema.gateway).remove(query)
    .then(function(res) {
      if (res.n == 0) req.flash('error', 'Gateway not found.');
      else {
        delete gateways[req.body.eui];
        db.removeConnection(req.body.eui);
        req.flash('message', 'Gateway successfully deleted.');
      }
      next();
    })
    .catch(function(err) {
      console.log('# [Err] devices.removeGateway\n', err);
      req.flash('error', 'Failed to delete gateway.');
      next();
    });
  }
}

function saveNode(req, res, next) {
  var query = {
    description: req.body.description,
    gateway: req.body.gateway,
    eui: req.body.eui,
    location: {
      lat: req.body.latitude,
      lng: req.body.longitude
    }
  };

  db.getConnection('INFO').model('node', db.Schema.node)(query).save()
  .then(function(doc) {
    nodes.add(doc);
    nodesInGw[doc.gateway]++;
    req.flash('message', 'Node successfully added.');
    next();
  })
  .catch(function(err) {
    console.log('# [Err] devices.saveNode\n', err);
    req.flash('error', 'Failed to add node.');
    next();
  });
}

function updateNode(req, res, next) {
  var query = {
    $set: {
      description: req.body.description,
      location: {
        lat: req.body.latitude,
        lng: req.body.longitude
      }
    }
  };

  db.getConnection('INFO').model('node', db.Schema.node).update({ eui: req.body.eui }, query)
  .then(function(res) {
    if (res.n == 0) req.flash('error', 'Node not found.');
    else {
      nodes[req.body.eui].description = req.body.description;
      nodes[req.body.eui].location = {
        lat: req.body.latitude,
        lng: req.body.longitude
      };
      req.flash('message', 'Node successfully updated.');
    }
    next();
  })
  .catch(function(err) {
    console.log('# [Err] devices.updateNode\n', err);
    req.flash('error', 'Failed to update node.');
    next();
  });
}

function removeNode(req, res, next) {
  var query = {
    eui: req.body.eui
  };

  db.getConnection('INFO').model('node', db.Schema.node).remove(query)
  .then(function(res) {
    if (res.n == 0) req.flash('error', 'Node not found.');
    else {
      delete nodes[req.body.eui];
      nodesInGw[req.body.gateway]--;
      req.flash('message', 'Node successfully deleted.');
    }
    next();
  })
  .catch(function(err) {
    console.log('# [Err] devices.removeNode\n', err);
    req.flash('error', 'Failed to delete node.');
    next();
  });
}

function generateId() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + s4() + s4();
}

module.exports = {
  updateOption: updateOption,
  saveGateway: saveGateway,
  updateGateway: updateGateway,
  removeGateway: removeGateway,
  saveNode: saveNode,
  updateNode: updateNode,
  removeNode: removeNode
};
