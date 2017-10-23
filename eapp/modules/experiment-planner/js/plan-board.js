let serverURL = "http://127.0.0.1:3000"
let newPlanObj = JSON.parse(localStorage.getItem("newPlanObj"))

var columnArray = []
var sessions = []
var resArray = []
var sessionColumnTitle=''
var personnelArray = []

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
  if(sname!==''){
    addToColumnArray(sname)
    sessions.push({'Label': sname})
    //console.log("ColumnArray:-->  ", columnArray)
    newPlanObj["Sessions"] = sessions
    console.log("newPlanObj:  ", newPlanObj)
    localStorage.setItem("newPlanObj", JSON.stringify(newPlanObj))
    $('#div-kanban').jqxKanban('destroy')
    $('#div-addColumn').empty()
    $('#div-addColumn').remove()
    $('#div-planBoard').append('<div class="col-md-4" id="div-addColumn"></div>')
    $('#div-addColumn').append(addSessionColumn())
    $('#div-planBoard').append('<div class="col-md-7" id="div-kanban"></div>')
    addToSourcelocalData(sname,"task0", "","","")
    console.log("PlansArray Adding 0th task::: ", plansArray)
    addToResourcelocalData("0","","")
    createKanbanBoard(sname,sname)
 }
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
    var columnItems = $("#div-kanban").jqxKanban('getColumnItems', column.dataField).length
    // update header's status.
    element.find(".jqx-kanban-column-header-status").html(" (" + columnItems + ")")
    //if($('div#test1.fa-edit-icon').length < 3){
      element.find("div.jqx-window-collapse-button-background.jqx-kanban-column-header-custom-button").after('<div class="jqx-window-collapse-button-background jqx-kanban-column-header-custom-button"><a data-toggle="modal" href="#updateSessionModal"><div id = "test1" style="width: 100%; height: 100%; left:-30px; top:-15px" class="fa-edit-icon"></div></a></div>')
      console.log("href attr: ",$('div.jqx-icon-plus-alt'))
    //}
    //$('div.jqx-icon-plus-alt').append('<a data-toggle="modal" href="#itemModal">test</a>')
    //if($('div.jqx-icon-plus-alt').length < 2){
      $('div.jqx-icon-plus-alt').attr("data-toggle","modal")
      $('div.jqx-icon-plus-alt').attr("data-target","#itemModal")
      console.log ("jqx-icon-plus-alt::: ",$('div.jqx-icon-plus-alt'))
    //}
  }
  kCO["width"] = '80%'
  //kCO["height"] = '100%'
  kCO["headerHeight"] = 50
  $('#div-kanban').jqxKanban(kCO)
  for(let i=0;i<plansArray.length; i++){
    if(plansArray[i].state == name && plansArray[i].id == "0" ){
      $('#div-kanban').jqxKanban('removeItem', "0");
      plansArray.splice(i,1)
      break;
    }
  }


}
$(document).on('columnAttrClicked', '#div-kanban', function (event) {
  event.preventDefault()
  var args = event.args;
  console.log("Argument: ",args)
  //console.log("Event: ", event)
  if(args.attribute == "title"){
      console.log("edit column header button clicked")
      sessionColumnTitle = args.column.dataField
      console.log("sessionColumnTitle", sessionColumnTitle)
      if($("#updateSessionModal").length){
        console.log("updating the session title placeholder")
        $("#updateSessionName").attr("placeholder",sessionColumnTitle)
      }else{
        console.log("No update session modal found..so adding one ...")
        $("#div-kanban").append(updateSessionColumnHeader(sessionColumnTitle))
      }
  }else{
    if (args.attribute == "button") {
      //args.cancelToggle = true;

      console.log("Add button clicked")
      console.log("showing add item modal")
      if($("#updateSessionModal").length){
        let itemForm = new AlpacaForm('#body-itemModal')
        createItemForm(itemForm,"itemModal")
      }else{
        $('#div-kanban').append(createModal('itemModal', 'Add Item', 'Add'))
        let itemForm = new AlpacaForm('#body-itemModal')
        createItemForm(itemForm,"itemModal")
      }
      console.log("Adding Item to Column: ", args.column.dataField)
      localStorage.setItem("addItemToColumn", args.column.dataField)
      $('#itemModal').modal('show')
    }
  }
})
$(document).on('show.bs.modal','#updateSessionModal', function(e){
  //e.preventDefault()
  console.log('update Modal shown')
  $('#updateSessionName').focus()
})
$(document).on('hidden.bs.modal','#updateSessionModal', function(e){
  e.preventDefault()
  let sname = $('#updateSessionName').val()
  console.log("updated session name:", sname)
  if(sname!==''){
    checkandUpdateColumnArray(sessionColumnTitle, sname)
    checkandUpdateSessionsArray(sessionColumnTitle, sname)
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
 }else{
    console.log("removing update SessionModal---")
    $('#updateSessionModal').remove()
 }
})
$(document).on('hidden.bs.modal','#itemModal', function(e){
  e.preventDefault()
  let taskName = $('#itemModal-task').val()
  let instrumentName = $('#itemModal-inst').val()
  let estimateTime = $('#itemModal-time').val()
  let userLogin = $('#itemModal-per').select2('data')[0]
  let personnelItem = {}
  personnelItem['user'] = userLogin.login
  personnelItem['uid'] = userLogin.id
  personnelItem['url'] = userLogin.url
  personnelItem['avatar_url'] = userLogin.avatar_url
  personnelArray.push(personnelItem)
  let columnName = localStorage.getItem("addItemToColumn")
  console.log("columnName To which Item needs to be added :  ", columnName)
  console.log("new item Value taskName: ", taskName, " instrumentName:", instrumentName, " estimateTime: ", estimateTime, "user: ", userLogin.login )
  addToResourcelocalData("id",userLogin.login,userLogin.avatar_url)
  addToSourcelocalData(columnName,taskName, instrumentName,estimateTime,userLogin.login)
  $('#body-itemModal').alpaca("destroy")
  $('#div-kanban').jqxKanban('destroy')
  $('#div-addColumn').empty()
  $('#div-addColumn').remove()
  $('#div-planBoard').append('<div class="col-md-4" id="div-addColumn"></div>')
  $('#div-addColumn').append(addSessionColumn())
  $('#div-planBoard').append('<div class="col-md-7" id="div-kanban"></div>')
  createKanbanBoard(columnName,columnName)
})
function checkandUpdateSessionsArray(oldSessionName, newSessionName){
  for(let i=0;i< sessions.length;i++){
    if(sessions[i].Label === oldSessionName){
      sessions[i].Label = newSessionName
      break;
    }
  }
}
