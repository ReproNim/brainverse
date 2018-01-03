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
  console.log("saveObj: ", saveObj)
  $.ajax({
    type: "POST",
    url: serverURL +"/acquisitions/new",
    contentType: "application/json",
    data: JSON.stringify(saveObj),
    success: function(data){
      console.log('[dc-mgm]success:', data, "  data['tid']: ",data['tid'])
      //saveObj['ObjID'] = data['tid']
      localStorage.setItem("saveObj", JSON.stringify(saveObj))
      console.log("saveObj: ", JSON.parse(localStorage.getItem('saveObj')))
    }
  })

  window.location.href = serverURL+"/data-collection/html/dc.html"
}


$('#btn-newCollection').click(createCollection)

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
  localStorage.setItem('array dcObjs', JSON.stringify(dcObjs))
  if(dcObjs.length !== 0){
    $('#div-collectionList').append('<table class="table table-striped" id="tab1"></table>')
    let instTable = document.getElementById("tab1")
    var header = instTable.createTHead()
    var rowH = header.insertRow(0)
    var cellH = rowH.insertCell(0)
    var cellD = rowH.insertCell(1)
    cellH.innerHTML = "<b>Project Data Collection Name</b>";
    cellD.innerHTML = "<b>Description</b>"
    for (let i=0;i<dcObjs.length;i++){
      let row = instTable.insertRow(i+1)
      console.log("dcObjs[i]: ", dcObjs[i].list[0])
      let dcObj1 = dcObjs[i].list[0]
      let cell0 = row.insertCell(0)
      let cell1 = row.insertCell(1)
      //console.log("dcObj: ", dcObj[i][0]["Name"])
      cell0.innerHTML = dcObj1["Project"]["Name"]
      cell1.innerHTML = dcObj1["Project"]["Description"]
      row.addEventListener("click",function(e){
        var target = e.target;
        if ( target.nodeName != 'TD' )
          return;
        var columns = target.parentNode.getElementsByTagName( 'td' );
        for ( var i = columns.length; i-- ; ){
          let dcNameObj = localStorage.getItem(columns[ i ].innerHTML)
          console.log("[dc-mgm] dcNameObj:", dcNameObj)
          if(dcNameObj != null){
            let dcNameObj1 = JSON.parse(dcNameObj)
            collectionObj["Name"] = dcNameObj1["Project"]["Name"]
            collectionObj["Description"] = dcNameObj1["Project"]["Description"]
            collectionObj["ID"] = dcNameObj1["Project"]["ID"]
            collectionObj["version"]= dcNameObj1["Project"]["version"]
            collectionObj["created"] = dcNameObj1["Project"]["created"]
            //collectionObj["wasDerivedFrom"] = dcNameObj1["Project"]["wasDerivedFrom"]
            //collectionObj["CurrentObjID"] = dcNameObj1["Project"]["CurrentObjID"]
            localStorage.setItem("collectionObj",JSON.stringify(collectionObj))
            localStorage.setItem("saveObj", JSON.stringify(dcNameObj1))
            console.log("[dc-mgm]collectionObj: ", collectionObj)
            console.log("[dc-mgm] saveobj: ", JSON.parse(localStorage.getItem('saveObj')))
            window.location.href = serverURL+"/data-collection/html/dc.html"
          }
        }
      })
      localStorage.setItem(dcObj1["Project"]["Name"], JSON.stringify(dcObj1))
    }
  }
})
