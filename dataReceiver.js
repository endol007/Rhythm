var Parser = require('binary-parser').Parser;
var io = require('socket.io-client');
var socket = io.connect('https://localhost:443', { rejectUnauthorized : false });
var mqtt = require('mqtt').connect('http://localhost:1883');

socket.on('connect', function() {
  console.log('# [Proxy] socket connected');
});

mqtt.on('connect', function() {
  console.log('# [Proxy] mqtt connected');

  mqtt.subscribe('lora/+/up');
});

mqtt.on('message', function(topic, msg) {
  try { msg = JSON.parse(msg); }
  catch (e) { return; }

  try { msg.sensors = dataParse(new Buffer(msg.data, 'Base64')); }
  catch (e) { }

  socket.emit('data', msg);
});

function dataParse(data) {
  if (data.length % 5 != 0) return [];
  var sensors = [];
  var x = new Parser()
    .uint8('code')
    .floatbe('value');

  for (var i = 0; i < data.length; i += 5) {
    var parsed = x.parse(data.slice(i, i + 5));
    sensors.push({ code: parsed.code, value: Number(parsed.value.toFixed(2)) });
  }

  return sensors;
}
