/** Global variables **/
var personnelArray = []
let resources = {}
var inv_resources = []
var resArray = []
var plansArray = []
var columnArray = []
var newPlanObj = {}
var projPlanObj = {}
/**
** Array that keep track of logging
**/
let logsArray = []
let prevState = {}

$.fn.select2.defaults.set( "theme", "bootstrap" )

function addToLogsArray(action){
  let pArray = plansArray.slice()
  let cArray = columnArray.slice()
  let rArray = resArray.slice()
  logsArray.push({'time': moment().format(), 'name':newPlanObj['Name'],'action':action,'plansArray': pArray, 'columnArray': cArray, 'resArray': rArray })
}

/*
* Modal to add a new Column/Session
*/
function addSessionColumn(){
  let htmlStr = '\
  <div class="add-column">\
    <div class="column-content">\
      <h5> <a href="#" data-toggle="modal" data-target="#newSessionModal">+ Add Session</a></h5>\
      <div id="newSessionModal" class="modal fade" role="dialog">\
        <div class="modal-dialog">\
        <!-- Modal content-->\
          <div class="modal-content">\
          <div class="modal-header">\
            <button type="button" class="close" data-dismiss="modal">&times;</button>\
            <h4 class="modal-title" style="text-align-last: center">Add a Session</h4>\
          </div>\
          <div class="modal-body">\
            <form>\
              <div class="form-group">\
                <label for="sessionName">Session Name</label>\
                <input type="text" class="form-control" id="sessionName" placeholder="Session Name">\
              </div>\
            </form>\
          </div>\
          <div class="modal-footer" style="text-align:center">\
            <div id="alert-msg"></div>\
            <button id="btn-add-session" type="button" class="btn btn-default" data-dismiss="modal" disabled>Add</button>\
          </div>\
        </div>\
      </div>\
    </div>\
   </div>\
  </div>'
  return htmlStr
}

/*
* Modal to Update Column/Session Name
*/
function updateSessionColumnHeader(sessionColumnTitle){
  let htmlStr = '\
        <div id="updateSessionModal" class="modal fade" role="dialog">\
        <div class="modal-dialog">\
        <!-- Modal content-->\
          <div class="modal-content">\
          <div class="modal-header">\
            <button type="button" class="close" data-dismiss="modal">&times;</button>\
            <h4 class="modal-title" style="text-align-last: center">Edit</h4>\
          </div>\
          <div class="modal-body">\
            <form>\
              <div class="form-group">\
                <label for="updateSessionName">Session Name</label>\
                <input type="text" class="form-control" id="updateSessionName" placeholder="'+sessionColumnTitle+'">\
              </div>\
            </form>\
          </div>\
          <div class="modal-footer">\
            <button id="btn-update-column" type="button" class="btn btn-success" data-dismiss="modal">Update Session</button>\
            <button id="btn-delete-column" type="button" class="btn btn-danger" >Delete</button>\
          </div>\
        </div>\
      </div>\
    </div>'
  return htmlStr
}

/*
* A generic modal where Modal body is an new alpaca form
*/
function createModal(modalID, title,modalFooter){
  let htmlStr = '\
        <div id="'+modalID+'" class="modal fade" role="dialog">\
        <div class="modal-dialog">\
        <!-- Modal content-->\
          <div class="modal-content">\
          <div class="modal-header">\
            <button type="button" class="close" data-dismiss="modal">&times;</button>\
            <h4 class="modal-title" style="text-align-last: center">'+title+'</h4>\
          </div>\
          <div class="modal-body"><div id=body-'+modalID+'></div></div>\
          <div class="modal-footer" style="text-align:center">\
            <button type="button" class="btn btn-default" data-dismiss="modal" id="btn-close-'+ modalID+'">'+modalFooter+'</button>\
          </div>\
        </div>\
      </div>\
    </div>'
  return htmlStr
}
/*
* Alpaca form with Name field only
*/
function createForm(form, modalID,name){
  form.inputForm('Name', 'Name', modalID-'name', 'string', undefined, name, false)
  form.alpacaGen()
}
/*
* Alpaca form for Plan Information
*/
function createPlanInfoForm(form, modalID, name, desc){
  form.inputForm('Name', 'Name', modalID+'-name', 'string', false, name, false)
  form.textAreaForm('Description', 'Description', 'planDescription','string', undefined, desc, false)
  //form.submitBtnForm('Update Plan',sAction)
  form.alpacaGen()
}

