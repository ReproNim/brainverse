$.fn.select2.defaults.set( "theme", "bootstrap" )
$("#div-planListMenu").select2()

collectionObj = JSON.parse(localStorage.getItem("collectionObj"))
console.log("collectionObj: ", collectionObj)

$('#collectionInfo').append('<h4 id="collectionName">'+ collectionObj['Name']+' <a data-toggle="modal" href="#updateCollectionInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a></h4><hr>')
$('#collectionInfo').append(createModal('updateCollectionInfoModal', 'Update Collection Information', 'Update'))
let collectionInfoForm = new AlpacaForm('#body-updateCollectionInfoModal')
createCollectionInfoForm(collectionInfoForm,"updateCollectionInfoModal", collectionObj["Name"],collectionObj["Description"])

/*
* Update Collection Info - Name and Description
*/
$(document).on('hidden.bs.modal','#updateCollectionInfoModal', function(e){
  console.log("[dc] collection name",  $("#updateCollectionInfoModal-name").val())
  console.log("[dc] desc: ", $("#collectionDescription").val())
  let name = $("#updateCollectionInfoModal-name").val()
  let desc = $("#collectionDescription").val()
  if(name != ""){
    collectionObj["Name"] = $("#updateCollectionInfoModal-name").val()
  }
  if(desc!= ""){
    collectionObj["Description"] = $("#collectionDescription").val()
  }
  localStorage.setItem("collectionObj", JSON.stringify(collectionObj))
  $('#collectionName').html(collectionObj['Name']+' <a data-toggle="modal" href="#updateCollectionInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a>')
  updateCollectionInfo()
})

addPlan()
/**
** Updating and Saving the updated collection info into the format for rdf serialization
**/
function updateCollectionInfo(){
  localStorage.setItem("collectionObj", JSON.stringify(collectionObj))
  console.log("[dc] update collection obj info: ", collectionObj)
}

function displayPlanList(){
  return new Promise(function(resolve){
    $.ajax({
      type: "GET",
      url: serverURL +"/project-plans",
      accept: "application/json",
      success: function(data){
        console.log('acquistions forms:success', data)
        let pforms = data.list
        if(pforms.length == 0){
          console.log("no forms to display")
          resolve([])
        }else{
          resolve(pforms)
        }
      }
    })
  })
}
function addPlan(){
  displayPlanList().then(function(planList){
    var values = planList.map(function(planName){
      return new Promise(function(resolve){
        let url = serverURL+"/project-plans/" + planName
          $.ajax({
            type: "GET",
            url: url,
            accept: "application/json",
            success: function(data){
              console.log('acquisitions term forms:success', data)
              resolve(data)
            }//data
          })
      })
    })
    return Promise.all(values)
  }).then(function(planObjs){
    console.log("all plan obj: ", planObjs)
    if(planObjs.length !== 0){
      for (let i=0;i<planObjs.length;i++){
        $("#div-planListMenu").append('<option id="'+planObjs[i]["Project Name"].trim()+'" value="'+ planObjs[i]["Project Name"]+'">'+ planObjs[i]["Project Name"] +'</option>')
        planListObjs[planObjs[i]["Project Name"].trim()] = planObjs[i]
      }
    }
  })
}


$("#div-planListMenu").change(function(){
  let planSelected = $("#div-planListMenu").val()
  planObjSelected = planListObjs[planSelected.trim()]
  localStorage.setItem('planObjSelected', JSON.stringify(planObjSelected))
  loadPlan1(planObjSelected)
  //let test = JSON.parse(localStorage.getItem('planObjSelected'))
  //console.log("test: ", test)
})

//Show the plan in kanaban board style with status
function loadPlan(plan){
 // append all sessions informations into the table
 $("#activityList").empty()
 let numSessions = plan["Sessions"].length
 let sessions = plan["Sessions"]
 let tableHTML = ''
 for(let i=0; i<numSessions; i++){

  let numInst = sessions[i]["Instruments"].length
  let inst = sessions[i]["Instruments"]
  for(let j=0; j< numInst; j++){
    tableHTML = tableHTML + '<tr><td class="rowlink-skip">' + (i+1) + '</td><td class="rowlink-skip">'+sessions[i]["Session Name"]+'</td>'
    tableHTML = tableHTML + '<td class="rowlink-skip">' + inst[j]["Task Name"] + '</td>' + '<td class="rowlink-skip"><a href="#rowlinkModal" data-toggle="modal">'+inst[j]["InstrumentName"] +'</a></td>'
    if(inst.hasOwnProperty('status')){
      tableHTML = tableHTML + '<td class="rowlink-skip">'+inst[j]["status"]+' </td></tr>'
    }else{
      tableHTML = tableHTML + '<td class="rowlink-skip"> Not Completed </a></td></tr>'
    }
  }
 }
 $("#activityList").append('<table class="table table-striped table-bordered table-hover" id="planSummary">\
 <thead><tr><th>Session Number</th> <th> Session Name</th><th>Task Name</th><th>Instrument Name</th><th>Status </th></tr></thead>\
 <tbody data-link="row" class="rowlink">'+tableHTML+'</tbody>\
 </table>')

}

