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
            <button type="button" class="btn btn-default" data-dismiss="modal">Add</button>\
          </div>\
        </div>\
      </div>\
    </div>\
   </div>\
  </div>'
  return htmlStr
}
function updateSessionColumn(){
  let htmlStr = '\
        <div id="updateSessionModal" class="modal fade" role="dialog">\
        <div class="modal-dialog">\
        <!-- Modal content-->\
          <div class="modal-content">\
          <div class="modal-header">\
            <button type="button" class="close" data-dismiss="modal">&times;</button>\
            <h4 class="modal-title" style="text-align-last: center">Update Session</h4>\
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
            <button type="button" class="btn btn-default" data-dismiss="modal">Update</button>\
          </div>\
        </div>\
      </div>\
    </div>'
  return htmlStr
}
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
function createForm(form, modalID,name){
  form.inputForm('Name', 'Name', modalID-'name', 'string', undefined, name, false)
  form.alpacaGen()
}
function createPlanInfoForm(form, modalID, name, desc){
  form.inputForm('Name', 'Name', modalID+'-name', 'string', false, name, false)
  form.textAreaForm('Description', 'Description', 'planDescription','string', undefined, desc, false)
  //form.submitBtnForm('Update Plan',sAction)
  form.alpacaGen()
}
function sAction(){
  console.log("Action performed")
  planObj["Name"] = $("#planName").val()
  planObj["Description"] = $("#planDescription").val()
  console.log("planObj: ", planObj)
  localStorage.setItem("newPlanObj", JSON.stringify(planObj))
  form.alpacaDestroy()
  window.location.href = serverURL+"/html/plan-board.html"
}

var getIconClassName = function () {
  return "jqx-icon-plus-alt"
  //return "fa-edit-icon"
  }

function addToColumnArray(name){
  let cObj={}
    cObj["text"] = name
    cObj["dataField"] = name
    cObj["iconClassName"] = getIconClassName()
    columnArray.push(cObj)
}



/**
Field  for Data Fields for Item of Kanban Board
**/
function defItemFields(){
  var fields =  [
                  { name: "id", type: "string" },
                  { name: "status", map: "state", type: "string" },
                  { name: "text", map: "label", type: "string" },
                  //{ name:"content", map: "content", type:"object"},
                  { name: "tags", type: "string" },
                  { name: "color", map: "hex", type: "string" },
                  { name: "resourceId", type: "number" }
                ]
  return fields
}

function setSources(sname,slabel){
  var source = {
    localData: [{id: 0, state:sname, label:slabel, tags:"test", hex: "#5dc3f0", resourceId: 0},
               ],
    //dataType: "json",
    dataType: "array",
    dataFields: defItemFields()
  }
  console.log("sources: ", source)
  return source
}

function setResources(){
  let resourcesSource = {
    localData:[{ id: 0, name: "No name", image:"/sp.jpg", common: true},
    ],
    dataType: "array",
    dataFields: [
         { name: "id", type: "number" },
         { name: "name", type: "string" },
         { name: "image", type: "string" },
         { name: "common", type: "boolean" }
    ]
  }
  console.log("resourcesSource: ", resourcesSource)
  return resourcesSource
}

function setTemplate(){
  var template = "<div class='jqx-kanban-item' id=''>"
                + "<div class='jqx-kanban-item-color-status'></div>"
                + "<div style='display: none;' class='jqx-kanban-item-avatar'></div>"
                + "<div class='jqx-icon jqx-icon-close-white jqx-kanban-item-template-content jqx-kanban-template-icon'></div>"
                + "<div class='jqx-kanban-item-text'></div>"
                + "<div style='display: none;' class='jqx-kanban-item-footer'></div>"
        + "</div>"
    return template
}
