/*
* Get the instrument information
*/
instObj = JSON.parse(localStorage.getItem("instObj"))
console.log("[ie]: instObj", instObj)

saveObj= {}
$('#instrumentInfo').append('<h4 id="iname">'+ instObj['Instrument Name']+' <a data-toggle="modal" href="#updateInstrumentInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a></h4><hr>')
$('#instrumentInfo').append(createModal('updateInstrumentInfoModal', 'Update Instrument Information', 'Update'))
let instInfoForm = new AlpacaForm('#body-updateInstrumentInfoModal')
createInstrumentInfoForm(instInfoForm,"updateInstrumentInfoModal", instObj["Instrument Name"],instObj["Description"])

/*
* Update Instrument Info - Name and Description
*/
$(document).on('hidden.bs.modal','#updateInstrumentInfoModal', function(e){
  console.log("[ie] instrument name",  $("#updateInstrumentInfoModal-name").val())
  console.log("[ie] desc: ", $("#instDescription").val())
  let name = $("#updateInstrumentInfoModal-name").val()
  let desc = $("#instDescription").val()
  if(name != ""){
    instObj["Instrument Name"] = $("#updateInstrumentInfoModal-name").val()
  }
  if(desc!= ""){
    instObj["Description"] = $("#instDescription").val()
  }
  localStorage.setItem("instObj", JSON.stringify(instObj))
  $('#iname').html(instObj['Instrument Name']+' <a data-toggle="modal" href="#updateInstrumentInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a>')
  updateInstrumentInfo()

})

/**
** Updating and Saving the updated instrument info into the format for rdf serialization
**/
function updateInstrumentInfo(){
  localStorage.setItem("instObj", JSON.stringify(instObj))
  console.log("[ie] update inst obj info: ", instObj)
}
setup()

function setCommonFields(){
  let version = ''
  console.log("version number : ", version)
  saveObj['DictionaryID'] = ''

  //TODO: Need to have scheme to uniquely name the file
  /*if(shortName.indexOf('-m')==-1){
    version = shortName.substring((shortName.length-2),(shortName.length))
    //saveObj2['shortName'] = shortName + "-m" + (parseInt(version)+1)
    saveObj2['shortName'] = shortName + "-m" + getRandomIntInclusive(10,99)
  }else{
    version = shortName.substring((shortName.length-1),(shortName.length))
    //saveObj2['shortName'] = shortName.substring(0,shortName.length-2) + "m" + (parseInt(version)+1)
    saveObj2['shortName'] = shortName.substring(0,shortName.length-2) + getRandomIntInclusive(10,99)
  }*/
  saveObj["Name"] = instObj["Instrument Name"]
  saveObj["Description"] = instObj["Description"]
  saveObj["title"] = instObj["Instrument Name"]
  saveObj["shortName"] = instObj["Instrument Name"]
  saveObj["DerivedFrom"] = instObj["Instrument Name"]
  saveObj["author"]=''
}


//TODO: Need to check the fields whose values do not change and whose changes
// for example, if valueRange value changed then we need to assign the new value schema.properties[key].enum
// rather than termsIndex[ndaId].valueRange
 function setTerm(schema, key, field,position){
   let term = {}
   //if(field.hasOwnProperty('id')){
     /** fields already in the form**/
    /** adding new field **/
     let termId = key
     console.log("termId: ", termId)
     term['id'] = termId
     if(schema.properties[key].required){
        term['required'] = "Required"
     } else{
        term['required'] = "Recommended"
     }
     term['name'] = field.name
     term['description'] = field.label
     if(schema.properties[key].enum === undefined){
       term['valueRange'] = null
     }else{
       term['valueRange'] = schema.properties[key].enum
     }

     //ndaTerm['valueRange'] = schema.properties[key].enum.join(';')
     term['type'] = schema.properties[key].type
     term['renderType'] = field.type
     term['size'] = null
     term['position'] = position
     term['dataElementId'] = position
     term['notes'] = null
  return term
  console.log("instrument new term:", term)
 }

 function saveCuratedForm(schema,options,storageType){
  let rTerms = []
  let rTerm = {}
  console.log("Start converting from the schema and options")
  //Start converting from the schema and options
  console.log("OPTIONS value saving: --", options.fields)
  let rfields = options.fields
  let position = 0
  setCommonFields()
  $.each(rfields, function(key, field) {
    console.log(key, field)
    rTerm = {}
    position++
    rTerm = setTerm(schema, key, field, position)
       rTerms.push(rTerm)
       console.log("rTerm: ", rTerm)
     })
     saveObj['fields'] = rTerms
   console.log("SAVING ----",saveObj)
   let saveUrl = ''
   if(storageType === 'github'){
     saveUrl = serverUrl + "/repronim/dictionaries/github"
     console.log("Saving to Local and GitHub---")
   }else{
     saveUrl = serverUrl + "/repronim/dictionaries/local"
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
     }
   })
 }
