/*
* Initialization
*/
let instForm = new AlpacaForm('#designerDiv')
let shortName = ""
let saveObj= {}
let termsIndex = {}

/*
* Get the instrument information
* Either an existing instrument is loaded
* or a new instrument created with name and description is loaded
*/
instObj = JSON.parse(localStorage.getItem("instObj"))
if(instObj['shortName'] === undefined){
  //a new instrument is being created
  shortName = instObj["Name"].trim() + getRandomIntInclusive(10,99)
}else{
  //an existing form is loaded
  shortName = instObj['shortName']
}
console.log("[ie]: instObj", instObj)

/*
* Setting up the UI for instrument information - Name and description
* and update Modal for the instrument
*/
$('#instrumentInfo').append('<h4 id="iname">'+ instObj['Name']+' <a data-toggle="modal" href="#updateInstrumentInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a></h4><hr>')
$('#instrumentInfo').append(createModal('updateInstrumentInfoModal', 'Update Instrument Information', 'Update'))
let instInfoForm = new AlpacaForm('#body-updateInstrumentInfoModal')
createInstrumentInfoForm(instInfoForm,"updateInstrumentInfoModal", instObj["Name"],instObj["Description"])

/*
* Update Instrument Info - Name and Description
*/
$(document).on('hidden.bs.modal','#updateInstrumentInfoModal', function(e){
  console.log("[ie] instrument name",  $("#updateInstrumentInfoModal-name").val())
  console.log("[ie] desc: ", $("#instDescription").val())
  let name = $("#updateInstrumentInfoModal-name").val()
  let desc = $("#instDescription").val()
  if(name != ""){
    instObj["Name"] = $("#updateInstrumentInfoModal-name").val()
  }
  if(desc!= ""){
    instObj["Description"] = $("#instDescription").val()
  }
  localStorage.setItem("instObj", JSON.stringify(instObj))
  $('#iname').html(instObj['Name']+' <a data-toggle="modal" href="#updateInstrumentInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a>')
  updateInstrumentInfo()
})

/**
** Updating and Saving the updated instrument info into the format for rdf serialization
**/
function updateInstrumentInfo(){
  localStorage.setItem("instObj", JSON.stringify(instObj))
  console.log("[ie] update inst obj info: ", instObj)
}
setupForm()
setup(instForm.properties,instForm.fields)

function setCommonFields(){
  let version = ''
  console.log("version number : ", version)
  saveObj['DictionaryID'] = ''
  //TODO: Need to have scheme to uniquely name the file
  if(instObj['shortName'] === undefined){
    saveObj['shortName'] = shortName
    saveObj["DerivedFrom"] = ''
  }else{
    //editing an existing form
    if(shortName.indexOf('-m') === -1){
      saveObj['shortName'] = shortName+ "-m" + getRandomIntInclusive(10,99)
    }else{
      let rootSN = shortName.split('-m')
      saveObj['shortName'] = rootSN[0] + '-m' + getRandomIntInclusive(10,99)
    }
    //saveObj["DerivedFrom"] = instObj['DictionaryID']
    saveObj["DerivedFrom"] = shortName
  }
  saveObj["Name"] = instObj["Name"]
  saveObj["Description"] = instObj["Description"]
  saveObj["title"] = instObj["Name"]
  saveObj["author"]=''

}

