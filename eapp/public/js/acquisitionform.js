let saveObj = {}
let selectedFields =[]
var moment = require('moment')
moment().format()
$('[data-toggle="tooltip"]').tooltip()

$.ajax({
  type: "GET",
  url: "http://localhost:3000/acquisitions/forms",
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

  let url = "http://localhost:3000/acquisitions/forms/" + formName

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

/**
Add fields to the acquistion form UI using a specified JSON file
*/
var fieldsCorrect = true
function add_term_to_form(termform){
  selectedFields = termform['fields']
  console.log("Number of Fields in the form: ",selectedFields.length)
  //console.log("x",x.length)

  for (let i=0; i<selectedFields.length; i++){
    let sid = "ndar-"+i
    let options = []
    let sub_options1 = []
    let nvalues = []

    // check the 'notes' field for any value specified
    let notes = checkNotes(selectedFields[i].name,selectedFields[i].notes)
    if(notes != null){
      nvalues = Object.keys(notes).map(function(key) {
          return notes[key]
          })
    }

    if(selectedFields[i].valueRange == null){
      /* Case1: No Value Range */
      $("#ndar-fields").append('<div class="form-group" id="ndar-'+i+'x">\
        <label for="ndar-'+i+'" data-toggle="tooltip" title="'+selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
        <div>\
        <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'" required>\
        </div>\
        </div>')
    }else if (selectedFields[i].valueRange.indexOf(';')> -1){
      /*  Case 2:
      if valueRange specified with ';' separator
      check notes if values with its meaning specified in the notes
      if notes is empty then parse valueRange field
      otherwise parse notes field and obtain values representation, e.g (1 = "xyz"; 2 = "utty")
      */
      let sub_options2 = []
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

      if(!doubleoption){
        $("#ndar-fields").append('<div class="form-group">\
        <label for="ndar-'+i+'" data-toggle="tooltip" title="'+ selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
        <div>\
          <select class="form-control" id="ndar-'+i+'">\
            <option value="nsource">Select</option>\
            </select>\
          </div>\
        </div>')
      }

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
          $("#ndar-fields").append('<div class="form-group">\
          <label for="ndar-'+i+'" data-toggle="tooltip" title="'+ selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
          <div>\
            <form>\
              <label class="radio-inline">\
                <input type="radio" name="option'+i+'" id="ndar-'+i+'a" value="'+ options[0]+'">'+ options[0] +'</label>\
              <label class="radio-inline">\
                <input type="radio" name="option'+i+'" id="ndar-'+i+'b" value="'+ options[1]+'">'+ options[1] +'</label>\
            </form>\
            </div>\
          </div>')
        }
        for(let m=0;m<options.length;m++){
          $("#"+sid).append('<option value="'+ options[m]+'">'+ options[m] +'</option>')
        }
      }else{
        if(doubleoption){
          $("#ndar-fields").append('<div class="form-group">\
          <label for="ndar-'+i+'" data-toggle="tooltip" title="'+ selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
          <div>\
            <form>\
              <label class="radio-inline">\
                <input type="radio" name="option'+i+'" id="ndar-'+i+'a" value="'+ sub_options2[0]+'">'+ sub_options2[0] +'</label>\
              <label class="radio-inline">\
                <input type="radio" name="option'+i+'" id="ndar-'+i+'b" value="'+ sub_options2[1]+'">'+ sub_options2[1] +'</label>\
            </form>\
            </div>\
          </div>')
        }
        for(let m=0;m<sub_options2.length;m++){
          $("#"+sid).append('<option value="'+ sub_options2[m]+'">'+ sub_options2[m] +'</option>')
        }
      }
    } else if (selectedFields[i].valueRange.indexOf("::")> -1){
      /*
      * Case3: valueRange of the form - 0::3
      * check notes - parse notes
      */
      flag = false
      if(notes == {}){
        sub_options1 = selectedFields[i].valueRange.trim().split("::")
      } else{
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
        $("#ndar-fields").append('<div class="form-group" id="ndar-'+i+'x">\
          <label for="ndar-'+i+'" data-toggle="tooltip" title="'+selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
            <div>\
              <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
            </div>\
          </div>')

      }else{
        $("#ndar-fields").append('<div class="form-group">\
          <label for="ndar-'+i+'" data-toggle="tooltip" title="'+ selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
          <div>\
            <select class="form-control" id="ndar-'+i+'">\
              <option value="select">Select</option>\
            </select>\
          </div>\
          </div>')

        if(notes == null || notes.hasOwnProperty(selectedFields[i].name)){
          for(let m=sub_options1[0].trim();m<sub_options1[1].trim();m++){
            $("#"+sid).append('<option value="'+ m+'">'+ m +'</option>')
          }
        }else{
          for(let m=0;m<sub_options1.length;m++){
            $("#"+sid).append('<option value="'+ sub_options1[m]+'">'+ sub_options1[m] +'</option>')
          }
        }
      }
    }else{
      $("#ndar-fields").append('<div class="form-group" id="ndar-'+i+'x">\
      <label for="ndar-'+i+'" data-toggle="tooltip" title="'+selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
        <div>\
          <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
        </div>\
      </div>')
    }

    if(document.getElementById('ndar-'+i+'') != null){
      document.getElementById('ndar-'+i+'').onblur = function(){fieldValidation()}
    }

    /*
    Validates input type is correct
    So far only for numbers, strings, and dates
    */
    function fieldValidation() {
      let integer = selectedFields[i].type == "Integer"
      let string = selectedFields[i].type == "String"
      let date = selectedFields[i].type == "Date"
      if (integer){
        var range = 'No value range.'
        var type = 'integer'
        if (selectedFields[i].valueRange.indexOf("::")> -1) {
          range = 'Value range is ' + selectedFields[i].valueRange + '.'
        }
      }
      else if (string){
        var range = 'No value range.'
        var type = 'string'
      }
      else {
        var range = 'No value range.'
        var type = 'date'
      }
      let errorMessage = '<div class="alert alert-danger alert-dismissible" role="alert">\
          <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
          <strong>Error!</strong> Input should be '+type+' type. '+range+'\
        </div>'
      if(integer && isNaN(document.getElementById('ndar-'+i+'').value)){
        type = 'integer'
        $('#ndar-'+i+'x').after(errorMessage)
        fieldsCorrect = false
      }
      else if(string && !isNaN(document.getElementById('ndar-'+i+'').value)){
        type = 'string'
        $('#ndar-'+i+'x').after(errorMessage)
        fieldsCorrect = false
      }
      else if(date && !moment(document.getElementById('ndar-'+i+'').value, "MM/DD/YYYY", true).isValid()){
        type = 'date'
        $('#ndar-'+i+'x').after(errorMessage)
        fieldsCorrect = false
      }
      else{
        fieldsCorrect = true
      }
    }

  }//end of outermost for

  $("#ndar-fields").append('<div class="form-group">\
  <label for="ndar-'+selectedFields.length+'" data-toggle="tooltip" title="ExperimentID">ExperimentID</label>\
  <div>\
    <input class="form-control" type="text" placeholder="ExperimentID" id="ndar-'+selectedFields.length+'" required />\
  </div>\
  </div>')

//end of addTerms function
}

function saveAqInfo(e){
  e.preventDefault()
  if(fieldsCorrect == false){
    $("#termsInfoSaveMsg").empty()
    $("#termsInfoSaveMsg").append('<div class="alert alert-danger alert-dismissible" role="alert">\
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
        <strong>Error!</strong> You must correct input types.\
      </div>')
  }
  else{
    saveObj['objID'] = ''
    for (let i=0; i<=selectedFields.length; i++){
      //let lb =$('label[for="ndar-' + i + '"]').html()
      let lb=$('label[for="ndar-' + i + '"]').attr('title')
      console.log('lb1:', lb)
      saveObj[lb] = $("#ndar-"+ i).val() || $("input[type='radio'][name='option"+i+"']:checked").val()
      console.log('saveObj[lb]:',saveObj[lb])
    }

    console.log(saveObj)
    //Save the data entered
    $.ajax({
      type: "POST",
      url: "http://localhost:3000/acquisitions/new",
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
  window.location.href = "http://localhost:3000/acquistionForm.html"
}

function mainpage(){
  window.location.href = "http://localhost:3000"
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
