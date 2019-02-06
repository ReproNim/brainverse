let collectionObj = JSON.parse(localStorage.getItem("collectionObj"))
console.log("[dc-form-2] collectionObj: ", collectionObj)
let planObjSelected = JSON.parse(localStorage.getItem('planObjSelected'))
console.log("[dc-form-2] planObjSelected: ", planObjSelected)
let actionObj = JSON.parse(localStorage.getItem('action'))
console.log("[dc-form-2] actionObj: ", actionObj)

let prevSaveObj = JSON.parse(localStorage.getItem("saveObj"))
console.log("[dc-form-2] prevSaveObj: ", prevSaveObj)

dataTableSource = JSON.parse(localStorage.getItem('dataTableSource'))
console.log('[dc-form-2 start] dataTableSource: ',dataTableSource )

$('#projectId').append('<h5> Project Name: '+ collectionObj['Name'] +'</h5>')
$('#subjectId').append('<h5> Subject ID: '+ actionObj['subjectId'] +'</h5>')
$('#planId').append('<h5> Plan: '+ planObjSelected['Project Name'] +'</h5>')

loadPlan(planObjSelected)

$('#btn-back-pj').click(function(){
  window.location.href = serverURL+"/data-collection/html/dc-list.html"
})
$('#btn-back-mn').click(function(){
  window.location.href = serverURL+"/data-collection/html/dc-mgm.html"
})
function loadPlan(plan){
  var source = {
    localData: dataTableSource,
    dataType: "array",
    dataFields: [{
      name: 'sessionId',
      type:'string'
    },
      {
        name: 'sessionNumber',
        type: 'string'
    }, {
        name: 'sessionName',
        type: 'string'
    }, {
      name: 'taskId',
      type: 'string'
    },
    {
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
}

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
    row['subjectId'] = actionObj['subjectId']

    localStorage.setItem("action",JSON.stringify(row))
    window.location.href = serverURL+"/data-collection/html/dc-form.html"
  })
