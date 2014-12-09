jQuery(document).ready(function() {


    var urlHousing = 'https://www.quandl.com/api/v1/datasets/AUSBS/641601.json?trim_start=1986-06-30&trim_end=2014-09-30&auth_token=t4na3zBUan6kRH1ovpRY';
    var chartUser = 'Dale';

    var dataHousing = {};
    var highChart;
    var annotationArray = [];

    // get housing data, put into global dataHousing, initializeHighChart
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
                        //var myDate = new Date(this[0]);
                        var myDate = moment(this[0]);
                        console.log(myDate);

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
                highChart = initializeHighChart(dataHousing);

                // get rid of please wait message
                $('#noChart').html("");
            }

        });
        return dataHousing;
    }

    // GET annotation list, put into global annotationArray,
    // (re)initializeHighChart, clear existing table & write new data into it
    var createAnnotationList = function(annotations) {
        $.ajax({
            type: 'GET',
            url: "http://ga-wdi-api.meteor.com/api/posts/search/Dale",
            dataType: 'JSON',
            success: function(response) {
                annotationArray = [];
                $(response).each(function() {
                    annotationArray.push({
                        id: this._id,
                        dateCreated: this.dateCreated,
                        title: this.title,
                        content: this.text,
                        user: this.user,
                        x: this.x
                    });
                });

                initializeHighChart(dataHousing);

                // delete all rows & redraw each time
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
                    var aDate = moment(annotationArray[i].x, 'x');
                    cellDate.innerHTML = aDate.format('MMMM YYYY');

                    var cellUser = row.insertCell(3);
                    cellUser.innerHTML = annotationArray[i].user;

                    var cellButtons = row.insertCell(4);
                    cellButtons.innerHTML = '<button data-id="' + annotationArray[i].id + '" class="update-button btn btn-default"' + 'data-toggle="modal" data-target="#myModal">Update</button>' + '<button data-id="' + annotationArray[i].id + '" class="delete-button btn btn-danger">Delete</button>';
                }
            }
        });
    }

    // set up new chart, series & flags
    var initializeHighChart = function(dataHousing) {
        var newChart = $('#chart').highcharts("StockChart", {
            // var newChart = new Highcharts.StockChart({
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
                data: dataHousing[2],
                id: 'dataseries'

            }, {
                name: 'DWN Project',
                data: dataHousing[3]
            }, {
                // need to identify which series of data the flag will sit on
                id: 'flagSeries',
                type: 'flags',
                name: 'Flags on series',
                data: annotationArray.sort(mySort),
                onSeries: 'dataseries',
                shape: 'squarepin'
            }]
        });

        return newChart;
    }

    // POST data passed to it, call createAnnotationList on success
    var submitAnnotation = function(dataObject) {
        $.ajax({
            type: 'POST',
            url: 'http://ga-wdi-api.meteor.com/api/posts',
            dataType: 'JSON',
            data: {
                user: dataObject.user,
                title: dataObject.title,
                text: dataObject.content,
                x: dataObject.date.valueOf()
            },
            success: function(response) {
                createAnnotationList(annotationArray);
                console.log("submitAnnotation was successful")
            }
        })
    }

    // DELETE data from server given the unique ID, (re)createAnnotationList
    var removeAnnotation = function(keyID) {
        $.ajax({
            type: 'DELETE',
            url: 'http://ga-wdi-api.meteor.com/api/posts/' + keyID,
            success: function(response) {
                createAnnotationList(annotationArray);
                console.log("removeAnnotation was successful");
            }
        })
    }

    var updateAnnotation = function(dataObject, keyID) {
        //var time = moment(dataObject.editDate, 'x');
        //console.log("in update annotation time is " + time);
        var submission = {};
        submission = dataObject;

        submission.user = chartUser;
        submission.dateModified = moment();
        var unixTimeDate = moment(submission.editDate, "YYYY-MM");
        submission.editDate = unixTimeDate;

        console.log(submission);

        $.ajax({
            type: 'PUT',
            url: 'http://ga-wdi-api.meteor.com/api/posts/' + keyID,
            data: {
                user: submission.user,
                title: submission.editTitle,
                text: submission.editContent,
                x: submission.editDate.valueOf(),
                dateModified: submission.dateModified.valueOf()
            },
            success: function(response) {
                createAnnotationList(annotationArray);
                console.log("updateAnnotation was successful")
            }
        })
    }

    // $('whateverform').on('submit', function (e){
    //   console.log(e);
    //   e.preventDefaul();
    //   do whatever you want it to do here
    // })

    // $(document).on('submit', function(e) {
    //     console.log(e);
    //     e.preventDefault();
    // });



    // submit data, serialize and call SubmitAnnotation
    $('#submit').click(function() {
        if (validateForm('#annotation-form')) {

            // serialize into a new Object
            var formData = $('form#annotation-form').serializeObject();

            // add extra data to the new object
            formData.user = chartUser;
            formData.dateCreated = moment();
            formData.date = moment(formData.date, "YYYY-MM");
            submitAnnotation(formData);
        } else {
            alert("Annotation not uploaded");
        }
        clearForm();
        highChart = initializeHighChart(dataHousing);
    });



    // find the unique ID from the data-id of the button, removeAnnotation(ID)
    $(document).on('click', '.delete-button', function() {
        var keyID = $(this).data('id');
        removeAnnotation(keyID);
    });



    // put the data in the modal form for updating
    $(document).on('click', '.update-button', function() {
        var keyID = $(this).data('id');

        fillModal(keyID);
        $('#myModal').modal({
            show: true,
            closeOnEscape: true
        });
    }); //close click



    $(document).on('click', '#save-changes', function() {
        var keyID = $(this).data('id');

        if (validateForm) {

            // serialize into a new Object
            var formData = $('form#update-annotation-form').serializeObject();

            // add extra data to the new object
            // formData.user = chartUser;
            // formData.dateModified = moment();
            // debugger
            // formData.editDate = moment(formData.editDate, "YYYY-MM");
            // debugger
            // console.log(formData);
            updateAnnotation(formData, keyID);
        };
    }); //close click

    // fill the form and change the button to be an update button
    // later add a cancel button
    var fillModal = function(keyID) {
        $.ajax({
            type: 'GET',
            url: 'http://ga-wdi-api.meteor.com/api/posts/' + keyID,
            success: function(response) {

                $('#edit-title').val(response.title);
                $('#edit-content').val(response.text);
                //$('#edit-date').val(new Date(response.x));

                // put moment date into the date field
                var thisDate = moment(response.x, 'x');
                $('#edit-date').val(thisDate.format("YYYY-MM"));

                // put dataID into savechanges button
                $('#save-changes').attr('data-id', keyID);
            }
        })
    }


    var clearForm = function() {
        $('#inputTitle').val("");
        $('#inputContent').val("");
        $('#inputDate').val("");
    }

    // required to sort the annotation list by date
    var mySort = function(obj1, obj2) {
        if (obj1.x < obj2.x) {
            return -1;
        }
        if (obj1.x > obj2.x) {
            return 1;
        }
        return 0;
    };

    // no validation yet
    var validateForm = function(formID) {
        return true;
    }


    getHouseData(urlHousing);
    createAnnotationList(annotationArray);

    // $(document).ready(function() {
    //   $('a[data-toggle=modal], button[data-toggle=modal]').click(function () {
    //     var data_id = '';
    //     if (typeof $(this).data('id') !== 'undefined') {
    //       data_id = $(this).data('id');
    //     }
    //     $('#my_element_id').val(data_id);
    //   })
    // });




    // to modify

}); // end document ready