/*
* AlpacaForm for Item Add
*/
function createItemForm(form,modalID){
  /* Fields for an item card
  * Task Name
  * Task Description
  * select NDA Form to be used
  * Assignee
  * estimate Time
  */
  getNDAFormNames().then(function(ndaFormsList){
    let nTitle=[]
    let nFileName=[]
    console.log("NDAFormsList",ndaFormsList )
    let htmlStr = ""
    if(ndaFormsList.length !== 0){
      for(let i=0;i<ndaFormsList.length;i++){
        nTitle.push(ndaFormsList[i].title)
        nFileName.push(ndaFormsList[i].filename.split(".")[0])
        htmlStr = htmlStr + '<option value="'+ ndaFormsList[i].filename+'">'+ ndaFormsList[i].title +'</option>"'
      }
    }
    form.inputForm('Task Name', 'Task Name', modalID+'-task', 'string', false,"Type Task name", false)
    form.textAreaForm('Description', 'Description', modalID+"-desc",'string', undefined, "Description here", false)
    form.selectFormGeneral('Instruments','Instruments',[],[],modalID+'-inst',false,false)
    form.inputForm('Time Estimate', 'Time Estimate', modalID+'-time', 'string', false, "Time estimate for the task", false)
    //form.selectFormGeneral('Assignee','Assignee',[],[],modalID+'-per',false,false)
    //form.inputFormTypeAhead('Assignee','Assignee',modalID+'-per')

    form.baseForm["postRender"] = function(control){
      console.log("...Inside postRender ... ")
      console.log("control ... :",control.childrenByPropertyId["assignee"])
      var propInst = control.childrenByPropertyId["instruments"]
      //var propAssignee = control.childrenByPropertyId["assignee"]
      control.getFieldEl().append('<div><p><h5><b>Assignee</b></h5></p><select id = "'+ modalID+'-per"></select></div>')
      console.log("control ... :",propInst.id)

      $('#'+modalID+'-inst').select2({width:'100%'})
      propInst.schema.enum = nFileName
      //propInst.schema.enum =  nTitle
      propInst.options.optionLabels =  nTitle
      propInst.refresh()
      $('#'+modalID+'-per').select2({
        width:'100%',
        ajax: {
          url: "https://api.github.com/search/users",
          dataType: 'json',
          delay: 250,
          data: function (params) {
            return {
              q: params.term, // search term
              page: params.page
            };
          },
          processResults: function (data, params) {
            params.page = params.page || 1;

            return {
              results: data.items,
              pagination: {
                more: (params.page * 30) < data.total_count
              }
            };
          },
          cache: true
        },
        escapeMarkup: function (markup) {return markup}, // let our custom formatter work
        minimumInputLength: 3,
        templateResult: formatRepo,
        templateSelection: formatRepoSelection,
      })
    }
    form.alpacaGen()
  })
}

