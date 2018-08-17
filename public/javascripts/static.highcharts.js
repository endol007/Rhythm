var specs = {
  chart: {
    type: 'spline',
    zoomType: 'x',
    animation: false,
    plotBackgroundColor: '#FFFFFF',
    plotShadow: true
  },
  credits: { enabled: false },
  title: { text: '' },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: { month: '%e. %b', year: '%b' },
    // minRange: 60000*30,
    title: { text: 'Time' }
  },
  yAxis: [{
    showEmpty: false,
    title: { text: '' }
  }, {
    opposite: true,
    showEmpty: false,
    title: { text: '' }
  }],
  tooltip: {
    shared: true,
    pointFormat: '<span style="color: {series.color}">{series.name}</span>: <b>{point.y}</b> {point.change} <br/>'
  },
  plotOptions: {
    animation: false,
    spline: {
      marker: { enabled: false }
     }
  },
  series: []
};

function sortByTime(a, b) {
  return a.time > b.time ? 1 : a.time < b.time ? -1 : 0;
}

function dataProcess(chart, sensors, data) {
  return new Promise(function(resolve, reject) {
    data = data.sort(sortByTime);
    var params = {};

    if (chart.params == 'sensors') {
      for (var i in data) {
        var time = new Date(data[i].time).getTime() + 60000*60*9;
        for (var j in data[i].sensors) {
          var code = data[i].sensors[j].code
          if (!sensors[code]) continue;
          var name = sensors[code].name;
          if (!params[name]) {
            params[name] = {
              data: [],
              count: 0
            };
          }
          params[name].data[params[name].count++] = [time, data[i].sensors[j].value];
        }
      }

      if (!Object.keys(params).length) return reject('Data not found.');
    } else {
      params.RSSI = {
        data: [],
        count: 0
      };
      params.SNR = {
        data: [],
        count: 0
      };
      params.Seqn = {
        data: [],
        count: 0
      };
      params.Solar = {
        data: [],
        count: 0
      };

      for (var x in data) {
        var time = new Date(data[x].time).getTime() + 60000*60*9;

        if (data[x].rssi) params.RSSI.data[params.RSSI.count++] = [time, data[x].rssi];
        if (data[x].lsnr) params.SNR.data[params.SNR.count++] = [time, data[x].lsnr];
        if (data[x].seqn) params.Seqn.data[params.Seqn.count++] = [time, data[x].seqn];
        if (data[x].rssi) params.RSSI.data[params.Solar.count++] = [time, data[x].Solar];
      }
    }

    resolve({ chart: chart, params: params });
  })
}

function drawChart(data) {
  specs.title.text = data.chart.description ? data.chart.description : 'no description';

  for (var x in data.params) {
    var index = specs.series.length;
    var yAxisIndex = index < 2 ? 0 : 1;

    specs.yAxis[yAxisIndex].title.text += x + ', ';
    specs.series[index] = {
      name: x,
      data: data.params[x].data,
      yAxis: yAxisIndex,
      visible: true
    }
  }

  var yAxisText = [specs.yAxis[0].title.text, specs.yAxis[1].title.text];
  specs.yAxis[0].title.text = yAxisText[0] ? yAxisText[0].substring(0, yAxisText[0].length-2) : '';
  specs.yAxis[1].title.text = yAxisText[1] ? yAxisText[1].substring(0, yAxisText[1].length-2) : '';

  Highcharts.chart('chart', specs);
}

function drawEmpty() {
  Highcharts.chart('chart', {
    chart: {
      plotBackgroundColor: '#FFFFFF',
      plotBorderWidth: null,
      plotShadow: true
    },
    credits: {enabled: false},
    title: {
    style: {display: 'none'}
    }
  });
}
