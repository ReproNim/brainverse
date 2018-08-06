let collectionObj = JSON.parse(localStorage.getItem("collectionObj"))
console.log("collectionObj: ", collectionObj)
let planObjSelected = JSON.parse(localStorage.getItem('planObjSelected'))
console.log("planObjSelected: ", planObjSelected)
let actionObj = JSON.parse(localStorage.getItem('action'))
console.log("actionObj: ", actionObj)

dataTableSource = JSON.parse(localStorage.getItem('dataTableSource'))
console.log('[dc-form: start] dataTableSource:', dataTableSource)
let prevSaveObj={}
let dataSaveObj = localStorage.getItem('saveObj')
if(dataSaveObj !== null){
  prevSaveObj = JSON.parse(localStorage.getItem('saveObj'))
  console.log("prevSaveObj: ", prevSaveObj)
}

$('#projectId').append('<h5> Project Name: '+collectionObj['Name']+'</h5>')
$('#subjectId').append('<h5> Subject ID: '+ actionObj['subjectId']+'</h5>')
$('#planId').append('<h5> Plan: '+ planObjSelected['Project Name']+'</h5>')
$('#sessionId').append('<h5> Session: '+ actionObj['sessionName']+'</h5>')
$('#taskId').append('<h5> Task: '+ actionObj['taskName']+'</h5>')
$('#instrumentId').append('<h5> Instrument: '+ actionObj['instrumentName']+'</h5>')

var form = new AlpacaForm('#dc-fields')
form.alpacaDestroy()
var form = new AlpacaForm('#dc-fields')
moment().format()

let prefilledFields = {'gender':'','dateOfBirth':''}

/*
* Query an activity graph based on SubjectID and Attribute
*/
function queryGraph(subjectId,attrName){
  return new Promise(function(resolve){
    $.ajax({
    type: "GET",
    url: serverURL +"/query/graphs/" + subjectId+'/'+attrName,
    accept: "application/json",
    success: function(data){
      console.log('Query Graph ----:success', data)
      resolve(data)
    }//data
    })
  })
}

queryGraph(actionObj['subjectId'],'gender').then(function(value){
  prefilledFields['gender'] = value['attr']
  console.log("value for gender field: ",prefilledFields['gender'])
  queryGraph(actionObj['subjectId'],'dateofbirth').then (function(value1){
    prefilledFields['dateOfBirth'] = value1['attr']
    console.log("value for dateof birth field: ",prefilledFields['dateOfBirth'])
    $.ajax({
    type: "GET",
    url: serverURL +"/acquisitions/forms/" + actionObj.instrumentName+'.json',
    accept: "application/json",
    success: function(data){
      console.log('acquistions term forms:success', data)
      addTermsToForm(data)
    }//data
  })
  })
}).catch(function(error){
  console.log("query graph error: ",error)
})


/**
Add fields to the acquisition form UI using a specified JSON file
*/
let selectedFields = []