/*
* Alpaca Form for Item Edit Item
*/
function editItemForm(form,modalID, task,content,resourceId){
  /* Fields for an item card
  * Task Name
  * Task Description
  * select NDA Form to be used
  * Assignee
  * estimate Time
  */
  getNDAFormNames().then(function(ndaFormsList){
    let nTitle=[]
    let nFileName=[]
    console.log("NDAFormsList",ndaFormsList )
    let htmlStr = ""
    if(ndaFormsList.length !== 0){
      for(let i=0;i<ndaFormsList.length;i++){
        nTitle.push(ndaFormsList[i].title)
        nFileName.push(ndaFormsList[i].filename.split(".")[0])
        htmlStr = htmlStr + '<option value="'+ ndaFormsList[i].filename+'">'+ ndaFormsList[i].title +'</option>"'
      }
    }
    form.inputForm('Task Name', 'Task Name', modalID+'-task', 'string', false,task, false)
    form.textAreaForm('Description', 'Description', modalID+"-desc",'string', undefined, content.desc, false)
    form.selectFormGeneral('Instruments','Instruments',[],[],modalID+'-inst',false,false)
    form.inputForm('Time Estimate', 'Time Estimate', modalID+'-time', 'string', false, content.estimateTime, false)
    //form.inputForm('Assignee','Assignee' , modalID+'-per', 'string', false,inv_resources[resourceId], false)

    form.baseForm["postRender"] = function(control){
      console.log("...Inside postRender ... ")
      console.log("control ... :",control.childrenByPropertyId["assignee"])
      var propInst = control.childrenByPropertyId["instruments"]
      //var propAssignee = control.childrenByPropertyId["assignee"]
      control.getFieldEl().append('<div><p><h5><b>Assignee</b></h5></p><select id = "'+ modalID+'-per"></select></div>')
      //control.getFieldEl().append('<div><p><h5><b>Assignee</b></h5></p><select id = "'+ modalID+'-per"><option>'+inv_resources[resourceId]+'</option></select></div>')
      console.log("control ... :",propInst.id)

      $('#'+modalID+'-inst').select2({width:'100%'})
      //propInst.schema.default = content.instrumentName
      propInst.schema.enum = nFileName
      //propInst.schema.enum =  nTitle
      propInst.options.optionLabels =  nTitle
      propInst.refresh()
      console.log("selected user: ",inv_resources[resourceId] )
      $('#itemEditModal-inst').val(content.instrumentName)
      console.log("assignee::::",control.getFieldEl())
        $('#'+modalID+'-per').select2({
          width:'100%',
          ajax: {
            url: "https://api.github.com/search/users",
            dataType: 'json',
            delay: 250,
            data: function (params) {
              return {
                q: params.term, // search term
                page: params.page
              };
            },
            processResults: function (data, params) {
              params.page = params.page || 1;

              return {
                results: data.items,
                pagination: {
                  more: (params.page * 30) < data.total_count
                }
              };
            },
            cache: true
          },
          escapeMarkup: function (markup) {return markup}, // let our custom formatter work
          minimumInputLength: 3,
          templateResult: formatRepo,
          templateSelection: formatRepoSelection,
        })
    }
    form.alpacaGen()
  })
}




function formatRepo (user) {
  if (user.loading) return user.login;
    var markup = "<div class='select2-result-repository clearfix'>" +
    "<div class='select2-result-repository__avatar'><img src='" + user.avatar_url + "' /></div>" +
    "<div class='select2-result-repository__meta'>" +
    "<div class='select2-result-repository__title'>" + user.login + "</div>"+
    "<div class='select2-result-repository__url'>" + user.url + "</div>"+
    "</div></div>"
    return markup;
}

function formatRepoSelection (user) {
  //console.log("user:", user)
  return user.login;
}
function getNDAFormNames(){
  return new Promise(function(resolve){
    $.ajax({
    type: "GET",
    url: serverURL+"/acquisitions/nda_forms",
    accept: "application/json",
    success: function(data){
      console.log('acquistions forms:success', data)
      //let dE = JSON.parse(data)
      resolve(data.list)
    }
  })
})
}

/**
This is duplicate to sAction in plan-mgm.js
**/
function sAction(){
  console.log("Action performed")
  planObj = {}
  planObj["Name"] = $("#planName").val()
  planObj["Description"] = $("#planDescription").val()
  console.log("planObj: ", planObj)
  localStorage.setItem("newPlanObj", JSON.stringify(planObj))
  form.alpacaDestroy()
  window.location.href = serverURL+"/experiment-planner/html/plan-board.html"
}

/**
************ Kanban Board Methods ************
**/
var getIconClassName = function () {
  return "jqx-icon-plus-alt"
  //return "fa-edit-icon"
  }

function addToColumnArray(name){
  let cObj={}
  cObj["text"] = name
  cObj["dataField"] = name
  cObj["iconClassName"] = getIconClassName()
  cObj["collapsible"] = false
  columnArray.push(cObj)
  console.log("[addToColumnArray] Current ColumnArray:", columnArray)
}

