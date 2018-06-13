let collectionObj = JSON.parse(localStorage.getItem("collectionObj"))


//let cObj = JSON.parse(localStorage.getItem('saveObj'))
//console.log("cObj::saveObj ", cObj)

function getInstruments(dc){
    return new Promise(function(resolve){
        $.ajax({
            type: "GET",
            url: serverURL + "/query/graphs/projects/"+ dc +"/instruments",
            accept: "application/json",
            success: function(data){
                console.log('instrument list received :success', data)
                resolve(data)
            }//data
        })
    })
}

getInstruments(collectionObj['ID']).then(function(values){
    console.log("[dc-export.js: getInstruments] values: ", values)
    //var $instruments = $('#instruments');
    $("#dc-export").empty()
    $.each(values.instruments, function(i, instrument) {
        let splittedValues = instrument.split("#")
        //console.log(splittedValues[1])
        //$instruments.append(splittedValues[1])
        $("#dc-export").append('<option value="splittedValues[1]">'+ splittedValues[1] +'</option>')
    });

})

let sourceUrl = ''
$("#dc-export").change(function(){
    sourceUrl = serverURL + '/query/graphs/instrument/' + collectionObj['ID'] + '/' + $('#dc-export :selected').text()
    console.log("sourceurl", sourceUrl)
    getInstrumentFields(sourceUrl)
})

function getInstrumentFields(sourceUrl) {
    //var fields = $('#instruments');
    $.ajax({
        type: "GET",
        url: sourceUrl,
        accept: "application/json",
        success: function (data) {
            console.log('getInstrumentFields: success', data)
            if (data) {
                $("#div-fieldsTable").empty()
                $("#div-fieldsTable").append('<div><table class="table  table-striped"">\
                <thead><tr><th class="th-head-1">Select</th><th class="th-head-2">Instrument Fields</th></tr></thead>')
                $.each(data["instrument fields"], function(i, field) {
                    let fieldValues = field.split("#")
                    //fields.append(fieldValues[1] + '\n')
                    $("#div-fieldsTable").append('<tr>\
                  <td class="td-chk">\
                    <input class="form-check-input"  type="checkbox" name="insfield-checkbox" id="insfield"\
                    ></td>\
                  <td class="td-term"> '+ fieldValues[1]+'</td>\
                  </tr>')
                }); // end for each
            } // end if

        } // end of success
    }) // ajax call
}


$('#projectId').append('<h5> Project Name: '+ collectionObj['Name'] +'</h5>')
//$('#planId').append('<h5> Plan: '+ cObj['Project Name'] +'</h5>')


$('#btn-back-dc').click(function(){
    window.location.href = serverURL+"/data-collection/html/dc-list.html"
})
$('#btn-back-mn').click(function(){
    window.location.href = serverURL+"/main"
})