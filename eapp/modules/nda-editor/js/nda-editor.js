let count = 1
let idnum = 0
let chkboxSelectedArray = []
let saveObj2 = {}
let termsKey = []
let categories = []
let ntypes = []
let nsources = []
let nparamObj = {}
let shortName = ''
let termsIndex = {}
let orgTermForm = {}

$('[data-toggle="tooltip"]').tooltip()
$.fn.select2.defaults.set("theme", "bootstrap");
var form = new AlpacaForm('#form1')
var serverUrl = "http://127.0.0.1:3000"

$("#nda-src").select2()
$("#nda-src").append('<option value="NDA">NDA</option>')
$("#nda-src").append('<option value="Repronim"> Repronim-Curated-NDA </option>')
$("#nda-src").append('<option value="fork"> User-Github-Fork </option>')
$("#nda-src").append('<option value="Local">Local</option>')
$("#ndar-dd").select2()
/*
* Data Dictionaries
*/
let sourceUrl = ''
$("#nda-src").change(function () {
    if ($("#nda-src").val() === "NDA") {
        sourceUrl = serverUrl + "/ndar-terms/forms"
        getDataDictionaryList(sourceUrl)
    } else if ($("#nda-src").val() === "Local") {
        sourceUrl = serverUrl + "/nda/dictionaries/local"
        getDataDictionaryList(sourceUrl)
    } else if ($("#nda-src").val() === "Repronim") {
        sourceUrl = serverUrl + "/nda/dictionaries/github_repronim"
        getDataDictionaryList(sourceUrl)
    } else {
        sourceUrl = serverUrl + "/nda/dictionaries/github"
        getDataDictionaryList(sourceUrl)
    }
})

function getDataDictionaryList(sourceUrl) {
    $.ajax({
        type: "GET",
        url: sourceUrl,
        accept: "application/json",
        success: function (data) {
            console.log('get data dictionary list :success')
            console.log("data:  ", data)
            let dE = data.list
            $("#ndar-dd").empty()
            for (let i = 0; i < dE.length; i++) {
                if ($("#nda-src").val() === "NDA") {
                    $("#ndar-dd").append('<option value="' + dE[i].shortName + '">' + dE[i].title + '</option>')
                } else {
                    $("#ndar-dd").append('<option value="' + dE[i].shortName + '">' + dE[i].author + ':' + dE[i].title + '</option>')
                }
            }
        }
    })
}

function getDataDictionary(e3) {
    e3.preventDefault()
    $("#div- ").empty()
    $("#termsInfoSaveMsg").empty()
    $("#termsInfoSaveMsg").append('<br>')
    $("#terms-list").empty()
    if (document.getElementById('preview') != null) {
        $('#preview').remove()
        $('#import').removeClass("col-xs-7").addClass("col-xs-12")
        form.alpacaDestroy()
    }
    //count = 1
    //$("#ndar-dd-2").append('<p><h5> Select fields for your form </h4></p>')
    console.log(encodeURI($('#ndar-dd').val()))
    shortName = encodeURI($('#ndar-dd').val())

    let nUrl = ""
    if ($("#nda-src").val() === "NDA") {
        nUrl = serverUrl + "/ndar-terms/" + shortName
        ajaxCallSrc(nUrl)
    } else if ($("#nda-src").val() === "Local") {
        console.log("local chosen")
        nUrl = serverUrl + "/nda/dictionaries/local/" + shortName
        ajaxCallSrc(nUrl)
    } else if ($("#nda-src").val() === "Repronim") {
        nUrl = serverUrl + "/nda/dictionaries/github_repronim/" + shortName
        ajaxCallSrc(nUrl)
    } else {
        if ($("#nda-src").val() === "fork") {
            nUrl = serverUrl + "/nda/dictionaries/github/" + shortName
            ajaxCallSrc(nUrl)
        } else {
            if ($("#dd-url").val() !== "") {
                nUrl = serverUrl + "/nda/dictionaries/github/url"
                ajaxCallPost(nUrl, $("#dd-url").val())
            }
        }
    }
}

