let saveObj = {}
let selectedFields =[]
//var moment = require('moment')
moment().format()
$('[data-toggle="tooltip"]').tooltip()

let serverURL = "http://127.0.0.1:3000"
$.ajax({
  type: "GET",
  url: serverURL + "/acquisitions/forms",
  accept: "application/json",
  success: function(data){
    console.log('acquistions forms:success', data)
    //let dE = JSON.parse(data)
    let tforms = data.list
    if(tforms.length == 0){
      console.log("no forms")
      $("#term-form").empty()
    }else{
      for (let i=0;i<tforms.length;i++){
          console.log(tforms[i])
          if(tforms[i] != ".DS_Store"){
            $("#tforms").append('<option value="'+ tforms[i]+'">'+ tforms[i] +'</option>')
          }
      }
    }
  }
})

$("#tforms").change(function(){
  console.log($("#tforms").val())
  $("#ndar-fields").empty()
  addAqFields($("#tforms").val())
})

function addAqFields(formName){
  //check if form is in local storage
  let termform = JSON.parse(localStorage.getItem(formName))
  console.log("Form Selected:",termform)

  let url = serverURL +"/acquisitions/forms/" + formName

  // if the file is not in localstorage, read from the disk
  if(termform == null){

    $.ajax({
      type: "GET",
      url: url,
      accept: "application/json",
      success: function(data){
        console.log('acquistions term forms:success', data)
        termform = data
        add_term_to_form(termform)
      }//data
    })

  } else{
    add_term_to_form(termform)
  }

}//end of addAqFields function

var form = new AlpacaForm('#ndar-fields')
/**
Add fields to the acquistion form UI using a specified JSON file
*/
var fieldsCorrect = true
function add_term_to_form(termForm){
  selectedFields = termForm['fields']
  console.log("Number of Fields in the form: ",selectedFields.length)
  //console.log("x",x.length)

  //Create ungenerated JSON form

  for (let i=0; i<selectedFields.length; i++){
    let options = []
    let sub_options1 = []
    let nvalues = []
    let fieldName = selectedFields[i].name
    let fieldDescription = selectedFields[i].description
    let fieldValueRange = selectedFields[i].valueRange

    // check the 'notes' field for any value specified
    let notes = checkNotes(selectedFields[i].name,selectedFields[i].notes)
    if(notes != null){
      nvalues = Object.keys(notes).map(function(key) {
          return notes[key]
          })
    }

    if(selectedFields[i].valueRange == null){
      /* Case1: No Value Range */
      if (selectedFields[i].type == "Integer") {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "number", undefined, fieldValueRange)
      }
      else if (selectedFields[i].type == "Date") {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", true, fieldValueRange)
      }
      else {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", undefined, fieldValueRange)
      }
    }
    else if (selectedFields[i].valueRange.indexOf(';')> -1){
      /*  Case 2:
      if valueRange specified with ';' separator
      check notes if values with its meaning specified in the notes
      if notes is empty then parse valueRange field
      otherwise parse notes field and obtain values representation, e.g (1 = "xyz"; 2 = "utty")
      */
      let sub_options2 = []
      let optionList = []
      options = selectedFields[i].valueRange.split(';')
          //if(notes== {}){
          //  options = selectedFields[i].valueRange.split(';')
          //} else
          //if((notes != null) && (Object.values(notes).length ==  options.length)){
          //  options = Object.values(notes)
          //}
      console.log("c2::options::", options)
      console.log("c2::options.length::", options.length)

      var doubleoption = options.length==2 && selectedFields[i].valueRange.indexOf("::")== -1

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
          form.radioForm(fieldName, fieldDescription, 'ndar'+i, options[0], options[1])
        }
        else{
          for(let m=0;m<options.length;m++){
            optionList.push(options[m])
          }
          form.selectForm(fieldName, fieldDescription, optionList, 'ndar'+i, true)
        }
      }
      else{
        if(doubleoption){
          form.radioForm(fieldName, fieldDescription, 'ndar'+i, sub_options2[0], sub_options2[1])
        }
        else{
          for(let m=0;m<sub_options2.length;m++){
            optionList.push(sub_options2[m])
          }
          form.selectForm(fieldName, fieldDescription, optionList, 'ndar'+i, true)
        }
      }
    }
    else if (selectedFields[i].valueRange.indexOf("::")> -1){
      /*
      * Case3: valueRange of the form - 0::3
      * check notes - parse notes
      */
      flag = false
      if(notes == {}){
        sub_options1 = selectedFields[i].valueRange.trim().split("::")
      }
      else{
        //sub_options1 = Object.values(notes)
        sub_options1 = nvalues
        console.log("c3::sub_options1:: ", sub_options1)
        console.log("c3::sub_options1.length:: ", sub_options1.length)
        //console.log("notes: ", notes)
        if(sub_options1.length == 1){
          sub_options1 = selectedFields[i].valueRange.trim().split("::")
        }
        //console.log(":: ",sub_options1)
      }

      console.log("c3-1::sub-options1:: ",sub_options1)
      console.log("c3-1::sub_options1.length:: ", sub_options1.length)

      if(sub_options1[1].trim()>20){
        if (selectedFields[i].type == "Integer") {
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "number", undefined, fieldValueRange)
        }
        else if (selectedFields[i].type == "Date") {
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", true, fieldValueRange)
        }
        else {
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", undefined, fieldValueRange)
        }
      }

      else{
        let optionList = []

        if(notes == null || notes.hasOwnProperty(selectedFields[i].name)){
          for(let m=sub_options1[0].trim();m<sub_options1[1].trim();m++){
            optionList.push(m)
          }
        }

        else{
          for(let m=0;m<sub_options1.length;m++){
            optionList.push(sub_options1[m])
          }
        }
        form.selectForm(fieldName, fieldDescription, optionList, 'ndar'+i, true)
      }
    }
    else{
      if (selectedFields[i].type == "Integer") {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "number", undefined, fieldValueRange)
      }
      else if (selectedFields[i].type == "Date") {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", true, fieldValueRange)
      }
      else {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", undefined, fieldValueRange)
      }
    }

  }//end of outermost for

  form.inputForm('ExperimentID', 'ExperimentID', 'ndar'+selectedFields.length, "string", false, 'ExperimentID')

  //Generate Alpaca Form
  form.alpacaGen();

}//end of addTerms function

