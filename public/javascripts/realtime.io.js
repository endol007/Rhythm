var socket = io('https://' + location.host);

var nodes = {};

socket.on('connect', function () {
  console.log('connected');
});

socket.on('data', function (msg) {
  var eui = msg.deveui;
  var datr = msg.datr;

  if (!nodes[eui] || !isPlay) return;

  if (nodes[eui].currentDatr != datr) {
    nodes[eui].currentDatr = datr;
    nodes[eui].data[datr] = [];
    nodes[eui].last_in = '';
    nodes[eui].rssi = {
      max: 0,
      min: 0,
      avg: 0
    };
    nodes[eui].lsnr = {
      max: 0,
      min: 0,
      avg: 0
    };
    nodes[eui].solar = {
      max: 0,
      min: 0,
      avg: 0
    };
    clearCharts(eui);
  }

  if (count <= nodes[eui].data[datr].length) return;

  var rssi = msg.rssi;
  var lsnr = Number(msg.lsnr);
  var seqn = msg.seqn;
  var solar = msg.solar;
  var interval;

  nodes[eui].interval = interval = nodes[eui].last_in ?
    (new Date(msg.timestamp) - new Date(nodes[eui].last_in)) / 1000 : 0;
  nodes[eui].data[datr].push({ rssi: rssi, lsnr: lsnr, seqn: seqn, interval: interval, solar: solar });
  var values = getMaxMinAvg(nodes[eui].data[datr]);
  nodes[eui].rssi = values.rssi;
  nodes[eui].lsnr = values.lsnr;
  nodes[eui].solar = values.solar
  nodes[eui].last_in = msg.timestamp;

  updateTable(eui);
  updateCharts(eui);
});

function getMaxMinAvg(data) {
  var rssi = { max: -1234, min: 1234, avg: 0 };
  var lsnr = { max: -1234, min: 1234, avg: 0 };
  var solar = { max: -1234, min: 1234, avg: 0 };
  var length = data.length;
  var i = length > 150 ? length - 150 : 0;
  var div = length - i;

  for (; i < length; i++) {
    if (data[i].rssi > rssi.max) rssi.max = data[i].rssi;
    if (data[i].rssi < rssi.min) rssi.min = data[i].rssi;
    if (data[i].lsnr > lsnr.max) lsnr.max = data[i].lsnr;
    if (data[i].lsnr < lsnr.min) lsnr.min = data[i].lsnr;
    if (data[i].lsnr > solar.max) solar.max = data[i].solar;
    if (data[i].lsnr < solar.min) solar.min = data[i].solar;
    solar.avg += data[i],solar;
    rssi.avg += data[i].rssi;
    lsnr.avg += data[i].lsnr;
  }
  rssi.avg = Number((rssi.avg / div).toFixed(2));
  lsnr.avg = Number((lsnr.avg / div).toFixed(2));

  return { rssi: rssi, lsnr: lsnr, solar: solar };
}