function loadPlan1(plan){
  convert2jqxTableSource(plan)
  var source = {
    localData: dataTableSource,
    dataType: "array",
    dataFields: [{
        name: 'sessionNumber',
        type: 'string'
    }, {
        name: 'sessionName',
        type: 'string'
    }, {
        name: 'taskName',
        type: 'string'
    }, {
        name: 'instrumentName',
        type: 'string'
    }, {
        name: 'status',
        type: 'string'
    }]
  }

  var dataAdapter = new $.jqx.dataAdapter(source)
  $("#activityTable").jqxDataTable({
      width: 1000,
      theme: 'energyblue',
      //pageable: true,
      //pagerMode: 'advanced',
      filterable: true,
      source: dataAdapter,
      columns: [{
          text: 'Session Number',
          dataField: 'sessionNumber',
          width: 120
      }, {
          text: 'Session Name',
          dataField: 'sessionName',
          width: 200
      }, {
          text: 'Task Name',
          editable: false,
          dataField: 'taskName',
          width: 280
      }, {
          text: 'Instrument Name',
          dataField: 'instrumentName',
          width: 300
          //cellsAlign: 'right',
          //align: 'right'
      }, {
          text: 'Status',
          dataField: 'status',
          width: 100
          //cellsAlign: 'right',
          //align: 'right',
          //cellsFormat: 'c2'
      }]
  })
  $('#activityTable').on('rowClick', function (event) {
    var args = event.args
    var row = args.row
    var index = args.index;
    // row key
    var rowKey = args.key;

    console.log("args: ", args)
    console.log("row clicked:", row)
    console.log("index: ", index)
    console.log("rowKey: ", rowKey)
    event.stopPropagation()
    row['subjectId'] = $("#subjectId").val()
    localStorage.setItem("action",JSON.stringify(row))
    window.location.href = serverURL+"/data-collection/html/dc-form.html"


    /*$("#activityTable").jqxDataTable('updateRow', index, {
        sessionNumber: row.sessionNumber,
        sessionName: row.sessionName,
        taskName: row.taskName,
        instrumentName:row.instrumentName,
        status: "completed"
    });*/

  })
}

function convert2jqxTableSource(plan){

  let numSessions = plan["Sessions"].length
  let sessions = plan["Sessions"]
  let m=0
  for(let i=0; i<numSessions; i++){
    let numInst = sessions[i]["Instruments"].length
    let inst = sessions[i]["Instruments"]
    for(let j=0; j< numInst; j++){
      m++
      sessionNumbers.push(i+1)
      sessionNames.push(sessions[i]["Session Name"])
      taskNames.push(inst[j]["Task Name"])
      instrumentNames.push(inst[j]["InstrumentName"])
      if(inst[j].hasOwnProperty('status')){
        console.log("if: [dc:] status already set: ", inst[j]["status"])
        statuses.push(inst[j]["status"])
      }else{
        console.log("else: status is being added to planObj and statuses")
        inst[j]["status"] = "Not completed"
        statuses.push(inst[j]["status"])
      }
    }
  }
  console.log("[dc:convert2jqxTableSource]:planObjSelected", planObjSelected)

  //localStorage.setItem('statuses', JSON.stringify(statuses))
  localStorage.setItem('planObjSelected', JSON.stringify(planObjSelected))

  for(let k=0; k<sessionNames.length;k++){
    let row = {}
    row['sessionNumber'] = sessionNumbers[k]
    row['sessionName'] = sessionNames[k]
    row['taskName'] = taskNames[k]
    row['instrumentName'] = instrumentNames[k]
    row['status'] = statuses[k]
    dataTableSource[k] = row
  }
  console.log("---dataTableSource:--- ", dataTableSource)
  localStorage.setItem('dataTableSource', JSON.stringify(dataTableSource))
}
