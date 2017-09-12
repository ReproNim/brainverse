let serverURL = "http://127.0.0.1:3000"
let newPlanObj = JSON.parse(localStorage.getItem("newPlanObj"))

var columnArray = []
var sessions = []
var resArray = []

console.log("newPlanObj: ", newPlanObj)

$('#planInfo').append('<h3>'+ newPlanObj['Name']+'</h3><hr>')
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
             // update collapsed header's status.
              collapsedElement.find(".jqx-kanban-column-header-status").html(" (" + columnItems +  ")");
          }
  kCO["width"] = '80%'
  $('#div-kanban').jqxKanban(kCO)
  $('#div-kanban').jqxKanban('removeItem', "0");
}