function ajaxCallPost(nUrl, urlVal) {
    $.ajax({
        type: "POST",
        url: nUrl,
        contentType: "application/json",
        data: JSON.stringify({"durl": urlVal}),
        success: function (data) {
            console.log('getDataDictionary from URL: success')
            getDDcallbk(data)
        }
    })
}

function ajaxCallSrc(nUrl) {
    $.ajax({
        type: "GET",
        url: nUrl,
        accept: "application/json",
        success: function (data) {
            console.log('getDataDictionary: success')
            getDDcallbk(data)
        } // end of success
    }) // ajax call
}

/*
* getDataDictionary AJAX call success callback
*/
function getDDcallbk(data) {
    count = 1
    let dE = {}
    //if($("#nda-src").val() !== "Local"){
    console.log("typeof-->", typeof (data))
    console.log("data in call bk:", data)
    if (typeof (data) == 'string') {
        dE = JSON.parse(data)
    } else {
        dE = data
    }

    console.log("DE:--->", dE)
    orgTermForm = dE
    if (dE.hasOwnProperty('dataElements')) {
        termsKey = dE.dataElements
    } else {
        termsKey = dE.fields
    }
    console.log("testing termsKey[0]: ", termsKey[0])
    $("#div-projectFields").html("")
    $("#div-projectFields").append('<div><table class="table  table-striped"">\
  <thead><tr><th class="th-head-1">Select</th><th class="th-head-2">Term</th><th>Description</th></tr></thead>\
  <tbody>')
    for (let i = 0; i < termsKey.length; i++) {
        if (termsKey[i].hasOwnProperty('id')) {
            termsIndex[termsKey[i].id] = termsKey[i]
            console.log("CASE 1: termsKey[i]: ", termsKey[i])
        } else {
            termsKey[i]['id'] = getRandomIntInclusive(1000, 10000)
            termsIndex[termsKey[i].id] = termsKey[i]
            console.log("CASE2: termskey[i]: ", termsKey[i])
        }
        /*$("#div-projectFields").append('<div class="form-check"><label class="form-check-label" data-toggle="tooltip" title="'+termsKey[i].description+'">\
        <input class="form-check-input"  type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ termsKey[i].id +'"\
        >' +termsKey[i].name +'</label></div>')
        */
        $("#div-projectFields").append('<tr>\
      <td class="td-chk">\
        <input class="form-check-input"  type="checkbox" name="projfield-checkbox" id="projfield-' + count + '" value="' + termsKey[i].id + '"\
        ><td>\
      <td class="td-term"> ' + termsKey[i].name + '</td>\
      <td> ' + termsKey[i].description + '</td>\
      </tr>')
        count++
    }
    //SELECT ALL
    $('#div-projectFields').append('<br><button id="btn-toggleAll" type="button" class="btn btn-primary">Select All</button>')
    $('#btn-toggleAll').click(function () {
        $('#div-projectFields input[type="checkbox"]').prop('checked', true);
    });

    //DESELECT ALL
    $('#div-projectFields').append('<button id="btn-toggleNone" type="button" class="btn btn-primary" style="margin-left:10px">Clear</button>')
    $('#btn-toggleNone').click(function () {
        $('#div-projectFields input[type="checkbox"]').prop('checked', false);
        if (document.getElementById('preview') != null) {
            $('#preview').remove()
            $('#import').removeClass("col-xs-7").addClass("col-xs-12")
            form.alpacaDestroy()
        }

        if (document.getElementById('viewDiv') != null) {
            console.log("view empty---")
            var exists = $('#viewDiv').alpaca("exist")
            if (exists) {
                console.log("viewDiv exists: ", exists)
                console.log("trying to destroy the alpaca form in view Div --")
                $('#viewDiv').alpaca("destroy")
                let e = $('#viewDiv').alpaca("exist")
                console.log("After viewDiv form destory: ", e)
                //$("#viewDiv").empty()
                $('#view').empty()
            }

            $('#view').append('<div class="row">\
        <div class="col-md-12">\
          <div id="viewDiv"></div>\
        </div>\
      </div>')
        }
        if (document.getElementById('designerDiv') != null) {
            console.log("designerdiv empty----")
            var exists1 = $('#designerDiv').alpaca("exist")
            if (exists1) {
                $('#designerDiv').alpaca("destroy")
                console.log("After designerDiv form destory: ", $('#designerDiv').alpaca("exist"))
            }
            $('#designer').empty()
            $('#designer').append('<div class="row">\
        <div class="col-md-7">\
          <div class="row">\
            <div class="col-md-12">\
              <div id="designerDiv"></div>\
            </div>\
          </div>\
        </div>\
        <div class="col-md-5">\
          <div class="row">\
            <div class="col-md-12">\
              <div>\
                <ul class="nav nav-tabs">\
                  <li class="active"><a href="#types" data-toggle="tab">Types</a></li>\
                  <li><a href="#basic" data-toggle="tab">Basic</a></li>\
                  <li><a href="#advanced" data-toggle="tab">Advanced</a></li>\
                </ul>\
              </div>\
              <div class="tab-content">\
                <div class="tab-pane active" id="types"></div>\
                <div class="tab-pane" id="basic"></div>\
                <div class="tab-pane" id="advanced"></div>\
              </div>\
            </div>\
          </div>\
        </div>\
      </div>')
        }
        var schema = {
            "type": "object",
            "properties": {}
        }
        var options = {
            "fields": {}
        }
        localStorage.setItem("alpacaDesignerSchema", JSON.stringify(schema))
        localStorage.setItem("alpacaDesignerOptions", JSON.stringify(options))
    }) //btn-toggleNone ends here
    $('#div-projectFields').append('<button id="btn-preview" type="button" class="btn btn-primary" style="margin-left:10px">Preview Form</button>')
    $("#div-projectFields").append('</tbody></table></div>')
}