function setTerm(schema, key, field,position){
  let term = {}
  let termId = key
  console.log("KEY--: ", termId)
  if(field.hasOwnProperty('id')){
    console.log("CASE1: terms exists: ", )
    termId = field.id.split('-')[1]
    if(termId.indexOf('new') !== -1){
      term['id'] = termId
    }else{
      term['id'] = parseInt(termId)
    }
    console.log("termId: ", termId, "  term['id']=", term['id'])
    if(schema.properties[key].required){
      term['required'] = "Required"
    } else{
      term['required'] = "Recommended"
    }
    term['condition'] = termsIndex[termId].condition
    term['aliases'] = termsIndex[termId].aliases
    term['filterElement'] = termsIndex[termId].filterElement
    term['position'] = termsIndex[termId].position
    term['dataElementId'] = termsIndex[termId].dataElementId
    term['name'] = key
    term['type'] = termsIndex[termId].type
    term['renderType'] = field.type
    term['size'] = termsIndex[termId].size
    term['description'] = field.label
    if(schema.properties[key].enum === undefined){
      term['valueRange'] = null
    }else{
      term['valueRange'] = termsIndex[termId].valueRange
    }
    term['notes'] = termsIndex[termId].notes
    term['translation'] = termsIndex[termId].translations
    console.log("instrument existing term: ", term)
  }else{
    /** adding new field **/
    console.log("CASE 2: ADDing New Term: ")
    term['id'] = termId
    console.log("termId: ", termId, "  term['id']=", term['id'])
    if(schema.properties[key].required){
      term['required'] = "Required"
    } else{
      term['required'] = "Recommended"
    }
    term['condition'] = null
    term['aliases'] = null
    term['filterElement'] = null
    term['position'] = position
    term['dataElementId'] = position
    if(field.hasOwnProperty('name')){
      term['name'] = field.name
    }else{
      term['name'] = termId
    }
    term['description'] = field.label
    if(schema.properties[key].enum === undefined){
      term['valueRange'] = null
     }else{
      term['valueRange'] = schema.properties[key].enum
    }
    //ndaTerm['valueRange'] = schema.properties[key].enum.join(';')
    term['type'] = schema.properties[key].type
    term['renderType'] = field.type
    if(field.size === undefined){
      term['size'] = field.size
    }else{
      term['size'] = null
    }
    term['notes'] = null
    console.log("instrument new term:", term)
  }
  return term
 }

 function saveCuratedForm(schema,options,storageType){
  let rTerms = []
  let rTerm = {}
  console.log("Start converting from the Alpaca schema and options to NDA data model")
  //Start converting from the schema and options
  console.log("Alpaca Schema ---:", schema)
  console.log("Alpaca Options ---:", options)
  let rfields = options.fields
  let position = 0
  setCommonFields()
  $.each(rfields, function(key, field) {
    console.log("key = ", key, " field = ",field)
    rTerm = {}
    position++
    rTerm = setTerm(schema, key, field, position)
    rTerms.push(rTerm)
    console.log("Saving rTerm: ", rTerm)
  })
  saveObj['fields'] = rTerms
  console.log("SAVING saveObj----",saveObj, "  ----")
  let saveUrl = ''
  if(storageType === 'github'){
    saveUrl = serverUrl + "/instruments/github/new"
    console.log("Saving to Local and GitHub---")
  }else{
    saveUrl = serverUrl + "/instruments/local/new"
    console.log("Saving To Local---")
  }
  $.ajax({
    type: "POST",
    url: saveUrl,
    contentType: "application/json",
    data: JSON.stringify(saveObj),
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
      window.location.href = serverURL+"/instrument-editor/html/ie-mgm.html"
    }
  })
 }
 function getRandomIntInclusive(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
 }

 //Preview function
 function setupForm(){
   var fproperties = {}
   var ffields = {}
   instForm.alpacaDestroy()
   instForm = new AlpacaForm('#designerDiv');
   let terms = instObj["fields"]
   if(terms !== undefined){
    for (let i=0; i<terms.length; i++){
      if(!terms[i].hasOwnProperty('name')){
        terms[i]['name'] = terms[i].id
      }
      termsIndex[terms[i].id] = terms[i]
      addTermToForm(terms[i])
    }
    console.log("TermsIndex: ", termsIndex)
    termsIndex["shortName"] = instObj["shortName"]
  }

 }

 function addTermToForm(selectedField){
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
    let renderType='text'
    if(selectedField.hasOwnProperty('renderType')){
      renderType = selectedField.renderType
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
     console.log("selectField valueRange:",selectedField.valueRange)

     if(selectedField.valueRange == null || selectedField.valueRange.length ===0){
       /* Case1: No Value Range */
       console.log("Case 1: valueRange == null ")
       if (selectedField.type == "Integer") {
         instForm.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "number", "number",undefined, fieldValueRange, fieldRequired,false)
       }
       else if (selectedField.type == "Date") {
         instForm.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", "date",true, fieldValueRange, fieldRequired,true)
       }
       else {
         console.log("fieldName:", fieldName)
         instForm.inputForm(fieldName.toString(), fieldDescription, 'preview-'+idnum, "string",renderType,undefined, fieldValueRange, fieldRequired,false)
       }
     }
     else if (selectedField.valueRange.indexOf(';')> -1 || $.isArray(selectedField.valueRange)){
       /*  Case 2:
       if valueRange specified with ';' separator
       check notes if values with its meaning specified in the notes
       if notes is empty then parse valueRange field
       otherwise parse notes field and obtain values representation, e.g (1 = "xyz"; 2 = "utty")
       */
       console.log("~~Case 2: valueRange specified by ;~~~ ")
       let sub_options2 = []
       let optionList = []
       if(!$.isArray(selectedField.valueRange)){
         options = selectedField.valueRange.split(';')
       }else{
         options = selectedField.valueRange
       }
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
           instForm.radioForm(fieldName, fieldDescription, 'preview-'+idnum, options,fieldRequired,false)
           console.log("Adding radio for: ", fieldName)
         }
         else{
           for(let m=0;m<options.length;m++){
             optionList.push(options[m])
           }
           //form.selectForm(fieldName, fieldDescription, optionList, 'preview'+idnum, false)
           instForm.radioForm(fieldName, fieldDescription, 'preview-'+idnum, optionList, fieldRequired, true)
           console.log("Adding radio for: ", fieldName)
         }
       }
       else{
         if(doubleoption){
           instForm.radioForm(fieldName, fieldDescription, 'preview-'+idnum, sub_options2, true)
           console.log("Adding radio for: ", fieldName)
         }
         else{
           for(let m=0;m<sub_options2.length;m++){
             optionList.push(sub_options2[m])
           }
           //form.selectForm(fieldName, fieldDescription, optionList, 'preview'+idnum, false)
           console.log("Adding radio for: ", fieldName)
           instForm.radioForm(fieldName, fieldDescription, 'preview-'+idnum, optionList, fieldRequired,true)
         }
       }
     }
     else if (selectedField.valueRange.indexOf("::")> -1){
       /*
       * Case3: valueRange of the form - 0::3
       * check notes - parse notes
       */
       console.log("Case 3: valueRange specified by :: ")
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
           instForm.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "number", "number",undefined, fieldValueRange, fieldRequired,true)
         }
         else if (selectedField.type == "Date") {
           instForm.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", "date",true, fieldValueRange, fieldRequired,true)
         }
         else {
           instForm.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", renderType,undefined, fieldValueRange, fieldRequired,true)
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
         instForm.radioForm(fieldName, fieldDescription, 'preview-'+idnum, optionList, fieldRequired, false)
       }
     }
     else{
       console.log("Case 4: other options ")
       if (selectedField.type == "Integer") {
         instForm.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "number", "number",undefined, fieldValueRange, fieldRequired,true)
       }
       else if (selectedField.type == "Date") {
         instForm.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", "date",true, fieldValueRange, fieldRequired,true)
       }
       else {
         instForm.inputForm(fieldName, fieldDescription, 'preview-'+idnum, "string", renderType,undefined, fieldValueRange, fieldRequired, true)
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
