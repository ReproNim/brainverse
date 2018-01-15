let form = new AlpacaForm('#div-newCollection')

function createCollection(){
  $('#btn-collection').remove()
  $('#div-collectionList').remove()
  form.inputForm('Name', 'Name', 'collectionName', 'string', undefined, null, false)
  form.textAreaForm('Description', 'Description', 'collectionDescription','string', undefined, null, false)
  form.submitBtnForm('Save Collection Information',submitAction)
  form.alpacaGen()
}

function submitAction(){
  console.log("New Collection Being Added Action performed")
  let collectionObj = {}
  collectionObj["ID"] = uuid()
  collectionObj["Name"] = $("#collectionName").val()
  collectionObj["Description"] = $("#collectionDescription").val()
  collectionObj["version"]= 0
  collectionObj["created"] = moment().format()
  //collectionObj["wasDerivedFrom"] = "activity_none"
  //collectionObj["CurrentObjID"] = uuid()
  console.log("[submitAction] collectionObj: ", collectionObj)
  localStorage.setItem("collectionObj", JSON.stringify(collectionObj))
  form.alpacaDestroy()
  let saveObj = {}
  //saveObj['objID'] = collectionObj["CurrentObjID"]
  saveObj['objID'] = uuid()
  saveObj['Project'] = collectionObj
  console.log("[dc-mgm.js]saveObj: ", saveObj)
  $.ajax({
    type: "POST",
    url: serverURL +"/acquisitions/new",
    contentType: "application/json",
    data: JSON.stringify(saveObj),
    success: function(data){
      console.log('[dc-mgm]success:', data, "  data['tid']: ",data['tid'])
      //saveObj['ObjID'] = data['tid']
      //localStorage.setItem("saveObj", JSON.stringify(saveObj))
      //console.log("[dc-mgm.js] saveObj: ", JSON.parse(localStorage.getItem('saveObj')))
    }
  })

  //window.location.href = serverURL+"/data-collection/html/dc-list.html"
  window.location.href = serverURL+"/data-collection/html/dc.html"
}


$('#btn-newCollection').click(createCollection)
$('#btn-back-mn').click(function(){
  window.location.href = serverURL+"/main"
})

function displayCollectionList(){
  return new Promise(function(resolve){
    $.ajax({
      type: "GET",
      url: serverURL +"/acquisitions/local/list",
      accept: "application/json",
      success: function(data){
        console.log('project collections list received :success', data)
        let iforms = data.list
        if(iforms.length == 0){
          console.log("no forms to display")
          resolve([])
        }else{
          resolve(iforms)
        }
      }
    })
  })
}

displayCollectionList().then(function(dcList){
  var values = dcList.map(function(dc){
    return new Promise(function(resolve){
      let url = serverURL+"/acquisitions/local/" + dc.ID
      $.ajax({
        type: "GET",
        url: url,
        accept: "application/json",
        success: function(data){
          console.log('project DC received :success', data)
          resolve(data)
        }//data
      })
    })
  })
  return Promise.all(values)
}).then(function(dcObjs){
  console.log("all project obj: ", dcObjs)
  loadCollectionInfo(dcObjs)
})

let collectionTableSource = new Array()
let collectionNames = []
let collectionIds = []
let collectionDescriptions = []
let collectionVersions = []
let collectionCreated =[]

function convert2CollectionTableSource(dcObjs){
  console.log("[dc-mgm: convert2AcqTableSource list] dcObjs", dcObjs)
  for (let i=0;i<dcObjs.length;i++){
    console.log("dcObjs[i].list[0]: ", dcObjs[i].list[0])
    let dcObj1 = dcObjs[i].list[0]
    collectionNames.push(dcObj1['Project']['Name'])
    collectionDescriptions.push(dcObj1['Project']['Description'])
    collectionIds.push(dcObj1['Project']['ID'])
    collectionVersions.push(dcObj1['Project']['version'])
    collectionCreated.push(dcObj1['Project']['created'])
  }
  for(let k=0;k<collectionNames.length;k++){
    let row = {}
    row['collectionName'] = collectionNames[k]
    row['collectionDescription'] = collectionDescriptions[k]
    row['collectionId'] = collectionIds[k]
    row['collectionVersion'] = collectionVersions[k]
    row['collectionCreated'] = collectionCreated[k]
    collectionTableSource[k] = row
  }
  console.log("[dc-mgm.js] --collectionTableSource--:",collectionTableSource )
}

function loadCollectionInfo(values){
  convert2CollectionTableSource(values)
  var source = {
    localData: collectionTableSource,
    dataType: "array",
    dataFields: [{
      name: 'collectionName',
      type:'string'
    },
    {
      name: 'collectionDescription',
      type:'string'
    },
      {
        name: 'collectionId',
        type: 'string'
    }, {
        name: 'collectionCreated',
        type: 'string'
    }, {
      name: 'collectionVersion',
      type: 'string'
    }]
  }

  var dataAdapter = new $.jqx.dataAdapter(source)

  $("#collectionTable").jqxDataTable({
      width: 1000,
      theme: 'energyblue',
      //pageable: true,
      //pagerMode: 'advanced',
      filterable: true,
      source: dataAdapter,
      columns: [{
        text: 'Collection Name',
        dataField: 'collectionName',
        width: 400
        },
        {
          text: 'Description',
          dataField: 'collectionDescription',
          width: 400
      }, {
          text: 'Created',
          dataField: 'collectionCreated',
          width: 200
      }]
  })

}
$('#collectionTable').on('rowClick', function (event) {
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

  let collectionObj = {}
  collectionObj["Name"] = row['collectionName']
  collectionObj["Description"] = row['collectionDescription']
  collectionObj["ID"] = row['collectionId']
  collectionObj["version"]= row['collectionVersion']
  collectionObj["created"] = row['collectionCreated']
  localStorage.setItem("collectionObj",JSON.stringify(collectionObj))
  //console.log("collectionObj after setItem: ", JSON.parse(localStorage.getItem("collectionObj")))
  window.location.href = serverURL+"/data-collection/html/dc-list.html"
})
