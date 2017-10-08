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

$('[data-toggle="tooltip"]').tooltip()
$.fn.select2.defaults.set( "theme", "bootstrap" );
var form = new AlpacaForm('#form1')
var serverUrl = "http://127.0.0.1:3000"
/*
* Data Dictionaries
*/

$.ajax({
  type: "GET",
  url: serverUrl + "/ndar-terms/forms",
  accept: "application/json",
  success: function(data){
    console.log('get forms:success')
    let dE = JSON.parse(data)
    console.log(dE)
    $("#ndar-dd").select2()
    for (let i=0;i<dE.length;i++){
      $("#ndar-dd").append('<option value="'+ dE[i].shortName+'">'+ dE[i].title +'</option>')
    }
    getDataDictionaryListGitHub()
  }
})

function getDataDictionaryListGitHub(){
  $.ajax({
    type: "GET",
    url: serverUrl + "/nda/dictionaries/github",
    accept: "application/json",
    success: function(data){
      console.log('get forms: github:success')
      console.log("data:  ",data)
      let dE = data.list
      //$("#ndar-dd").select2()
      for (let i=0;i<dE.length;i++){
        $("#ndar-dd").append('<option value="'+ dE[i].shortName+'">'+ dE[i].title +'</option>')
      }
    }
  })

}

