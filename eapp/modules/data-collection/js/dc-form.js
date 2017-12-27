moment().format()
let actionObj = JSON.parse(localStorage.getItem('action'))
$.ajax({
  type: "GET",
  url: serverURL +"/acquisitions/forms/" + actionObj.instrumentName+'.json',
  accept: "application/json",
  success: function(data){
    console.log('acquistions term forms:success', data)
    addTermsToForm(data)
  }//data
})


var form = new AlpacaForm('#dc-fields')
form.alpacaDestroy()
var form = new AlpacaForm('#dc-fields')
/**
Add fields to the acquistion form UI using a specified JSON file
*/
var fieldsCorrect = true
let selectedFields = []
function addTermsToForm(termForm){
  selectedFields = termForm['fields']
  console.log("Number of Fields in the form: ",selectedFields.length)
  //console.log("x",x.length)

  //Create ungenerated JSON form

  for (let i=0; i<selectedFields.length; i++){
    let options = []
    let sub_options1 = []
    let nvalues = []
    let idnum = selectedFields[i].id
    let fieldName = selectedFields[i].name
    let fieldDescription = selectedFields[i].description
    let fieldValueRange = selectedFields[i].valueRange
    let fieldRequired = false
    if(selectedFields[i].required === "Required"){
      fieldRequired = true
    }
    let renderType='text'
    if(selectedFields[i].hasOwnProperty('renderType')){
      renderType = selectedFields[i].renderType
    }
    // check the 'notes' field for any value specified
    let notes = checkNotes(selectedFields[i].name,selectedFields[i].notes)
    if(notes != null){
      nvalues = Object.keys(notes).map(function(key) {
          return notes[key]
          })
    }

    if(selectedFields[i].valueRange == null || selectedFields[i].valueRange.length ===0){
      /* Case1: No Value Range */
      if (selectedFields[i].type == "Integer") {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "number", "number",undefined, fieldValueRange,fieldRequired,false)

      }
      else if (selectedFields[i].type == "Date") {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", "date",true, fieldValueRange, fieldRequired,false)

      }
      else {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", renderType,undefined, fieldValueRange, fieldRequired,false)

      }
      console.log("CASE1: form::::", form.baseForm)
    }
    else if (selectedFields[i].valueRange.indexOf(';')> -1 || $.isArray(selectedFields[i].valueRange)){
      /*  Case 2:
      if valueRange specified with ';' separator
      check notes if values with its meaning specified in the notes
      if notes is empty then parse valueRange field
      otherwise parse notes field and obtain values representation, e.g (1 = "xyz"; 2 = "utty")
      */
      let sub_options2 = []
      let optionList = []

      if(!$.isArray(selectedFields[i].valueRange)){
        options = selectedFields[i].valueRange.split(';')
      }else{
        options = selectedFields[i].valueRange
      }
      //options = selectedFields[i].valueRange.split(';')
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
          form.radioForm(fieldName, fieldDescription, 'ndar'+i, options,fieldRequired,false)
        }
        else{
          for(let m=0;m<options.length;m++){
            optionList.push(options[m])
          }
          //form.selectForm(fieldName, fieldDescription, optionList, 'ndar'+i, true)
          form.radioForm(fieldName, fieldDescription, 'ndar-'+i, optionList, fieldRequired, false)
        }
      }
      else{
        if(doubleoption){
          form.radioForm(fieldName, fieldDescription, 'ndar'+i, sub_options2,false)
        }
        else{
          for(let m=0;m<sub_options2.length;m++){
            optionList.push(sub_options2[m])
          }
          form.radioForm(fieldName, fieldDescription,'ndar'+i, optionList, fieldRequired,false)
        }
      }
    }
    else if (selectedFields[i].valueRange.indexOf("::")> -1){
      /*
      * Case3: valueRange of the form - 0::3
      * check notes - parse notes
      */
      flag = false
      if(notes == null){
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
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "number", undefined, fieldValueRange, fieldRequired,false)
        }
        else if (selectedFields[i].type == "Date") {
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", true, fieldValueRange, fieldRequired,false)
        }
        else {
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", undefined, fieldValueRange, fieldRequired,false)
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
        form.radioForm(fieldName, fieldDescription,'ndar'+i, optionList,fieldRequired, false)
      }
    }
    else{
      if (selectedFields[i].type == "Integer") {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "number", "number",undefined, fieldValueRange,fieldRequired,false)
      }
      else if (selectedFields[i].type == "Date") {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", "date",true, fieldValueRange,fieldRequired,false)
      }
      else {
        form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", renderType,undefined, fieldValueRange,fieldRequired,false)
      }
    }

  }//end of outermost for

  console.log("form fields: ", form.baseForm)
  //Generate Alpaca Form
  form.alpacaGen()
}

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
    return null
  }
}

function saveDCFormData(e){
  e.preventDefault()
  let saveObj = {}
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
    for(let i=0; i< selectedFields.length; i++){
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

    console.log("saveObj", saveObj)
    //Save the data entered
    /*$.ajax({
      type: "POST",
      url: serverURL +"/acquisitions/new",
      contentType: "application/json",
      data: JSON.stringify(saveObj),
      success: function(data){
        console.log('success:', data)
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
    })*/
    console.log('done')
  }
}
$('#btn-aqInfoSave').click(function(e){
  saveDCFormData(e)
})
