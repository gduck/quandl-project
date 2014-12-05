jQuery(document).ready(function() {

  var dataWk = [];
  var urlGas = 'https://www.quandl.com/api/v1/datasets/BTS_MM/RETAILGAS.json?trim_start=1995-01-02&trim_end=2012-10-15&auth_token=E6kNzExHjay2DNP8pKvB';
  var dataMth = [];
  var dataQtr = [];
  var dataYr = [];

    var getData = function(myUrl, myData) {
      $.ajax({
        type: 'GET',
        //url: myUrl,
        url: myUrl,
        dataType: 'JSON',
        success: function(response) {
          $(response.data).each(function() {

            // collect each data point
            var dataPoint = {};
            var myDate = new Date(this[0]);
            dataPoint.x = myDate; // date weekly
            dataPoint.y = this[1]; // price

            // add each data point to the data array
            myData.push(dataPoint);
          })

          // date data is in chronological order
          myData.reverse();

          avData(4, dataWk, dataMth);
          avData(13, dataWk, dataQtr);
          avData(52, dataWk, dataYr);

          initializeHighChart();
        }
      });
  }

    var avData = function(numPeriods, origDataArray, newDataArray) {
      var arrayLength = origDataArray.length;
      // x is date, y is price

      for (var i = 0; i < arrayLength; i++ ) {
        var averagePrice = 0;

        var dataPoint = {};

        if (i < numPeriods) {
        // for first numPeriods of data, no average, no data
        } else {
          // date is the same regardless
          dataPoint.x = origDataArray[i].x; // date

          // need to find average for last numPeriods
          for (var j = i - numPeriods; j < i; j++ ){
            averagePrice += origDataArray[j].y;
          }
          averagePrice /= numPeriods;
          averagePrice = parseFloat(averagePrice.toFixed(2));
          // set datapoint average price
          dataPoint.y = averagePrice;
          averagePrice = 0;

          newDataArray.push(dataPoint);
        }  
      }
    }



  getData(urlGas, dataWk);



  function initializeHighChart() {
    $('#chart').highcharts("StockChart",{
      // key: value
      title: {
        text: 'Historical Gasoline Prices'
      },
      subtitle: {
        text: 'quandl'
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
        min: 0.50,
        max: 4.50,
        title: {
          text: 'Prices $'
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
        name: 'Weekly Average',
        data: dataWk
      },{
        name: 'Monthly Average',
        data: dataMth
      },{
        name: 'Quarterly Average',
        data: dataQtr
      },{
        name: 'Annual Average',
        data: dataYr

      }]
    });

  }









}); // end document ready
