let serverURL = "http://127.0.0.1:3000"
let newPlanObj = JSON.parse(localStorage.getItem("newPlanObj"))

var columnArray = []
var sessions = []
var resArray = []

console.log("newPlanObj: ", newPlanObj)

$('#planInfo').append('<h4 id="pname">'+ newPlanObj['Name']+' <a data-toggle="modal" href="#updatePlanInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a></h4><hr>')
$('#planInfo').append(createModal('updatePlanInfoModal', 'Update Plan Info', 'Update'))
let expInfoForm = new AlpacaForm('#body-updatePlanInfoModal')
createPlanInfoForm(expInfoForm,"updatePlanInfoModal", newPlanObj["Name"],newPlanObj["Description"])

$(document).on('hidden.bs.modal','#updatePlanInfoModal', function(e){
  console.log("plan name",  $("#updatePlanInfoModal-name").val())
  console.log("desc: ", $("#planDescription").val())
  let name = $("#updatePlanInfoModal-name").val()
  let desc = $("#planDescription").val()
  if(name != ""){
    newPlanObj["Name"] = $("#updatePlanInfoModal-name").val()
  }
  if(desc!= ""){
    newPlanObj["Description"] = $("#planDescription").val()
  }
  localStorage.setItem("newPlanObj", JSON.stringify(newPlanObj))
  $('#pname').html(newPlanObj['Name']+' <a data-toggle="modal" href="#updatePlanInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a>')
})

$('#div-addColumn').append(addSessionColumn())
$(document).on('hidden.bs.modal','#newSessionModal', function(e){
  let sname = $('#sessionName').val()
  console.log("session name:", sname)
  addToColumnArray(sname)
  sessions.push({'Label': sname})
  console.log("ColumnArray:-->  ", columnArray)
  newPlanObj["Sessions"] = sessions
  console.log("newPlanObj:  ", newPlanObj)
  localStorage.setItem("newPlanObj", JSON.stringify(newPlanObj))
  $('#div-kanban').jqxKanban('destroy')
  $('#div-addColumn').empty()
  $('#div-addColumn').remove()
  $('#div-planBoard').append('<div class="col-md-4" id="div-addColumn"></div>')
  $('#div-addColumn').append(addSessionColumn())
  $('#div-planBoard').append('<div class="col-md-7" id="div-kanban"></div>')
  createKanbanBoard(sname,sname)
  $('#div-kanban').on('columnAttrClicked', function(event){
    var args = event.args;
    if (args.attribute == "button") {
      console.log("args.attribute:", args)
      args.cancelToggle = true;
    }
  })
})

function createKanbanBoard(name,label){
  let kCO = {}
  kCO["template"] = setTemplate()
  kCO["resources"] = new $.jqx.dataAdapter(setResources())
  kCO["source"] = new $.jqx.dataAdapter(setSources(name,label))
  kCO["itemRenderer"] = function(element, item, resource)
    {
      $(element).find(".jqx-kanban-item-color-status").html("<span style='line-height: 23px; margin-left: 5px; color:white;'>" + resource.name + "</span>");
    }
  kCO["columns"]= columnArray
  kCO["columnRenderer"] = function (element, collapsedElement, column) {
    var columnItems = $("#div-kanban").jqxKanban('getColumnItems', column.dataField).length;
    // update header's status.
    element.find(".jqx-kanban-column-header-status").html(" (" + columnItems + ")");
    element.find("div.jqx-window-collapse-button-background.jqx-kanban-column-header-custom-button").after('<div class="jqx-window-collapse-button-background jqx-kanban-column-header-custom-button"><a data-toggle="modal" href="#updateSessionModal"><div style="width: 100%; height: 100%; left:-30px; top:-15px" class="fa-edit-icon"></div></a></div>')
    $('#updateSessionModal').append(updateSessionColumn)
    console.log("element:-->",element)
    // update collapsed header's status.
    collapsedElement.find(".jqx-kanban-column-header-status").html(" (" + columnItems +  ")");
    collapsedElement.find("div.jqx-window-collapse-button-background.jqx-kanban-column-header-custom-button").after('<div class="jqx-window-collapse-button-background jqx-kanban-column-header-custom-button"><div style="width: 100%; height: 100%;top:-15px" class="fa-edit-icon"></div></div>')
    //$('.fa-edit-icon').not(':last').remove();
  }
  kCO["width"] = '80%'
  kCO["headerHeight"] = 50
  $('#div-kanban').jqxKanban(kCO)
  $('#div-kanban').jqxKanban('removeItem', "0");
}
