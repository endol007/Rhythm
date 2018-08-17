var defaultSpecs = {
  chart: {
    type: 'spline',
    zoomType: 'xy',
    animation: false,
    plotBackgroundColor: '#FFFFFF',
    plotShadow: true
  },
  credits: { enabled: false },
  title: { text: '' },
  xAxis: {
    title: { text: 'Count' }
  },
  yAxis: [
    {
      showEmpty: false,
      title: { text: '' }
    }
  ],
  tooltip: {
    shared: true,
    pointFormat: '<span style="color: {series.color}">{series.name}</span>: <b>{point.y}</b> {point.change} <br/>'
  },
  plotOptions: {
    animation: false,
    spline: {
      marker: {
        enabled: true,
        radius: 2
       }
     }
  },
  series: []
};

var charts = {};

function drawChart(id) {
  var specs = JSON.parse(JSON.stringify(defaultSpecs));

  switch (id) {
    case 'rssi':
      specs.yAxis[0].title.text = 'RSSI';
      break;
    case 'lsnr':
      specs.yAxis[0].title.text = 'SNR';
      break;
    case 'interval':
      specs.yAxis[0].title.text = 'Interval';
      break;
  }

  charts[id] = Highcharts.chart(id, specs);
}

function addSeries(eui) {
  for (var x in charts) {
    var pre = x + '_';
    charts[x].addSeries({
      id: pre + eui,
      name: eui,
      data: []
    });

    if (x == 'interval') continue;

    charts[x].addSeries({
      id: pre + eui + '_avg',
      name: eui + '_avg',
      data: []
    });
  }
}

function updateCharts(eui) {
  for (var i in charts) {
    var pre = i + '_';
    var series = charts[i].get(pre + eui);
    var shift = series.data.length > 150;
    var datr = nodes[eui].currentDatr;
    var length = nodes[eui].data[datr].length;
    var series, data;

    if (i == 'interval') {
      data = nodes[eui][i];
      series.addPoint([length, data], true, shift);
    } else {
      data = nodes[eui].data[datr][length-1][i];
      series.addPoint([length, data], false, shift);

      series = charts[i].get(pre + eui + '_avg');
      data = nodes[eui][i].avg;
      series.addPoint([length, data], true, shift);
    }
  }
}

function clearCharts(eui) {
  for (var i in charts) {
    var pre = i + '_';
    var series = charts[i].get(pre + eui);
    if (series) series.remove();

    if (i == 'interval') continue;

    series = charts[i].get(pre + eui + '_avg')
    if (series) series.remove();
  }

  addSeries(eui);
}
