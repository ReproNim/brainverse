let collectionObj = JSON.parse(localStorage.getItem("collectionObj"));

function getInstruments(dc){
    return new Promise(function(resolve){
        $.ajax({
            type: "GET",
            url: serverURL + "/query/graphs/projects/"+ dc +"/instruments",
            accept: "application/json",
            success: function(data){
                console.log('instrument list received :success', data);
                resolve(data)
            }//data
        })
    })
}

getInstruments(collectionObj['ID']).then(function(values){
    console.log("[dc-export.js: getInstruments] values: ", values);
    $("#dc-export").empty();
    $.each(values.instruments, function(i, instrument) {
        let splittedValues = instrument.split("#");
        $("#dc-export").append('<option value="splittedValues[1]">'+ splittedValues[1] +'</option>')
    })

});

$("#dc-export").change(function(){
    let sourceUrl = serverURL + '/query/graphs/instrument/' + collectionObj['ID'] + '/' + $('#dc-export :selected').text();
    console.log("sourceurl", sourceUrl);
    getInstrumentFields(sourceUrl)
});

function getInstrumentFields(sourceUrl) {
    $.ajax({
        type: "GET",
        url: sourceUrl,
        accept: "application/json",
        success: function (data) {
            console.log('getInstrumentFields: success', data);
            if (data) {
                $("#div-fieldsTable").empty();
                $("#div-fieldsTable").append('<div><table class="table  table-striped"">\
                <thead><tr><th class="th-head-1">Select</th><th class="th-head-2">Instrument Fields</th></tr></thead>');
                $.each(data["instrument fields"], function(i, field) {
                    let fieldValues = field.split("#");
                    $("#div-fieldsTable").append('<tr>\
                  <td class="td-chk">\
                    <input class="form-check-input"  value=\"'+ fieldValues[1] + '\" type="checkbox" name="insfield-checkbox" id="insfield"\
                    ></td>\
                  <td class="td-term"> '+ fieldValues[1] +'</td>\
                  </tr>')
                }); // end for each
            } // end if

        } // end of success
    }) // ajax call
}

$('#btn-export-csv').click(function() {

    var selectedValues =  $('input[id="insfield"]:checked').map(function(){
        return this.value;
    }).toArray().join("|");

    let sourceUrl = serverURL + '/query/graphs/instrument/' + collectionObj['ID'] + '/' + $('#dc-export :selected').text();
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({"selectedFields": selectedValues}),
        url: sourceUrl,
        success: function (data) {
            if (data) {
                console.log('Going to Export to CSV ', data);
                downloadCSV({ filename: "data-acquisition.csv", data: data });

            } // end if

        } // end of success
    }) // ajax call
});

$('#projectId').append('<h5> Project Name: '+ collectionObj['Name'] +'</h5>');
//$('#planId').append('<h5> Plan: '+ cObj['Project Name'] +'</h5>')


$('#btn-back-dc').click(function(){
    window.location.href = serverURL+"/data-collection/html/dc-list.html"
});
$('#btn-back-mn').click(function(){
    window.location.href = serverURL+"/main"
});

function convertObjectsToCSV(data) {
    console.log("inside convert array", data)
    var result, headerStr='', valueStr='', columnDelimiter, lineDelimiter, inputData;
    inputData = data.field_subjects || null;
    if (inputData == null || !Object.keys(inputData).length) {
        console.log("data null")
        return null;
    }
    columnDelimiter = data.columnDelimiter || ',';
    lineDelimiter = data.lineDelimiter || '\n';
    let totalSubjects  = Object.keys(inputData)
    if(totalSubjects.length > 0) {
        headerStr = 'Subject'
        for (let i = 0; i < totalSubjects.length; i++) {
            valueStr += totalSubjects[i]
            let fieldsForSubject = inputData[totalSubjects[i]]
            for (let j = 0; j < fieldsForSubject.length; j++) {
                let fieldKey = (Object.keys(fieldsForSubject[j]))[0]
                if(i==0) {//Do only for the first subject since header is same for all subjects
                    headerStr += columnDelimiter + fieldKey
                }
                let fieldValue = fieldsForSubject[j][fieldKey]
                valueStr += columnDelimiter + fieldValue
            }
            valueStr +=lineDelimiter
        }
    }
    result = headerStr + lineDelimiter + valueStr
    return result;
}

function downloadCSV(args) {
    console.log("inside download csv method", args.data)
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