//Preview function
function previewForm() {
    var fproperties = {}
    var ffields = {}
    form.alpacaDestroy()
    form = new AlpacaForm('#form1');
    for (let i = 1; i < count; i++) {
        if ($('#projfield-' + i + '').prop('checked')) {
            add_term_to_form(termsKey[i - 1])
        }
    }
    fproperties = form.properties
    ffields = form.fields
    var schema = {
        "type": "object",
        "properties": fproperties
    }
    var options = {
        "fields": ffields
    }
    localStorage.setItem("alpacaDesignerSchema", JSON.stringify(schema))
    localStorage.setItem("alpacaDesignerOptions", JSON.stringify(options))
    //form.alpacaGen();
    $(".tab-item-view").click()
}

//calling the form-editor setup function
setup()

function add_term_to_form(selectedField) {
    //Create ungenerated JSON form
    let options = []
    let sub_options1 = []
    let nvalues = []
    let fieldName = selectedField.name
    let fieldDescription = selectedField.description
    let fieldValueRange = selectedField.valueRange
    let fieldRequired = false
    if (selectedField.required == "Required") {
        fieldRequired = true
    }
    let idnum = selectedField.id
    // check the 'notes' field for any value specified
    let notes = checkNotes(selectedField.name, selectedField.notes)
    console.log(notes)
    if (notes != null) {
        nvalues = Object.keys(notes).map(function (key) {
            return notes[key]
        })
    }
    console.log("selectField valueRange:", selectedField.valueRange)

    if (selectedField.valueRange == null) {
        /* Case1: No Value Range */
        console.log("Case 1: valueRange == null ")
        if (selectedField.type == "Integer") {
            form.inputForm(fieldName, fieldDescription, 'preview-' + idnum, "number", undefined, fieldValueRange, fieldRequired, false)
        } else if (selectedField.type == "Date") {
            form.inputForm(fieldName, fieldDescription, 'preview-' + idnum, "string", true, fieldValueRange, fieldRequired, true)
        } else {
            form.inputForm(fieldName, fieldDescription, 'preview-' + idnum, "string", undefined, fieldValueRange, fieldRequired, false)
        }
    } else if (selectedField.valueRange.indexOf(';') > -1 || $.isArray(selectedField.valueRange)) {
        /*  Case 2:
        if valueRange specified with ';' separator
        check notes if values with its meaning specified in the notes
        if notes is empty then parse valueRange field
        otherwise parse notes field and obtain values representation, e.g (1 = "xyz"; 2 = "utty")
        */
        console.log("~~Case 2: valueRange specified by ;~~~ ")
        let sub_options2 = []
        let optionList = []
        if (!$.isArray(selectedField.valueRange)) {
            options = selectedField.valueRange.split(';')
        } else {
            options = selectedField.valueRange
        }
        console.log("c2::options::", options)
        console.log("c2::options.length::", options.length)

        var doubleoption = options.length == 2 && selectedField.valueRange.indexOf("::") == -1

        for (let j = 0; j < options.length; j++) {
            console.log("Adding:", options[j])
            if (options[j].indexOf("::") > -1) {
                let sub_options = options[j].split("::")
                for (let k = sub_options[0]; k <= sub_options[1]; k++) {
                    //$("#"+sid).append('<option value="'+ k+'">'+ k +'</option>')
                    sub_options2.push(k)
                }
            } else {
                sub_options2.push(options[j])
                //$("#"+sid).append('<option value="'+ options[j]+'">'+ options[j] +'</option>')
            }
        }
        if ((notes != null) && (nvalues.length == sub_options2.length)) {
            //options = Object.values(notes)
            options = nvalues
            if (doubleoption) {
                form.radioForm(fieldName, fieldDescription, 'preview-' + idnum, options, fieldRequired, false)
                console.log("Adding radio for: ", fieldName)
            } else {
                for (let m = 0; m < options.length; m++) {
                    optionList.push(options[m])
                }
                //form.selectForm(fieldName, fieldDescription, optionList, 'preview'+idnum, false)
                form.radioForm(fieldName, fieldDescription, 'preview-' + idnum, optionList, fieldRequired, true)
                console.log("Adding radio for: ", fieldName)
            }
        } else {
            if (doubleoption) {
                form.radioForm(fieldName, fieldDescription, 'preview-' + idnum, sub_options2, true)
                console.log("Adding radio for: ", fieldName)
            } else {
                for (let m = 0; m < sub_options2.length; m++) {
                    optionList.push(sub_options2[m])
                }
                //form.selectForm(fieldName, fieldDescription, optionList, 'preview'+idnum, false)
                console.log("Adding radio for: ", fieldName)
                form.radioForm(fieldName, fieldDescription, 'preview-' + idnum, optionList, fieldRequired, true)
            }
        }
    } else if (selectedField.valueRange.indexOf("::") > -1) {
        /*
        * Case3: valueRange of the form - 0::3
        * check notes - parse notes
        */
        console.log("Case 3: valueRange specified by :: ")
        flag = false
        if (notes === null) {
            sub_options1 = selectedField.valueRange.trim().split("::")
        } else {
            //sub_options1 = Object.values(notes)
            sub_options1 = nvalues
            console.log("c3::sub_options1:: ", sub_options1)
            console.log("c3::sub_options1.length:: ", sub_options1.length)
            //console.log("notes: ", notes)
            if (sub_options1.length == 1) {
                sub_options1 = selectedField.valueRange.trim().split("::")
            }
            //console.log(":: ",sub_options1)
        }

        console.log("c3-1::sub-options1:: ", sub_options1)
        console.log("c3-1::sub_options1.length:: ", sub_options1.length)

        if (sub_options1[1].trim() > 20) {
            if (selectedField.type == "Integer") {
                form.inputForm(fieldName, fieldDescription, 'preview-' + idnum, "number", undefined, fieldValueRange, fieldRequired, true)
            } else if (selectedField.type == "Date") {
                form.inputForm(fieldName, fieldDescription, 'preview-' + idnum, "string", true, fieldValueRange, fieldRequired, true)
            } else {
                form.inputForm(fieldName, fieldDescription, 'preview-' + idnum, "string", undefined, fieldValueRange, fieldRequired, true)
            }
        } else {
            let optionList = []

            if (notes == null || notes.hasOwnProperty(selectedField.name)) {
                for (let m = sub_options1[0].trim(); m < sub_options1[1].trim(); m++) {
                    optionList.push(m)
                }
            } else {
                for (let m = 0; m < sub_options1.length; m++) {
                    optionList.push(sub_options1[m])
                }
            }
            //form.selectForm(fieldName, fieldDescription, optionList, 'preview'+idnum, false)
            console.log("Adding radio for: ", fieldName)
            form.radioForm(fieldName, fieldDescription, 'preview-' + idnum, optionList, fieldRequired, false)
        }
    } else {
        console.log("Case 4: other options ")
        if (selectedField.type == "Integer") {
            form.inputForm(fieldName, fieldDescription, 'preview-' + idnum, "number", undefined, fieldValueRange, fieldRequired, true)
        } else if (selectedField.type == "Date") {
            form.inputForm(fieldName, fieldDescription, 'preview-' + idnum, "string", true, fieldValueRange, fieldRequired, true)
        } else {
            form.inputForm(fieldName, fieldDescription, 'preview-' + idnum, "string", undefined, fieldValueRange, fieldRequired, true)
        }
    }

    //idnum++

}//end of addTerms function

