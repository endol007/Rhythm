var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var mongo_url = 'mongodb://localhost:27017/';
var nodesInGw = {};
var connections = {
  INFO: mongoose.createConnection(mongo_url + 'informations'),
  add: function(x) {
    connections[x.eui] = mongoose.createConnection(mongo_url + 'gw_' + x.database);
    nodesInGw[x.eui] = 0;
  },
  remove: function(x) {
    delete connections[x];
    delete nodesInGw[x];
  },
  get: function(x) {
    return connections[x];
  }
};
var options = {
  mapsDefaultLocation: {
    lat: 0,
    lng: 0
  },
  devicesDefaultLocation: {
    lat: 0,
    lng: 0
  }
};
var gateways = {
  add: function(x) {
    gateways[x.eui] = {
      description: x.description,
      database: x.database,
      eui: x.eui,
      location: x.location
    };
  }
};
var nodes = {
  add: function(x) {
    nodes[x.eui] = {
      description: x.description,
      gateway: x.gateway,
      location: x.location,
      eui: x.eui,
      rssi: '',
      joined: x.joined,
      last_in: '',
      interval: ''
    };
  }
};
var sensors = {
  add: function(sensor) {
    sensors[sensor.code] = {
      description: sensor.description,
      code: sensor.code,
      name: sensor.name
    };
  }
};
var charts = {
  add: function(chart) {
    charts[chart.id] = {
      description: chart.description,
      id: chart.id,
      deveui: chart.deveui,
      params: chart.params,
      start: chart.start,
      end: chart.end
    };
  }
};

// Schemas
var userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  passwd: { type: String, required: true }
});

var optionSchema = new mongoose.Schema({
  mapsDefaultLocation: {
    lat: Number,
    lng: Number
  },
  devicesDefaultLocation: {
    lat: Number,
    lng: Number
  }
});

var dataSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  lsnr: Number,
  rssi: Number,
  seqn: Number,
  sensors: []
});

var gatewaySchema = new mongoose.Schema({
  description: String,
  database: { type: String, required: true },
  eui: { type: String, unique: true, required: true },
  location: {
    lat: Number,
    lng: Number
  }
});

var nodeSchema = new mongoose.Schema({
  description: String,
  gateway: { type: String, required: true },
  eui: { type: String, unique: true, required: true },
  joined: { type: Date, default: Date.now },
  location: {
    lat: Number,
    lng: Number
  }
});

var sensorSchema = new mongoose.Schema({
  description: String,
  code: { type: Number, unique: true, required: true },
  name: { type: String, unique: true, required: true }
});

var chartSchema = new mongoose.Schema({
  description: String,
  id: { type: String, unique: true, required: true },
  deveui: { type: String, required: true },
  params: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true }
});

(function sync() {
  connections.INFO.model('option', optionSchema).find()
  .then(function(docs) {
    options.id = docs[0]._id;
    options.mapsDefaultLocation = docs[0].mapsDefaultLocation,
    options.devicesDefaultLocation = docs[0].devicesDefaultLocation
  })
  .catch(init);

  connections.INFO.model('gateway', gatewaySchema).find()
  .then(function(docs) {
    for (var x in docs) {
      connections.add(docs[x]);
      gateways.add(docs[x]);
      if (!nodesInGw[docs[x].eui]) nodesInGw[docs[x].eui] = 0;
    }
  })
  .catch(function(err) {
    console.log('# [Err] db.sync.gateways\n', err);
  });

  connections.INFO.model('node', nodeSchema).find()
  .then(function(docs) {
    for (var x in docs) {
      nodes.add(docs[x]);
      nodesInGw[docs[x].gateway] = nodesInGw[docs[x].gateway] ? nodesInGw[docs[x].gateway] + 1 : 1;
    }
  })
  .catch(function(err) {
    console.log('# [Err] db.sync.nodes\n', err);
  });

  connections.INFO.model('sensor', sensorSchema).find()
  .then(function(docs) {
    for (var x in docs) {
      sensors.add(docs[x]);
    }
  })
  .catch(function(err) {
    console.log('# [Err] db.sync.sensors\n', err);
  });

  connections.INFO.model('chart', chartSchema).find()
  .then(function(docs) {
    for (var x in docs) {
      charts.add(docs[x]);
    }
  })
  .catch(function(err) {
    console.log('# [Err] db.sync.charts\n', err);
  });
})();

function init() {
  var admin = {
    id: 'admin',
    passwd: '1234'
  };
  connections.INFO.model('user', userSchema)(admin).save();

  var opt = {
    mapsDefaultLocation: {
      lat: 37.375214108770564,
      lng: 126.63304122560976
    },
    devicesDefaultLocation: {
      lat: 37.375214108770564,
      lng: 126.63304122560976
    }
  };
  connections.INFO.model('option', optionSchema)(opt).save()
  .then(function(doc) {
    options.id = doc._id;
    options.mapsDefaultLocation = doc.mapsDefaultLocation,
    options.devicesDefaultLocation = doc.devicesDefaultLocation
  });
};

module.exports = {
  addConnection: connections.add,
  removeConnection: connections.remove,
  getConnection: connections.get,
  getOptions: options,
  listGateways: gateways,
  nodesInGw: nodesInGw,
  listNodes: nodes,
  listSensors: sensors,
  listCharts: charts,
  Schema: {
    user: userSchema,
    option: optionSchema,
    data: dataSchema,
    gateway: gatewaySchema,
    node: nodeSchema,
    sensor: sensorSchema,
    chart: chartSchema
  }
};
