jQuery(document).ready(function() {

  var dataHousing = {}; // an array of hashes
  var urlHousing = 'https://www.quandl.com/api/v1/datasets/AUSBS/641601.json?trim_start=1986-06-30&trim_end=2014-09-30&auth_token=t4na3zBUan6kRH1ovpRY';
  //var haveData = false;

  var chartUser = 'Dale';
  var chart;

  // only on series annotation for now
  var annotationArray = [];
  //var annotationData = {};

  var getHouseData = function(myUrl) {
    $.ajax({
      type: 'GET',
      url: myUrl,
      dataType: 'JSON',
      success: function(response) {
        var estSyd = [];
        var estDwn = [];
        var projSyd = [];
        var projDwn = [];
        $(response.data).each(function() {

            // collect each data point
            var myDate = new Date(this[0]);

            // established homes for Sydney & Darwin
            estSyd.push({
              x: myDate,
              y: this[1]
            });
            estDwn.push({
              x: myDate,
              y: this[7]
            });

            // new project homes for Sydney & Darwin
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

        dataHousing = [estSyd, estDwn, projSyd, projDwn];
        //haveData = true;

        chart = initializeHighChart();

        // get rid of please wait message
        $('#noChart').html("");
      }

    });
    return dataHousing;
  }

  var createAnnotationList = function() {
    $.ajax({
      type: 'GET',
      url: "http://ga-wdi-api.meteor.com/api/posts/search/Dale",
      dataType: 'JSON',
      success: function(response) {
        $(response).each(function() {
          annotationArray.push({
            id: this._id,
            dateCreated: this.dateCreated,
            title: this.title,
            content: this.text, // change to content for my data
            user: this.user,
            x: this.x
          });
        });
        // for now - delete all rows & redraw each time
        $('#annotation-table tr:not(:first)').remove();

        // still in success function, now draw table
        var table = document.getElementById('annotation-table');
        
        for (var i = 0; i < annotationArray.length; i++) {
          var row = table.insertRow(1);
          row.id = annotationArray[i].id;

          var cellTitle = row.insertCell(0);
          cellTitle.innerHTML = annotationArray[i].title;

          var cellContent = row.insertCell(1);
          cellContent.innerHTML = annotationArray[i].content;

          var cellDate = row.insertCell(2);
          // below * 1 is needed to get it to recognise as a number(???)
          var aDate = new Date(annotationArray[i].x * 1);
                  // stupid date stuff
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          cellDate.innerHTML = (months[(aDate.getMonth())] + " " + aDate.getFullYear());

          var cellUser = row.insertCell(3);
          cellUser.innerHTML = annotationArray[i].user;

          var cellButtons = row.insertCell(4);
          cellButtons.innerHTML =
            '<button class=\"update-button btn btn-default\">Update</button>\
                  <button class=\"delete-button btn btn-danger\">Delete</button>';
        }

      }
    });
  };

  var validateForm = function(formID) {
    return true;
  }

  var removeAnnotation = function(keyID) {
    $.ajax({
      type: 'DELETE',
      url: 'http://ga-wdi-api.meteor.com/api/posts/' + keyID,
      success: function(response) {
        alert("something was removed");
      }
    })
  }

  $('#submit').click(function() {
    //$('#annotationForm').submit(function(e) {
    //console.log(e);
    //e.preventDefault();
    //submitAnnotation( returnFormContents('new-annotation-form'));
    if (validateForm('#annotation-form')) {
      var formData = $('form#annotation-form').serializeObject();
      formData.user = chartUser;
      formData.dateCreated = new Date() * 1000;
      formData.date = new Date(formData.date) * 1000;
      submitAnnotation(formData);
    } else {
      alert("Annotation not uploaded");
    }
    //var formData = returnFormContents('annotation-form');

    // annotationArray.push({
    //   title: $('#inputTitle').val(),
    //   content: $('#inputTitle').val(),
    //   x: new Date($('#inputDate').val()),
    //   user: chartUser
    // });

    initializeHighChart();
  });

  // $('.delete-button').click(function() {
    $(document).on('click', '.delete-button', function() {
    console.log("ok we are clicking delete");
    // this is the row
    rowToDelete = $(this).parent().parent();
    console.log(rowToDelete);
    console.log($(rowToDelete).id);
    var keyID = $(this).parent().parent().id;
    console.log(keyID);
    // $.ajax({
    //   type: 'DELETE',
    //   url: 'http://ga-wdi-api.meteor.com/api/posts/DZWPnTG2943FE3NSZ',
    //   success: function(response) {
    //     alert("blah blah");
    //    }
    // })
  });

  var initializeHighChart = function() {
    // var chart = $('#chart').highcharts("StockChart", {
    var newChart = new Highcharts.StockChart({
      chart: {
        renderTo: 'chart',
        alignTicks: false,
        events: {
          // click: function(e) {
          //   // find the clicked values and the series
          //   var x = e.xAxis[0].value,
          //     y = e.yAxis[0].value,
          //     series = this.series[0];

          //   // Add it
          //   series.addPoint([x, y]);
          // }
        }
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
        data: dataHousing[0]
      }, {
        name: 'DWN Established',
        data: dataHousing[1]
      }, {
        name: 'SYD Project',
        data: dataHousing[2]
      }, {
        name: 'DWN Project',
        data: dataHousing[3]
      }, {
        // need to identify which series of data the flag will sit on
        id: 'flagSeries',
        type: 'flags',
        name: 'Flags on series',
        data: annotationArray.sort(mySort),
        onSeries: '',
        shape: 'squarepin'
      }, {
        id: 'flagAxis',
        type: 'flags',
        name: 'Flags on axis',
        data: [],
        shape: 'squarepin'
      }]
    });
    return newChart;
  }

  var mySort = function(obj1, obj2) {
    if (obj1.x < obj2.x) {
      return -1;
    }
    if (obj1.x > obj2.x) {
      return 1;
    }
    return 0;
  };

  var submitAnnotation = function(dataObject) {
    $.ajax({
      type: 'POST',
      url: 'http://ga-wdi-api.meteor.com/api/posts',
      dataType: 'JSON',
      data: {
        user: dataObject.user,
        title: dataObject.title,
        text: dataObject.content,
        // some problem rendering graph, annotation date not correct format
        x: dataObject.date
      },
      success: function(response) {
        alert("Something was successful");
        createAnnotationList();
      }
    })
  };

  // it would be nice to implement re render only on page refresh
  getHouseData(urlHousing);
  createAnnotationList();
  //getAnnotations();

// to modify
// $.ajax({
//   type: 'PUT',
//   url: 'http://ga-wdi-api.meteor.com/api/posts/fuwvsqpupYBWgGmhX',
//   data: {
//   x: "638928000000",
//   dateModified: new Date()
//   },
//   dataType: 'JSON',
//   success: function(response) {
//     alert("blah blah");
//   }
// })


}); // end document ready