//Check notes
function checkNotes(key, notes) {
    let values = {}
    if (notes != null) {
        console.log('yes notes')
        let options = notes.split(';')
        for (let i = 0; i < options.length; i++) {
            let value = options[i].split('=')
            if (value.length < 2) {
                //values[value[0]] = key
                values[key] = value[0]
            } else {
                //values[value[1]] = value[0]
                values[value[0]] = value[1]
            }
        }
        return values
    } else {
        console.log('no notes')
        return null
    }
}

function projectListPage() {
    window.location.href = serverUrl + "/nda/html/acquistionForm.html"
}

$(document).keypress(function (e) {
    if (e.which == 13) {
        console.log('Enter key pressed')
        getDataDictionary(e)
    }
})

$("#btn-dd-selected").click(getDataDictionary)

$(document).on('click', '#btn-preview', function () {
    //$('#import').removeClass("col-xs-12").addClass("col-xs-7")
    if (document.getElementById('preview') != null) {
        $('#preview').remove()
    }
    $('#import').append('<div class="col-xs-12" id="preview">\
      <p><h3>Preview/Editor</h3></p>\
      <div id="form1" style="overflow:scroll;overflow:auto"></div>\
    </div>');
    previewForm()

})

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function setCommonFields() {
    let version = ''
    console.log("version number : ", version)
    saveObj2['DictionaryID'] = ''

    //TODO: Need to have scheme to uniquely name the file
    if (shortName.indexOf('-m') == -1) {
        version = shortName.substring((shortName.length - 2), (shortName.length))
        //saveObj2['shortName'] = shortName + "-m" + (parseInt(version)+1)
        saveObj2['shortName'] = shortName + "-m" + getRandomIntInclusive(10, 99)
    } else {
        version = shortName.substring((shortName.length - 1), (shortName.length))
        //saveObj2['shortName'] = shortName.substring(0,shortName.length-2) + "m" + (parseInt(version)+1)
        saveObj2['shortName'] = shortName.substring(0, shortName.length - 2) + getRandomIntInclusive(10, 99)
    }
    saveObj2["Name"] = document.getElementById("nda-form-name").value
    saveObj2["Description"] = document.getElementById("nda-form-desc").value
    saveObj2["title"] = orgTermForm["title"]
    saveObj2["DerivedFrom"] = orgTermForm["shortName"]
    saveObj2["author"] = ''
}

