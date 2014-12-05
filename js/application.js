jQuery(document).ready(function() {

  var dataHousing = []; // an array of hashes
  var urlHousing = 'https://www.quandl.com/api/v1/datasets/AUSBS/641601.json?trim_start=1986-06-30&trim_end=2014-09-30&auth_token=t4na3zBUan6kRH1ovpRY';

  var estSyd = [];
  var estDwn = [];
  var projSyd = [];
  var projDwn = [];


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
            estSyd.push({x: myDate,y: this[1]});
            estDwn.push({x: myDate, y: this[7]});

            // proj Syd & dwn
            projSyd.push({x: myDate, y: this[28]});
            projDwn.push({x: myDate, y: this[34]});
          })
          //console.log('this is est syd '+estSyd);
          initializeHighChart();
        }
      });
  }


  getData(urlHousing, dataHousing);



  function initializeHighChart() {
    $('#chart').highcharts("StockChart",{
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
        data: estSyd.reverse()
      },{
        name: 'DWN Established',
        data: estDwn.reverse()
      },{
        name: 'SYD Project',
        data: projSyd.reverse()
      },{
        name: 'DWN Project',
        data: projDwn.reverse()

      }]
    });

  }









}); // end document ready