function deleteItemFromPlanArray(itemId){
  for(let i=plansArray.length-1;i>=0;i--){
    if(plansArray[i].id === itemId){
      plansArray.splice(i,1)
      break;
    }
  }
  console.log('[deleteItemFromPlanArray] plansArray: ',plansArray)
}

/**
Field  for Data Fields for Item of Kanban Board
**/
function defItemFields(){
  var fields =  [
                  { name: "id", type: "string" },
                  { name: "status", map: "state", type: "string" },
                  { name: "text", map: "label", type: "string" },
                  { name:"content", map: "content", type:"object"},
                  { name: "tags", type: "string" },
                  { name: "color", map: "hex", type: "string" },
                  { name: "resourceId", type: "number" }
                ]
  return fields
}

function setSources(sname,slabel){
  var source = {
    localData: plansArray,
    dataType: "json",
    dataFields: defItemFields()
  }
  return source
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function addToSourcelocalData(state,taskName, instrumentName,estimateTime,user,desc){
  let planObj = {}
  let label = taskName
  let tobj = {"desc":desc,"instrumentName":instrumentName,"estimateTime": estimateTime}
  planObj["id"] = getRandomIntInclusive(1, 100).toString()
  planObj["state"] = state
  planObj["label"] = label
  planObj["content"] = tobj
  planObj["tags"] = "test"
  planObj["hex"] = "#5dc3f0"
  if(taskName === "task0" && user===""){
    planObj["id"] = "0"
    planObj["resourceId"] = 0
  } else{
    planObj["resourceId"] = resources[user]
  }
  plansArray.push(planObj)
  console.log("[addToSourcelocalData]PlansArray::: ", plansArray)
}

function updateSourcelocalData(state,id,taskName, instrumentName,estimateTime,user,desc){
  let tobj = {"desc":desc,"instrumentName":instrumentName,"estimateTime": estimateTime}
  for(let i=0;i<plansArray.length;i++){
    if(plansArray[i].id === id){
      plansArray[i].label = taskName
      plansArray[i].content = tobj
      plansArray[i].resourceId = resources[user]
      console.log("item updated: ", plansArray)
      break;
    }
  }
}

/*** Set Resources for Data in Kanban ***/

function setResources(){
  let resourcesSource = {
    localData: resArray,
    /*[{ id: 0, name: "No name", image:"/experiment-planner/img/sp.jpg", common: true},
  ],*/
    dataType: "array",
    dataFields: [
         { name: "id", type: "number" },
         { name: "name", type: "string" },
         { name: "image", type: "string" },
         { name: "common", type: "boolean" }
    ]
  }
  return resourcesSource
}

function addToResourcelocalData(id,userName,aUrl){
  let resObj = {}
  let flag = false
  if(id === 0){
    resObj["id"] = 0
  }else{
    //resObj["id"] = personnelArray.length
    resObj["id"] = resArray.length
  }
  resObj["name"] = userName
  resObj["image"] = aUrl

  for(let i=0;i<resArray.length;i++){
    if(resArray[i].name === userName){
      flag = true
      break;
    }
  }
  if(!flag){
    resArray.push(resObj)
    resources[userName] = resObj["id"]
    inv_resources[resObj["id"]] = userName
  }
  console.log("[addToResourcelocalData] resArray:", resArray)
  console.log("[addToResourcelocalData] inv_resources: ", inv_resources)
}

/*
* Delete all Item cards from plansArray corresponding to a column in columnArray
*/
function updatePlansArray(columnTitle){
  for(let i=plansArray.length-1;i>=0;i--){
    if(plansArray[i].state === columnTitle){
      plansArray.splice(i,1)
    }
  }
}
/*
* Delete a Column from columnArray
*/
function updateColumnArray(columnTitle){
  for(let i=columnArray.length-1;i>=0;i--){
    if(columnArray[i].dataField === columnTitle){
      columnArray.splice(i,1)
    }
  }
}
/*
* Update a Column's name with a new value
*/
function checkAndUpdateColumnArray(olddataField, newdataField){
  for(let i=0;i<columnArray.length;i++){
    if(columnArray[i].dataField === olddataField){
      columnArray[i].dataField = newdataField
      columnArray[i].text = newdataField
      break;
    }
  }
}

/*
* Update all item cards state (status) when the column name changes
*/
function checkAndUpdatePlanArray(oldColumnTitle, newColumnTitle){
  for(let i=0;i<plansArray.length;i++){
    if(plansArray[i].state === oldColumnTitle){
      plansArray[i].state = newColumnTitle
    }
  }
}

/*
* check if a column exists
*/
function existInColumnArray(sname){
  let flag = false
  for(let i=0;i<columnArray.length;i++){
    if(columnArray[i].dataField === sname){
      flag = true
      break
    }
  }
  return flag
}

/*
* Setting Template for Item
*/
function setTemplate(){
  var template = "<div class='jqx-kanban-item' id=''>"
                + "<div class='jqx-kanban-item-color-status'></div>"
                + "<div style='display: none;' class='jqx-kanban-item-avatar'></div>"
                + "<div class='jqx-icon jqx-icon-close-white jqx-kanban-item-template-content jqx-kanban-template-icon'></div>"
                + "<div class='jqx-kanban-item-text'></div>"
                + "<div class='jqx-kanban-item-content'><span class='pull-xs-right'><a data-toggle='modal' href='#itemEditModal'><i class='fa fa-pencil-square-o-icon show-on-hover'></i></a></span></div>"
                + "<div style='display: none;' class='jqx-kanban-item-footer'></div>"
                + "</div>"
    return template
}

/**
** Convert All Item cards of a Column to Tasks Array of a Session
**/
function getAllTasks(columnName){
  let tasksArray = []
  let task = {}
  for(let i = 0; i < plansArray.length;i++){
    task = {}
    if(plansArray[i].state === columnName){
      task['Task Name'] = plansArray[i].label
      task['Description'] = plansArray[i].content.desc
      task['EstimateTime'] = plansArray[i].content.estimateTime
      task['InstrumentName'] = plansArray[i].content.instrumentName
      task['Assignee'] = inv_resources[plansArray[i].resourceId]
      tasksArray.push(task)
    }
  }
  console.log("[getAllTasks] plansArray : ", plansArray)
  console.log("[getAllTasks] tasksArray : ", tasksArray)
  return tasksArray
}

/**
* Saving new project plan information
* Converting Kanban Objects to the format for rdf serilialization
**/
function savePlanInfo(){
  let sessions = []
  let session = {}
  projPlanObj = {}

  newPlanObj = JSON.parse(localStorage.getItem("newPlanObj"))
  console.log("[savePlanInfo] newPlanObj:~~~>",newPlanObj)

  projPlanObj["Project Name"] = newPlanObj["Name"]
  projPlanObj["Description"] = newPlanObj["Description"]
  projPlanObj["Number Of Sessions"] = columnArray.length
  let numOfSessions = columnArray.length

  for(let j=0; j<numOfSessions; j++){
    session = {}
    session['Session Number'] = j+1
    session['Session Name'] = columnArray[j].dataField
    console.log("columnName: ",columnArray[j].dataField)
    let tasks = getAllTasks(columnArray[j].dataField)
    session['Instruments'] = tasks
    sessions.push(session)
  }
  projPlanObj["Personnel"] = personnelArray
  projPlanObj["Sessions"] = sessions
  projPlanObj["created"] = moment().format()
  projPlanObj["wasDerivedFrom"] = "None"
  projPlanObj["version"] = 0
  console.log("[savePlanInfo] projPlanObj being submitted: ~~~~>", projPlanObj)
  return new Promise(function(resolve){
      $.ajax({
        type: "POST",
        url: serverURL+"/project-plans/new",
        contentType: "application/json",
        data: JSON.stringify(projPlanObj),
        success: function(data){
          //console.log('success: response:', data)
          projPlanObj['ProjectPlanID'] = data.pid
          console.log("[savePlanInfo] success: projPlanObj: ----->", projPlanObj)
          localStorage.setItem("newPlanObj", JSON.stringify(projPlanObj))
          localStorage.setItem("projectPlanObj",JSON.stringify(projPlanObj))
          resolve()
        }
      })
  })
}

/**
** Updating and Saving the updated plan info into the format for rdf serialization
**/
function updatePlanInfo(){
  let sessions = []
  let session = {}
  projPlanObj = {}
  projPlanObj["ProjectPlanID"] = newPlanObj["ProjectPlanID"]
  if(newPlanObj["Name"] !== undefined){
    projPlanObj["Project Name"] = newPlanObj["Name"]
  } else{
    projPlanObj["Project Name"] = newPlanObj["Project Name"]
  }
  projPlanObj["Description"] = newPlanObj["Description"]
  projPlanObj["Number Of Sessions"] = columnArray.length
  let numOfSessions = columnArray.length

  for(let j=0; j<numOfSessions; j++){
    session = {}
    session['Session Number'] = j+1
    session['Session Name'] = columnArray[j].dataField
    let tasks = getAllTasks(columnArray[j].dataField)
    session['Instruments'] = tasks
    sessions.push(session)
  }
  projPlanObj["Personnel"] = personnelArray
  projPlanObj["Sessions"] = sessions
  projPlanObj["created"] = moment().format()
  projPlanObj["wasDerivedFrom"] = newPlanObj["ProjectPlanID"]
  projPlanObj["version"] = newPlanObj["version"]
  console.log("projPlanObj being updated: ~~~~", projPlanObj)
  localStorage.setItem("newPlanObj", JSON.stringify(projPlanObj))
  localStorage.setItem("projectPlanObj",JSON.stringify(projPlanObj))
}

/**
** Submit the Plan
**/
function submitPlan(){
  return new Promise(function(resolve){
    newPlanObj = JSON.parse(localStorage.getItem("newPlanObj"))
      $.ajax({
        type: "PUT",
        url: serverURL+"/project-plans/"+ newPlanObj["ProjectPlanID"],
        contentType: "application/json",
        data: JSON.stringify(projPlanObj),
        success: function(data){
          console.log('success: response:', data)
          newPlanObj = JSON.parse(localStorage.getItem("newPlanObj"))
          newPlanObj['ProjectPlanID'] = data.pid
          newPlanObj['version'] = newPlanObj["version"] + 1
          //console.log("[submitPlan Success]updating projPlanObj: ----->", projPlanObj)
          console.log("[submitPlan Success]updating newPlanObj: ----->", newPlanObj)
          //localStorage.setItem("newPlanObj", JSON.stringify(projPlanObj))
          localStorage.setItem("newPlanObj", JSON.stringify(newPlanObj))
          resolve()

        }
      })
  })
}

/**
** Convert Project Plan Obj to Kanban object format
**/
function projPlanObj2KanbanObj(){
  newPlanObj["Name"] = projPlanObj["Project Name"]
  newPlanObj["Description"] = projPlanObj["Description"]
  newPlanObj["ProjectPlanID"] = projPlanObj["ProjectPlanID"]
  newPlanObj["version"] = projPlanObj["version"]
  if(projPlanObj["Number Of Sessions"] !== 0){
    personnelArray = projPlanObj["Personnel"].slice()
    personnel2ResArray()
    let sessions = projPlanObj["Sessions"]
    for(i=0;i<sessions.length;i++){
      addToColumnArray(sessions[i]["Session Name"])
      let instruments = sessions[i]["Instruments"]
      for(j=0;j<instruments.length;j++){
        addToSourcelocalData(sessions[i]["Session Name"],instruments[j]["Task Name"], instruments[j]["InstrumentName"],instruments[j]["EstimateTime"],instruments[j]["Assignee"],instruments[j]["Description"])
      }
    }
  }
  localStorage.setItem('newPlanObj',JSON.stringify(newPlanObj))
}

function personnel2ResArray(){
  for(let i = 0; i< personnelArray.length;i++){
    addToResourcelocalData("id",personnelArray[i].user,personnelArray[i].avatar_url)
  }
}