//TODO: Need to check the fields whose values do not change and whose changes
// for example, if valueRange value changed then we need to assign the new value schema.properties[key].enum
// rather than termsIndex[ndaId].valueRange
function setNDATerm(schema, key, field, position) {
    let ndaTerm = {}
    if (field.hasOwnProperty('id')) {
        /** fields already in the form**/
        let ndaId = field.id.split('-')[1]
        console.log("ndaId: ", ndaId)
        ndaTerm['id'] = parseInt(ndaId)
        if (schema.properties[key].required) {
            ndaTerm['required'] = "Required"
        } else {
            ndaTerm['required'] = "Recommended"
        }
        ndaTerm['condition'] = termsIndex[ndaId].condition
        ndaTerm['aliases'] = termsIndex[ndaId].aliases
        ndaTerm['filterElement'] = termsIndex[ndaId].filterElement
        ndaTerm['position'] = termsIndex[ndaId].position
        ndaTerm['dataElementId'] = termsIndex[ndaId].dataElementId
        ndaTerm['name'] = key
        ndaTerm['type'] = termsIndex[ndaId].type
        ndaTerm['size'] = termsIndex[ndaId].size
        ndaTerm['description'] = field.label
        if (schema.properties[key].enum === undefined) {
            ndaTerm['valueRange'] = null
        } else {
            //ndaTerm['valueRange'] = schema.properties[key].enum
            ndaTerm['valueRange'] = termsIndex[ndaId].valueRange
        }
        //ndaTerm['valueRange'] = schema.properties[key].enum.join(';')
        ndaTerm['notes'] = termsIndex[ndaId].notes
        ndaTerm['translation'] = termsIndex[ndaId].translations
    } else {
        /** adding new field **/
        let ndaId = key
        console.log("ndaId: ", ndaId)
        ndaTerm['id'] = ndaId
        if (schema.properties[key].required) {
            ndaTerm['required'] = "Required"
        } else {
            ndaTerm['required'] = "Recommended"
        }
        ndaTerm['condition'] = null
        ndaTerm['aliases'] = null
        ndaTerm['filterElement'] = null
        ndaTerm['name'] = field.name
        ndaTerm['description'] = field.label
        if (schema.properties[key].enum === undefined) {
            ndaTerm['valueRange'] = null
        } else {
            ndaTerm['valueRange'] = schema.properties[key].enum
        }

        //ndaTerm['valueRange'] = schema.properties[key].enum.join(';')
        ndaTerm['type'] = schema.properties[key].type
        ndaTerm['size'] = null
        ndaTerm['position'] = position
        ndaTerm['dataElementId'] = position
        ndaTerm['notes'] = null
        ndaTerm['translation'] = []
    }
    return ndaTerm
    console.log("ndaTerm:", ndaTerm)
}

