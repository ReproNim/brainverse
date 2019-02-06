let collectionObj = JSON.parse(localStorage.getItem("collectionObj"));

$("#dc-export").select2();

function getInstruments(dc) {
    return new Promise(function (resolve) {
        $.ajax({
            type: "GET",
            url: serverURL + "/query/graphs/projects/" + dc + "/instruments",
            accept: "application/json",
            success: function (data) {
                console.log('instrument list received :success', data);
                resolve(data);
            }//data
        })
    })
}

getInstruments(collectionObj['ID']).then(function (values) {
    console.log("[dc-export.js: getInstruments] values: ", values);
    $.each(values.instruments, function (i, instrument) {
        let splittedValues = instrument.split("#");
        $("#dc-export").append('<option value="splittedValues[1]">' + splittedValues[1] + '</option>');
    })

});

$("#dc-export").change(function () {
    let sourceUrl = serverURL + '/query/graphs/instrument/' + collectionObj['ID'] + '/' + $('#dc-export :selected').text();
    console.log("sourceurl", sourceUrl);
    getInstrumentFields(sourceUrl);
});

function getInstrumentFields(sourceUrl) {
    $.ajax({
        type: "GET",
        url: sourceUrl,
        accept: "application/json",
        success: function (data) {
            console.log('getInstrumentFields: success', data);
            if (data) {
                let tabledata = '';
                $.each(data["instrument fields"], function (i, field) {
                    let fieldValues = field.split("#");
                    tabledata += '<tr>\
                  <td class="td-chk"><input class="form-check-input"  value=\"' + fieldValues[1] + '\" type="checkbox" name="insfield-checkbox" id="insfield"></td>\
                  <td class="td-term"> ' + fieldValues[1] + '</td>\
                  </tr>';
                });

                $("#div-fieldsTable").empty();
                $("#div-fieldsTable").append('<div><table border="0" class="table table-striped">\
                <thead><tr>\
                <th class="th-head-1"><input class="form-check-input"  type="checkbox" name="selectall-checkbox" id="selectall-checkbox">&nbsp;Select</th>\
                <th class="th-head-2">Instrument Fields</th>\
                </tr></thead><tbody>' + tabledata + '</tbody></table></div> ');
                // end for each

                //select all checkboxes
                $('input[id="selectall-checkbox"]').change(function () {  //"select all" change
                    $('input[id="insfield"]').prop('checked', $(this).prop("checked")); //change all into checked status
                });

                //".checkbox" change
                $('input[id="insfield"]').change(function () {
                    //uncheck "select all", if one of the listed checkbox item is unchecked
                    if (false == $(this).prop("checked")) { //if this item is unchecked
                        $('input[id="selectall-checkbox"]').prop('checked', false); //change "select all" checked status to false
                    }
                    //check "select all" if all checkbox items are checked
                    if ($('input[id="insfield"]:checked').length == $('input[id="insfield"]').length) {
                        $('input[id="selectall-checkbox"]').prop('checked', true);
                    }
                });
            } // end if
        } // end of success
    }) // ajax call
}

$('#btn-export-csv').click(function () {
    var selectedValues = $('input[id="insfield"]:checked').map(function () {
        return this.value;
    }).toArray().join("|");

    if (!selectedValues) {
        alert("Select atleast one field!");
        return false;
    }

    let sourceUrl = serverURL + '/query/graphs/instrument/' + collectionObj['ID'] + '/' + $('#dc-export :selected').text();
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({"selectedFields": selectedValues}),
        url: sourceUrl,
        success: function (data) {
            if (data) {
                console.log('Going to Export to CSV ', data);
                downloadCSV({filename: "data-acquisition.csv", data: data.field_subjects});

            } // end if

        } // end of success
    }) // ajax call
});

$('#projectId').append('<h5> Project Name: ' + collectionObj['Name'] + '</h5>');

$('#btn-back-dc').click(function () {
    window.location.href = serverURL + "/data-collection/html/dc-list.html";
});
$('#btn-back-mn').click(function () {
    window.location.href = serverURL + "/main";
});

function convertObjectsToCSV(data) {
    //console.log("inside convert array", data)
    var result, headerStr = '', valueStr = '', columnDelimiter, lineDelimiter, inputData;
    inputData = data || null;
    if (inputData == null || !Object.keys(inputData).length) {
        console.log("data null");
        return null;
    }
    columnDelimiter = data.columnDelimiter || ',';
    lineDelimiter = data.lineDelimiter || '\n';
    let totalEntities = Object.keys(inputData);
    if (totalEntities.length > 0) {
        headerStr = '';
        for (let i = 0; i < totalEntities.length; i++) {
            let fieldsAndSubject = inputData[totalEntities[i]];
            for (let j = 0; j < fieldsAndSubject.length; j++) {
                let fieldObj = fieldsAndSubject[j];
                let fieldValue = Object.values(fieldObj)[0];
                let fieldKey = Object.keys(fieldObj)[0];
                if (i == 0) {//Do only for the first subject since header is same for all subjects
                    headerStr += fieldKey + columnDelimiter;
                }
                valueStr += fieldValue + columnDelimiter;
            }
            valueStr += lineDelimiter;
        } //end for
    } //end if
    result = headerStr + lineDelimiter + valueStr;
    return result;
}

function downloadCSV(args) {
    //console.log("inside download csv method", args.data)
    var result, filename, link;
    var csv = convertObjectsToCSV(args.data);
    if (csv == null) return;
    filename = args.filename || 'export.csv';
    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    result = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', result);
    link.setAttribute('download', filename);
    link.click();
}
