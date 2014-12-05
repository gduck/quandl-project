jQuery(document).ready(function() {

  var dataHK = [];
  var hkUrl = 'http://api.openweathermap.org/data/2.5/history/city?q=HongKong&type=hour';
  var dataDarwin = [];
  var darwinUrl = 'http://api.openweathermap.org/data/2.5/history/city?q=Darwin&type=hour';
  var dataSingapore = [];
  var singaporeUrl = 'http://api.openweathermap.org/data/2.5/history/city?q=Singapore&type=hour';

  var KELVIN = 273.15;

  var myDataObject = [{
    'name': 'Hong Kong',
    'url': 'http://api.openweathermap.org/data/2.5/history/city?q=HongKong&type=hour',
    data: []
  }, {
    'name': 'Singapore',
    'url': 'http://api.openweathermap.org/data/2.5/history/city?q=Singapore&type=hour',
    data: []
  }, {
    'name': 'Darwin',
    'url': 'http://api.openweathermap.org/data/2.5/history/city?q=Darwin&type=hour',
    data: []
  }];

  //var getData = function(dataObject) {
    var getData = function(myUrl, myData) {
    //for (each item in dataObject) {
      $.ajax({
        type: 'GET',
        //url: myUrl,
        url: myUrl,
        dataType: 'JSON',
        success: function(response) {
          // for loop for each item in list
          $(response.list).each(function() {

            // collect each data point
            var dataPoint = {};
            dataPoint.x = this.dt * 1000;
            dataPoint.y = this.main.temp - KELVIN;

            // add each data point to the data array
            myData.push(dataPoint);
          })
          initializeHighChart();
        }
      });
    //} // end for loop
  }


  getData(hkUrl, dataHK);
  getData(darwinUrl, dataDarwin);
  getData(singaporeUrl, dataSingapore);

  // so only run once
  // setTimeout(function(){
  //   // do something
  //   initializeHighChart();
  // }, 1000);
  // better to keep track of completed cities, render when finished


  function initializeHighChart() {
    $('#chart').highcharts({
      // key: value
      title: {
        text: 'Historical Temperatures'
      },
      subtitle: {
        text: 'Openweathermap.org'
      },
      xAxis: {
        // configuration of xAxis
        type: 'datetime',
        dateTimeLabelFormats: {
          millisecond: '%H:%M:%S.%L',
          second: '%H:%M:%S',
          minute: '%H:%M',
          hour: '%H:%M',
          day: '%e. %b',
          week: '%e. %b',
          month: '%b \'%y',
          year: '%Y'
        }
      },
      yAxis: {
        // configuration of yAxis
        min: 10,
        max: 35,
        title: {
          text: 'Temperature (C)'
        }
      },
      legend: {
        // configuration of legend
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },
      series: [{
        // Data points
        name: 'Hong Kong',
        data: dataHK
      }, {
        name: 'Darwin',
        data: dataDarwin
      }, {
        name: 'Singapore',
        data: dataSingapore
      }]
    });

  }









}); // end document ready