function getDataDictionary(e3){
  e3.preventDefault()
  $("#div-projectFields").empty()
  $("#termsInfoSaveMsg").empty()
  $("#termsInfoSaveMsg").append('<br>')
  $("#terms-list").empty()
  if(document.getElementById('preview') != null) {
    $('#preview').remove()
    $('#import').removeClass("col-xs-7").addClass("col-xs-12")
    form.alpacaDestroy()
  }

  count = 1
  //chkboxSelectedArray = []
  $("#ndar-dd-2").append('<p><h5> Select fields for your form </h4></p>')

  console.log(encodeURI($('#ndar-dd').val()))
  shortName = encodeURI($('#ndar-dd').val())

  let nUrl = serverUrl + "/ndar-terms/"+ encodeURI($("#ndar-dd").val())
  console.log("nUrl",nUrl)
  $.ajax({
    type: "GET",
    url: nUrl ,
    accept: "application/json",
    success: function(data){
      console.log('success')
      let dE = JSON.parse(data)
      termsKey = dE.dataElements
      console.log(termsKey[0])
      $("#div-projectFields").append('<div><table class="table  table-striped"">\
      <thead><tr><th class="th-head-1">Select</th><th class="th-head-2">Term</th><th>Description</th></tr></thead>\
      <tbody>')
      for (let i=0;i<termsKey.length;i++){
        termsIndex[termsKey[i].id] = termsKey[i]

          /*$("#div-projectFields").append('<div class="form-check"><label class="form-check-label" data-toggle="tooltip" title="'+termsKey[i].description+'">\
            <input class="form-check-input"  type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ termsKey[i].id +'"\
            >' +termsKey[i].name +'</label></div>')
          */
          $("#div-projectFields").append('<tr>\
            <td class="td-chk">\
              <input class="form-check-input"  type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ termsKey[i].id +'"\
              ><td>\
            <td class="td-term"> '+ termsKey[i].name+'</td>\
            <td> '+ termsKey[i].description+ '</td>\
            </tr>')
          count++
      }
      //SELECT ALL
      $('#div-projectFields').append('<br><button id="btn-toggleAll" type="button" class="btn btn-primary">Select All</button>')
      $('#btn-toggleAll').click(function() {
        $('#div-projectFields input[type="checkbox"]').prop('checked', true);
      });

      //DESELECT ALL
      $('#div-projectFields').append('<button id="btn-toggleNone" type="button" class="btn btn-primary" style="margin-left:10px">Clear</button>')
      $('#btn-toggleNone').click(function() {
        $('#div-projectFields input[type="checkbox"]').prop('checked', false);
        if(document.getElementById('preview') != null) {
          $('#preview').remove()
          $('#import').removeClass("col-xs-7").addClass("col-xs-12")
          form.alpacaDestroy()
        }

        if(document.getElementById('viewDiv') != null) {
          console.log("view empty---")
          var exists = $('#viewDiv').alpaca("exist")
          if(exists){
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
        if(document.getElementById('designerDiv') != null) {
          console.log("designerdiv empty----")
          var exists1 = $('#designerDiv').alpaca("exist")
          if(exists1){
            $('#designerDiv').alpaca("destroy")
            console.log("After designerDiv form destory: ",$('#designerDiv').alpaca("exist"))
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
        //setup()
        //setup({},{})
      });
      $('#div-projectFields').append('<button id="btn-preview" type="button" class="btn btn-primary" style="margin-left:10px">Preview Form</button>')
      $("#div-projectFields").append('</tbody></table></div>')
    }
  })
}

//Preview function
function previewForm() {
  var fproperties = {}
  var ffields = {}
  form.alpacaDestroy()
  form = new AlpacaForm('#form1');
  for (let i=1; i<count; i++){
    if($('#projfield-'+ i +'').prop('checked')){
      add_term_to_form(termsKey[i-1])
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
//calling the setup function
setup()

function add_term_to_form(selectedField){
  //Create ungenerated JSON form
    let options = []
    let sub_options1 = []
    let nvalues = []
    let fieldName = selectedField.name
    let fieldDescription = selectedField.description
    let fieldValueRange = selectedField.valueRange
    let fieldRequired = false
    if(selectedField.required == "Required"){
      fieldRequired = true
    }
    let idnum = selectedField.id
    // check the 'notes' field for any value specified
    let notes = checkNotes(selectedField.name,selectedField.notes)
    console.log(notes)
    if(notes != null){
      nvalues = Object.keys(notes).map(function(key) {
          return notes[key]
          })
    }

    if(selectedField.valueRange == null){
      /* Case1: No Value Range */
      if (selectedField.type == "Integer") {
        //form.inputForm(fieldName, fieldDescription, 'preview'+idnum, "number", undefined, fieldValueRange, true)
        form.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "number", undefined, fieldValueRange, fieldRequired,false)
      }
      else if (selectedField.type == "Date") {
        form.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", true, fieldValueRange, fieldRequired,true)
      }
      else {
        //form.inputForm(fieldName, fieldDescription, 'preview'+idnum, "string", undefined, fieldValueRange, true)
        form.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", undefined, fieldValueRange, fieldRequired,false)
      }
    }
    else if (selectedField.valueRange.indexOf(';')> -1){
      /*  Case 2:
      if valueRange specified with ';' separator
      check notes if values with its meaning specified in the notes
      if notes is empty then parse valueRange field
      otherwise parse notes field and obtain values representation, e.g (1 = "xyz"; 2 = "utty")
      */
      let sub_options2 = []
      let optionList = []
      options = selectedField.valueRange.split(';')
      console.log("c2::options::", options)
      console.log("c2::options.length::", options.length)

      var doubleoption = options.length==2 && selectedField.valueRange.indexOf("::")== -1

      for (let j=0; j< options.length; j++){
        console.log("Adding:",options[j])
        if(options[j].indexOf("::")> -1){
          let sub_options = options[j].split("::")
          for(let k=sub_options[0];k<=sub_options[1];k++){
            //$("#"+sid).append('<option value="'+ k+'">'+ k +'</option>')
            sub_options2.push(k)
          }
        }else{
          sub_options2.push(options[j])
          //$("#"+sid).append('<option value="'+ options[j]+'">'+ options[j] +'</option>')
        }
      }
      if((notes != null) && (nvalues.length ==  sub_options2.length)){
        //options = Object.values(notes)
        options = nvalues
        if(doubleoption){
          form.radioForm(fieldName, fieldDescription, 'preview-'+idnum, options,fieldRequired,false)
          console.log("Adding radio for: ", fieldName)
        }
        else{
          for(let m=0;m<options.length;m++){
            optionList.push(options[m])
          }
          //form.selectForm(fieldName, fieldDescription, optionList, 'preview'+idnum, false)
          form.radioForm(fieldName, fieldDescription, 'preview-'+idnum, optionList, fieldRequired, true)
          console.log("Adding radio for: ", fieldName)
        }
      }
      else{
        if(doubleoption){
          form.radioForm(fieldName, fieldDescription, 'preview-'+idnum, sub_options2, true)
          console.log("Adding radio for: ", fieldName)
        }
        else{
          for(let m=0;m<sub_options2.length;m++){
            optionList.push(sub_options2[m])
          }
          //form.selectForm(fieldName, fieldDescription, optionList, 'preview'+idnum, false)
          console.log("Adding radio for: ", fieldName)
          form.radioForm(fieldName, fieldDescription, 'preview-'+idnum, optionList, fieldRequired,true)
        }
      }
    }
    else if (selectedField.valueRange.indexOf("::")> -1){
      /*
      * Case3: valueRange of the form - 0::3
      * check notes - parse notes
      */
      flag = false
      if(notes === null){
        sub_options1 = selectedField.valueRange.trim().split("::")
      }
      else{
        //sub_options1 = Object.values(notes)
        sub_options1 = nvalues
        console.log("c3::sub_options1:: ", sub_options1)
        console.log("c3::sub_options1.length:: ", sub_options1.length)
        //console.log("notes: ", notes)
        if(sub_options1.length == 1){
          sub_options1 = selectedField.valueRange.trim().split("::")
        }
        //console.log(":: ",sub_options1)
      }

      console.log("c3-1::sub-options1:: ",sub_options1)
      console.log("c3-1::sub_options1.length:: ", sub_options1.length)

      if(sub_options1[1].trim()>20){
        if (selectedField.type == "Integer") {
          form.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "number", undefined, fieldValueRange, fieldRequired,true)
        }
        else if (selectedField.type == "Date") {
          form.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", true, fieldValueRange, fieldRequired,true)
        }
        else {
          form.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", undefined, fieldValueRange, fieldRequired,true)
        }
      }

      else{
        let optionList = []

        if(notes == null || notes.hasOwnProperty(selectedField.name)){
          for(let m=sub_options1[0].trim();m<sub_options1[1].trim();m++){
            optionList.push(m)
          }
        }

        else{
          for(let m=0;m<sub_options1.length;m++){
            optionList.push(sub_options1[m])
          }
        }
        //form.selectForm(fieldName, fieldDescription, optionList, 'preview'+idnum, false)
        console.log("Adding radio for: ", fieldName)
        form.radioForm(fieldName, fieldDescription, 'preview-'+idnum, optionList, fieldRequired, false)
      }
    }
    else{
      if (selectedField.type == "Integer") {
        form.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "number", undefined, fieldValueRange, fieldRequired,true)
      }
      else if (selectedField.type == "Date") {
        form.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", true, fieldValueRange, fieldRequired,true)
      }
      else {
        form.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", undefined, fieldValueRange, fieldRequired, true)
      }
    }

    //idnum++

}//end of addTerms function

//Check notes
function checkNotes(key,notes){
  let values = {}
  if(notes != null){
    console.log('yes notes')
    let options = notes.split(';')
    for(let i = 0;i < options.length; i++){
      let value = options[i].split('=')
      if(value.length<2){
        //values[value[0]] = key
        values[key] = value[0]
      } else{
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


// Save the project information entered and the selected fields
// The information is saved in a local file named 'proj-info.json'
/*function saveProjInfo(e){
  e.preventDefault()

  for (let i=1; i<count; i++){
    if(document.getElementById("projfield-" + i).checked){
      console.log(document.getElementById("projfield-"+ i).checked)
      //chkboxSelectedArray.push(document.getElementById("projfield-"+ i).value)
      chkboxSelectedArray.push(termsIndex[document.getElementById("projfield-"+ i).value])
    } else{
      console.log("checkbox is not selected")
    }
  }

  console.log(chkboxSelectedArray)
  /*if (typeof(Storage) !== "undefined") {
    localStorage.setItem('termform', JSON.stringify(chkboxSelectedArray))
  } else {
    console.log('no storage support')
  }*/

  //Save the data entered
  /*saveObj2['DictionaryID'] = ''
  saveObj2['shortName'] = shortName
  saveObj2["Name"] = document.getElementById("proj-name").value
  saveObj2["Description"] = document.getElementById("proj-desc").value
  saveObj2['fields'] = chkboxSelectedArray

  if (typeof(Storage) !== "undefined") {
    //localStorage.setItem('termform', JSON.stringify(saveObj))
    let psname = saveObj2['shortName'].split(' ')
    let pname = saveObj2['Name'].split(' ')
    let fname = 'terms-'+ psname[0]+'-'+ pname[0] +'.json'
    localStorage.setItem(fname,JSON.stringify(saveObj2))
  } else {
    console.log('no storage support')
  }

  $.ajax({
    type: "POST",
    url: serverUrl + "/dictionaries/new",
    contentType: "application/json",
    data: JSON.stringify(saveObj2),
    success: function(data){
      console.log('success')
      console.log("data received",data)
      $("#div-projectFields").empty()
      $("#termsInfoSaveMsg").empty()
      $("#termsInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
      <a href="#" class="close" data-dismiss="alert">&times;</a>\
  <strong>Terms Information Saved in uploads/termforms/'+data['fid']+'!</strong>\
</div>')
      $("#termsInfoSaveMsg").append('<br>')
      $("#terms-list").append('<button id= "btn-pj-list" class="btn btn-primary">Fill up Form </button><br>')
      //$("#terms-back").append('<button id= "btn-back" class="btn btn-primary">Back To Main Page </button>')
    }
  })
  console.log('done')
  //Close Form Preview on save button
  $('#preview').remove()
  $('#import').removeClass("col-xs-7").addClass("col-xs-12")
}*/

function projectListPage(){
  window.location.href = serverUrl + "/nda/html/acquistionForm.html"
}

$("#btn-dd-selected").click(getDataDictionary)
//$('#btn-pjInfoSave').click(saveProjInfo)
//$('#terms-list').click(projectListPage)

$(document).on('click', '#btn-preview', function() {
    //$('#import').removeClass("col-xs-12").addClass("col-xs-7")
    if(document.getElementById('preview') != null) {
      $('#preview').remove()
    }
    /*$('#import').after('<div class="col-xs-5" id="preview">\
      <p><h3>Preview Form</h3></p>\
      <br>\
        <div id="form1" style="overflow:scroll;overflow:auto"></div>\
    </div>');*/
    $('#import').append('<div class="col-xs-12" id="preview">\
      <p><h3>Preview/Editor</h3></p>\
      <div id="form1" style="overflow:scroll;overflow:auto"></div>\
    </div>');
    previewForm()

  })

  function convertAlpacaToNDA(schema,options){
    //let ndaObj = {}
    let ndaTerms = []
    let ndaTerm = {}
    console.log("SCHEMA value saving: --", schema)
    saveObj2['DictionaryID'] = ''
    saveObj2['shortName'] = shortName
    saveObj2["Name"] = document.getElementById("nda-form-name").value
    saveObj2["Description"] = document.getElementById("nda-form-desc").value

    if($.isEmptyObject(schema)){
      //check if any field is checked
      console.log("[if]only selected box convert count= ", count)
      for (let i=1; i<count; i++){
        if(document.getElementById("projfield-" + i).checked){
          console.log(document.getElementById("projfield-"+ i).checked)
          //chkboxSelectedArray.push(document.getElementById("projfield-"+ i).value)
          chkboxSelectedArray.push(termsIndex[document.getElementById("projfield-"+ i).value])
        } else{
          console.log("checkbox is not selected")
        }
      }
      saveObj2['fields'] = chkboxSelectedArray

    }else{
      console.log("else: Convert Alpaca to NDA")
      //Start converting from the schema and options
      console.log("OPTIONS value saving: --", options.fields)
      let ndafields = options.fields
      //for(let i=0;i<ndafields.length;i++){
      $.each(ndafields, function(key, field) {
        console.log(key, field);
        ndaTerm = {}
        let ndaId = field.id.split('-')[1]
        console.log("ndaId: ", ndaId)
        ndaTerm['id'] = ndaId
        ndaTerm['required'] = schema.properties[key].required
        ndaTerm['condition'] = termsIndex[ndaId].condition
        ndaTerm['aliases'] = termsIndex[ndaId].aliases
        ndaTerm['filterElement'] = termsIndex[ndaId].filterElement
        ndaTerm['position'] = termsIndex[ndaId].position
        ndaTerm['dataElementId'] = termsIndex[ndaId].dataElement
        ndaTerm['name'] = key
        ndaTerm['type'] = termsIndex[ndaId].type
        ndaTerm['size'] = termsIndex[ndaId].size
        ndaTerm['description'] = field.label
        ndaTerm['valueRange'] = schema.properties[key].enum
        ndaTerm['notes'] = termsIndex[ndaId].notes
        ndaTerm['translation'] = termsIndex[ndaId].translations
        ndaTerms.push(ndaTerm)
        console.log("ndaTerm: ", ndaTerm)
      })
      saveObj2['fields'] = ndaTerms
    }
    console.log("SAVING ----",saveObj2)
    $.ajax({
      type: "POST",
      url: serverUrl + "/nda/dictionaries/local",
      contentType: "application/json",
      data: JSON.stringify(saveObj2),
      success: function(data){
        console.log('success')
        console.log("data received",data)
        $("#div-projectFields").empty()
        $("#termsInfoSaveMsg").empty()
        $("#termsInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
        <a href="#" class="close" data-dismiss="alert">&times;</a>\
        <strong>Terms Information Saved in uploads/termforms/'+data['fid']+'!</strong>\
        </div>')
        $("#termsInfoSaveMsg").append('<br>')
      }
    })
  }

  function pushToGitHub(schema,options){
    //let ndaObj = {}
    let ndaTerms = []
    let ndaTerm = {}
    console.log("SCHEMA value saving: --", schema)
    saveObj2['DictionaryID'] = ''
    saveObj2['shortName'] = shortName
    saveObj2["Name"] = document.getElementById("nda-form-name").value
    saveObj2["Description"] = document.getElementById("nda-form-desc").value

    if($.isEmptyObject(schema)){
      //check if any field is checked
      console.log("[if]only selected box convert count= ", count)
      for (let i=1; i<count; i++){
        if(document.getElementById("projfield-" + i).checked){
          console.log(document.getElementById("projfield-"+ i).checked)
          //chkboxSelectedArray.push(document.getElementById("projfield-"+ i).value)
          chkboxSelectedArray.push(termsIndex[document.getElementById("projfield-"+ i).value])
        } else{
          console.log("checkbox is not selected")
        }
      }
      saveObj2['fields'] = chkboxSelectedArray

    }else{
      console.log("else: Convert Alpaca to NDA")
      //Start converting from the schema and options
      console.log("OPTIONS value saving: --", options.fields)
      let ndafields = options.fields
      //for(let i=0;i<ndafields.length;i++){
      $.each(ndafields, function(key, field) {
        console.log(key, field);
        ndaTerm = {}
        let ndaId = field.id.split('-')[1]
        console.log("ndaId: ", ndaId)
        ndaTerm['id'] = ndaId
        ndaTerm['required'] = schema.properties[key].required
        ndaTerm['condition'] = termsIndex[ndaId].condition
        ndaTerm['aliases'] = termsIndex[ndaId].aliases
        ndaTerm['filterElement'] = termsIndex[ndaId].filterElement
        ndaTerm['position'] = termsIndex[ndaId].position
        ndaTerm['dataElementId'] = termsIndex[ndaId].dataElement
        ndaTerm['name'] = key
        ndaTerm['type'] = termsIndex[ndaId].type
        ndaTerm['size'] = termsIndex[ndaId].size
        ndaTerm['description'] = field.label
        ndaTerm['valueRange'] = schema.properties[key].enum
        ndaTerm['notes'] = termsIndex[ndaId].notes
        ndaTerm['translation'] = termsIndex[ndaId].translations
        ndaTerms.push(ndaTerm)
        console.log("ndaTerm: ", ndaTerm)
      })
      saveObj2['fields'] = ndaTerms
    }
    console.log("SAVING ----",saveObj2)
    $.ajax({
      type: "POST",
      url: serverUrl + "/nda/dictionaries/github",
      contentType: "application/json",
      data: JSON.stringify(saveObj2),
      success: function(data){
        console.log('success')
        console.log("data received",data)
        $("#div-projectFields").empty()
        $("#termsInfoSaveMsg").empty()
        $("#termsInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
        <a href="#" class="close" data-dismiss="alert">&times;</a>\
        <strong>Terms Information Saved in uploads/termforms/'+data['fid']+'!</strong>\
        </div>')
        $("#termsInfoSaveMsg").append('<br>')
      }
    })
  }