function addTermsToForm(termForm){
  selectedFields = termForm['fields']
  console.log("Number of Fields in the form: ",selectedFields.length)

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

    console.log("-- Field being added to form: ", selectedFields[i])
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
        if (selectedFields[i].name ==='interview_age') {
          console.log("[interview_age] Interview Age Field ---:",selectedFields[i].name )
          if(prefilledFields['dateOfBirth']!==''){
            console.log("dateOfBirth is not empty: ", prefilledFields['dateOfBirth'])
            let interview_age = moment().diff(prefilledFields['dateOfBirth'],'months')
            console.log("[dc-form.js]interview_age calculated: ", interview_age)
            form.inputInteger(fieldName, fieldDescription, 'ndar'+i, "number", "number",undefined,interview_age, fieldRequired,false)
          }else{
            form.inputForm(fieldName, fieldDescription, 'ndar'+i, "number", "number",undefined, fieldValueRange,fieldRequired,false)
          }
        }else{
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "number", "number",undefined, fieldValueRange,fieldRequired,false)
        }
      }
      else if (selectedFields[i].type == "Date") {
        //form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", "date",true, fieldValueRange, fieldRequired,false)
        form.inputDate(fieldName, fieldDescription, 'ndar'+i, "string", "date",true, fieldValueRange, fieldRequired,false)
      }
      else {
        if(selectedFields[i].name ==='src_subject_id'){
          form.inputText(fieldName, fieldDescription, 'ndar'+i, "string", renderType,undefined, actionObj['subjectId'], fieldRequired,false)
        }else{
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", renderType,undefined, fieldValueRange, fieldRequired,false)
        }

      }
      //console.log("CASE1: form::::", form.baseForm)
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
      //console.log("c2::options::", options)
      //console.log("c2::options.length::", options.length)

      var doubleoption = options.length==2 && selectedFields[i].valueRange.indexOf("::")== -1

      for (let j=0; j< options.length; j++){
        //console.log("Adding:",options[j])
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
          if(selectedFields[i].name == 'gender' && (prefilledFields['gender'] !== '') && (typeof prefilledFields['gender'] !=='undefined')){
            form.inputRadio(fieldName, fieldDescription, 'ndar'+i, options,prefilledFields['gender'],fieldRequired,false)
          }else{
            form.radioForm(fieldName, fieldDescription, 'ndar'+i, options,fieldRequired,false)
          }
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
    }else if(selectedFields[i].valueRange.indexOf("::")> -1){
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
        //console.log("c3::sub_options1:: ", sub_options1)
        if(sub_options1.length == 1){
          sub_options1 = selectedFields[i].valueRange.trim().split("::")
        }
        //console.log(":: ",sub_options1)
      }
      //console.log("c3-1::sub-options1:: ",sub_options1)
      if(sub_options1[1].trim()>20){
        if (selectedFields[i].type == "Integer") {
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "number", "number",undefined, fieldValueRange, fieldRequired,false)
        }
        else if (selectedFields[i].type == "Date") {
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", "date",true, fieldValueRange, fieldRequired,false)
        }
        else {
          form.inputForm(fieldName, fieldDescription, 'ndar'+i, "string", renderType,undefined, fieldValueRange, fieldRequired,false)
        }
      }else{
        let optionList = []
        if(notes == null || notes.hasOwnProperty(selectedFields[i].name)){
          for(let m=sub_options1[0].trim();m<sub_options1[1].trim();m++){
            optionList.push(m)
          }
        }else{
          for(let m=0;m<sub_options1.length;m++){
            optionList.push(sub_options1[m])
          }
        }
        form.radioForm(fieldName, fieldDescription,'ndar'+i, optionList,fieldRequired, false)
      }
    }else{
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
    saveObj['fields'] = {}
    for(let i=0; i< selectedFields.length; i++){
      //If statement for when selectedFields[i] does not exist
      if (i == selectedFields.length) {
        let lb=$("#ndar"+ i).attr('name')
        saveObj['fields'][lb] = $("#ndar"+ i).val()
      }
      else{
        let lb=$("#ndar"+ i).attr('name') || $("input[type='radio'][name= " + selectedFields[i].name + "]").attr('name')
        console.log('lb1:', lb)
        saveObj['fields'][lb] = $("#ndar"+ i).val() || $("input[type='radio'][name= " + selectedFields[i].name + "]:checked").val()
        console.log('saveObj[lb]:',saveObj['fields'][lb])
        if(selectedFields[i].name === 'interview_age'){
          let iage = saveObj['fields'][lb]
          let dateOfBirth = moment().subtract(iage,'months').calendar()
          console.log("date of birth: ", dateOfBirth)
          saveObj['DateOfBirth'] = dateOfBirth
        }
      }
    }
    saveObj['objID'] = uuid()
    saveObj['Project'] = collectionObj
    saveObj['Session'] = {
      'SessionID': actionObj['sessionId'],
      'SessionNumber': actionObj['sessionNumber'],
      'SessionName': actionObj['sessionName']
    }
    saveObj['AcquisitionActivity'] = {
      'AcquisitionActivityID':actionObj['taskId'],
      'AcquisitionName': actionObj['taskName'],
      'Status': 'completed'
    }
    saveObj['InstrumentName'] = actionObj['instrumentName']
    saveObj['PlanID'] = planObjSelected['ProjectPlanID']
    saveObj['SubjectID'] = actionObj['subjectId']
    saveObj['version'] = 1 // when completed

    console.log("[dc-form] saveObj: ", saveObj)
    localStorage.setItem("saveObj", JSON.stringify(saveObj))


    //Save the data entered to database
    $.ajax({
      type: "POST",
      url: serverURL +"/acquisitions/new",
      contentType: "application/json",
      data: JSON.stringify(saveObj),
      success: function(data){
        console.log('[dc-form]success:', data)
        saveObj = JSON.parse(localStorage.getItem("saveObj"))
        console.log("[dc-form: ajax] saveObj: ", saveObj)
        console.log('done')
      }
    })


}
$('#btn-aqInfoSave').click(function(e){
  saveDCFormData(e)
  //actionObj['status'] = 'completed'
  console.log("action obj after save click------", actionObj)
  let numSessions = planObjSelected["Sessions"].length
  let sessions = planObjSelected["Sessions"]
  let m=0
  for(let i=0; i<numSessions; i++){
    let numInst = sessions[i]["Instruments"].length
    let inst = sessions[i]["Instruments"]
    for(let j=0; j< numInst; j++){
      if(inst[j].hasOwnProperty('status') && actionObj['uid']===m){
        inst[j]["status"] = 'completed'
        break
      }
      m++
    }
  }
  let dataTS = JSON.parse(localStorage.getItem('dataTableSource'))
  dataTS[actionObj['uid']]["status"] = 'completed'
  console.log('[dc-form: save]dataTableSource:', dataTS)
  console.log("[dc-form: save]planObjSelected: ", planObjSelected)
  var currentsubjectDTSource = []
  for (let i = 0; i< dataTS.length; i++) {
    // select only current subject data acquisition tasks
       if (dataTS[i]['subjectId'] === actionObj['subjectId']) {
          currentsubjectDTSource.push(dataTS[i])
       }
  }
  console.log("subjectDT ---- ", currentsubjectDTSource)
  localStorage.setItem('action',JSON.stringify(actionObj))
  localStorage.setItem('planObjSelected',JSON.stringify(planObjSelected))
  localStorage.setItem('dataTableSource', JSON.stringify(currentsubjectDTSource))
  window.location.href = serverURL+"/data-collection/html/dc-form-2.html"
})

$('#btn-back-dc-form-2').click(function(){
    window.location.href = serverURL+"/data-collection/html/dc-form-2.html"
})

