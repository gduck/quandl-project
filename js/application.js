jQuery(document).ready(function() {

  var dataHousing = {}; // an array of hashes
  var urlHousing = 'https://www.quandl.com/api/v1/datasets/AUSBS/641601.json?trim_start=1986-06-30&trim_end=2014-09-30&auth_token=t4na3zBUan6kRH1ovpRY';

  var estSyd = [];
  var estDwn = [];
  var projSyd = [];
  var projDwn = [];
  var haveData = false;

  var chartUser = 'Dale';

  // only on series annotation for now
  var annotationArray = [];
  //var annotationData = {};

  var getData = function(myUrl, myData) {
    $.ajax({
      type: 'GET',
      url: myUrl,
      dataType: 'JSON',
      success: function(response) {

        $(response.data).each(function() {

            // collect each data point
            var myDate = new Date(this[0]);

            // est syd & dwn
            estSyd.push({
              x: myDate,
              y: this[1]
            });
            estDwn.push({
              x: myDate,
              y: this[7]
            });

            // proj Syd & dwn
            projSyd.push({
              x: myDate,
              y: this[28]
            });
            projDwn.push({
              x: myDate,
              y: this[34]
            });
          }) //end for each loop

        // put data in right date order
        estSyd.reverse();
        estDwn.reverse();
        projSyd.reverse();
        projDwn.reverse();

        haveData = true;
        //console.log('this is est syd '+estSyd);
        initializeHighChart();

        // get rid of please wait message
        $('#noChart').html("");

      }
    });
  }

  // trying to retrieve data only if we don't already have it
  // not working at the moment
  //if (haveData == false) {
    getData(urlHousing, dataHousing);
  //} else {
    //initializeHighChart();
  //}


  $('#submit').click(function() {

    //annotationData.title = $('#inputTitle').val();
    //annotationData.content = $('#inputTitle').val();
    //annotationData.x = new Date($('#inputDate').val());
    //annotationData.user = chartUser;

    annotationArray.push({
      title: $('#inputTitle').val(),
      content: $('#inputTitle').val(),
      x: new Date($('#inputDate').val()),
      user: chartUser
    });

    initializeHighChart();
  });




  function initializeHighChart() {
    // var chart = $('#chart').highcharts("StockChart", {
    var chart = new Highcharts.StockChart({
      chart: {
        renderTo: 'chart',
        alignTicks: false
      },
      // key: value
      title: {
        text: 'Historical House Price Indices'
      },
      subtitle: {
        text: 'Sydney and Darwin'
      },
      xAxis: {
        // configuration of xAxis
        type: 'datetime',
        dateTimeLabelFormats: {
          //millisecond: '%H:%M:%S.%L',
          //second: '%H:%M:%S',
          //minute: '%H:%M',
          //hour: '%H:%M',
          day: '%e. %b',
          week: '%e. %b',
          month: '%b \'%y',
          year: '%Y'
        }
      },
      yAxis: {
        // configuration of yAxis
        min: 20,
        max: 200,
        title: {
          text: 'Index'
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
        name: 'SYD Established',
        data: estSyd
      }, {
        name: 'DWN Established',
        data: estDwn
      }, {
        name: 'SYD Project',
        data: projSyd
      }, {
        name: 'DWN Project',
        data: projDwn
      }, {
        id: 'flagSeries',
        type: 'flags',
        name: 'Flags on series',
        data: annotationArray.sort(mySort),
        onSeries: 'dataseries',
        shape: 'squarepin'
      }, {
        id: 'flagAxis',
        type: 'flags',
        name: 'Flags on axis',
        data: [],
        shape: 'squarepin'
      }]
    });
    return chart;
  }

  var mySort = function(obj1, obj2) {
    if (obj1.x < obj2.x){
      return -1;
    }
    if (obj1.x > obj2.x) {
      return 1;
    }
    return 0;
  };



}); // end document ready

// series: [{
//                 name: 'USD to EUR',
//                 data: data,
//                 id: 'dataseries',
//                 tooltip: {
//                     valueDecimals: 4
//                 }
//             }, {
//                 type: 'flags',
//                 name: 'Flags on series',
//                 data: [{
//                     x: Date.UTC(2011, 1, 22),
//                     title: 'On series'
//                 }, {
//                     x: Date.UTC(2011, 3, 28),
//                     title: 'On series'
//                 }],
//                 onSeries: 'dataseries',
//                 shape: 'squarepin'
//             }, {
//                 type: 'flags',
//                 name: 'Flags on axis',
//                 data: [{
//                     x: Date.UTC(2011, 2, 1),
//                     title: 'On axis'
//                 }, {
//                     x: Date.UTC(2011, 3, 1),
//                     title: 'On axis'
//                 }],
//                 shape: 'squarepin'
//             }]