function saveCuratedForm(schema, options, storageType) {
    let ndaTerms = []
    let ndaTerm = {}

    setCommonFields()

    console.log("SCHEMA value saving: --", schema)

    if ($.isEmptyObject(schema)) { //check to see if schema is empty as no preview is selected
        //check if any field is checked
        console.log("[if] Only selected box convert count= ", count)
        for (let i = 1; i < count; i++) {
            if (document.getElementById("projfield-" + i).checked) {
                console.log(document.getElementById("projfield-" + i).checked)
                //chkboxSelectedArray.push(document.getElementById("projfield-"+ i).value)
                chkboxSelectedArray.push(termsIndex[document.getElementById("projfield-" + i).value])
            } else {
                console.log("checkbox is not selected")
            }
        }
        saveObj2['fields'] = chkboxSelectedArray

    } else {
        console.log("else: Convert Alpaca schema, options to NDA")
        //Start converting from the schema and options
        console.log("OPTIONS value saving: --", options.fields)
        let ndafields = options.fields
        let position = 0
        $.each(ndafields, function (key, field) {
            console.log(key, field)
            ndaTerm = {}
            position++
            ndaTerm = setNDATerm(schema, key, field, position)
            ndaTerms.push(ndaTerm)
            console.log("ndaTerm: ", ndaTerm)
        })
        saveObj2['fields'] = ndaTerms
    }
    console.log("SAVING ----", saveObj2)
    let saveUrl = ''
    if (storageType === 'github') {
        saveUrl = serverUrl + "/nda/dictionaries/github"
        console.log("Saving to Local and GitHub---")
    } else {
        saveUrl = serverUrl + "/nda/dictionaries/local"
        console.log("Saving To Local---")
    }
    $.ajax({
        type: "POST",
        url: saveUrl,
        contentType: "application/json",
        data: JSON.stringify(saveObj2),
        success: function (data) {
            console.log('success')
            console.log("data received", data)
            $("#div-projectFields").empty()
            $("#termsInfoSaveMsg").empty()
            $("#termsInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
        <a href="#" class="close" data-dismiss="alert">&times;</a>\
        <strong>Terms Information Saved in uploads/termforms/' + data['fid'] + '!</strong>\
        </div>')
            $("#termsInfoSaveMsg").append('<br>')
        }
    })
}