function saveAqInfo(e){
  e.preventDefault()
  //Validation WORK IN PROGRESS
  // for (let i=0; i<=selectedFields.length; i++){
  //   if($("#ndar"+ i).val()==undefined && $("#ndar"+ i).attr('type')!='radio'){
  //     console.log(i)
  //     console.log($("#ndar"+ i).attr('name'))
  //     console.log('flag')
  //     fieldsCorrect = false
  //   }
  // }
  // console.log(fieldsCorrect)
  if(fieldsCorrect == false){
    $("#termsInfoSaveMsg").empty()
    $("#termsInfoSaveMsg").append('<div class="alert alert-danger alert-dismissible" role="alert">\
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
        <strong>Error!</strong> You must either complete form or correct input types.\
      </div>')
  }
  else{
    saveObj['objID'] = ''
    for (let i=0; i<=selectedFields.length; i++){
      //If statement for when selectedFields[i] does not exist
      if (i == selectedFields.length) {
        let lb=$("#ndar"+ i).attr('name')
        saveObj[lb] = $("#ndar"+ i).val()
      }
      else{
        let lb=$("#ndar"+ i).attr('name') || $("input[type='radio'][name= " + selectedFields[i].name + "]").attr('name')
        console.log('lb1:', lb)
        saveObj[lb] = $("#ndar"+ i).val() || $("input[type='radio'][name= " + selectedFields[i].name + "]:checked").val()
        console.log('saveObj[lb]:',saveObj[lb])
      }
    }

    console.log(saveObj)
    //Save the data entered
    $.ajax({
      type: "POST",
      url: serverURL +"/acquisitions/new",
      contentType: "application/json",
      data: JSON.stringify(saveObj),
      success: function(data){
        console.log('success')
        //$("#div-projectFields").empty()
        $("#termsInfoSaveMsg").empty()
        $("#terms-list").empty()
        $("#terms-back").empty()

        $("#termsInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
          <a href="#" class="close" data-dismiss="alert">&times;</a>\
          <strong>Aquisition Object Saved in uploads/acquisition/'+ data['fid']+'!</strong>\
        </div>')
        $("#termsInfoSaveMsg").append('<br>')
        $("#terms-list").append('<button id= "btn-pj-list" class="btn btn-primary">Fill up Another Form </button><br>')
        $("#terms-back").append('<button id= "btn-back" class="btn btn-primary">Back To Main Page </button>')
      }
    })
    console.log('done')
  }
}

function projectListPage(){
  window.location.href = serverURL +"/acquistionForm.html"
}

function mainpage(){
  window.location.href = serverURL
}

$('#btn-aqInfoSave').click(saveAqInfo)
$('#terms-list').click(projectListPage)
$('#terms-back').click(mainpage)

function checkNotes(key,notes){
  let values = {}
  if(notes != null){
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
    return {}
  }
}
