let saveObj = {}
let selectedFields =[]
let source = {}
let resourcesSource = {}
/**
Field  for Data Fields for Item of Kanban Board
**/
var fields = [
                   { name: "id", type: "string" },
                   { name: "status", map: "state", type: "string" },
                   { name: "text", map: "label", type: "array" },
                   { name:"content", map: "content", type:"object"},
                   { name: "tags", type: "string" },
                   { name: "color", map: "hex", type: "string" },
                   { name: "resourceId", type: "number" }
          ]
/**
Get all project plans
**/
$.ajax({
  type: "GET",
  url: "http://localhost:3000/project-plans",
  accept: "application/json",
  success: function(data){
    console.log('acquistions forms:success', data)
    let tforms = data.list
    if(tforms.length == 0){
      console.log("no forms")
      $("#term-form").empty()
    }else{
      for (let i=0;i<tforms.length;i++){
          //console.log(tforms[i])
          if(tforms[i] != ".DS_Store"){
            $("#tforms").append('<option value="'+ tforms[i]+'">'+ tforms[i] +'</option>')
          }
      }
    }
  }
})

$("#tforms").change(function(){
  console.log("Plan Selected: ", $("#tforms").val())
  $("#kanban1").empty()
  $("#kanban1").remove()
  $("#kanban-space").empty()
  $("#kanban-space").append('<div id ="kanban1"></div>')
  getPlanJson($("#tforms").val())
  $("#kanban-form-display").append('<button id= "btn-kanbanSave" type="submit" class="btn btn-primary">Save</button>')
})

function getPlanJson(formName){
  //check if form is in local storage
  let planJson = JSON.parse(localStorage.getItem(formName))
  console.log("Form Selected:",planJson)

  let url = "http://localhost:3000/project-plans/" + formName

  // if the file is not in localstorage, read from the disk
  if(planJson == null){
    $.ajax({
      type: "GET",
      url: url,
      accept: "application/json",
      success: function(data){
        console.log('acquisitions term forms:success', data)
        planJson = data
        createSourceData(data)
      }//data
    })
  } else{
    createSourceData(planJson)
  }
}//end of getPlanJson function

var getIconClassName = function () {
  return "jqx-icon-plus-alt";
}

/**
Create Modal Block
**/
var addItemModal = function(data, resource){
  let modalHeader = '<div class="modal-header">\
    <button type="button" class="close" data-dismiss="modal">&times;</button>\
    <h4 class="modal-title">Edit Item</h4>\
  </div>'
  let modalBody = '<form>\
  <div class="form-group row">\
    <label for="item-modal" class="col-xs-4 col-form-label">Estimated Time</label>\
    <div class="col-xs-7">\
    <input class="form-control" type="text" placeholder="'+ data.content.est+'" id="modal-est-'+data.id+'">\
    </div>\
  </div>\
  </form>'
  let modalEx = '<div class="modal fade in" id="itemModal-'+data.id+'" role="dialog">\
    <div class="modal-dialog modal-sm">\
      <div class="modal-content">'
        + modalHeader + '\
        <div class="modal-body">'
        + modalBody +'\
        </div>\
        <div class="modal-footer">\
          <button type="button" class="btn btn-default" id="btn-update-modal-'+ data.id +'">Update</button>\
          <button type="button" class="btn btn-default" data-dismiss="modal" id="btn-close">Close</button>\
        </div>\
      </div>\
    </div>\
  </div>\
</div>'
return modalEx
}

function createSourceData(data){
  let plansArray = []
  let planObj = {}

 /* Create Resources Array for resourcesDataAdapter */
  let resObj = {}
  let resources = {}
  let resArray = []
  let personnelArray = data["Personnel"]
  let numOfSessions = data["Sessions"].length
  let numOfResources = personnelArray.length
  console.log("personneArray:", personnelArray)
  for(let j=0; j<=numOfResources; j++){
    if(j==0){
      resObj["id"] = 0
      resObj["name"] = "No name"
      //resObj["image"] = "/sp.jpg"
      resObj["common"] = true
      resources["No name"] = 0 //this resource id needs to change
    }else{
      resObj["id"] = j
      resObj["name"] = personnelArray[j-1]
      resObj["image"] = "/sp.jpg"
      resources[personnelArray[j-1]] = j
    }
    resArray.push(resObj)
    resObj = {}
  }
  console.log("resources created with resource id: ", resources)

  /*
   Creating data array for dataAdapter
  */
  for(let i = 0; i < numOfSessions; i++){
    let numOfInstruments = data["Sessions"][i]["Instruments"].length
    for(let j= 0; j < numOfInstruments; j++){
      let lar = []
      label = data["Sessions"][i]["Instruments"][j]["Instrument Type"]+": "+ data["Sessions"][i]["Instruments"][j]["Form Name"]
      est = " Estimated Time: "+ data["Sessions"][i]["Instruments"][j]["Estimated Time"]
      lar.push(label)
      lar.push(est)
      let tobj = {"est": data["Sessions"][i]["Instruments"][j]["Estimated Time"]}
      planObj["id"] = "S"+(i+1) + "I" + (j+1)
      planObj["state"] = "session"+ (i+1)
      planObj["label"] = lar
      planObj["content"] = tobj
      planObj["tags"] = "test"
      planObj["hex"] = "#5dc3f0"
      planObj["resourceId"] = resources[data["Sessions"][i]["Instruments"][j]["Assignee"]]
      //console.log("planObj: ", planObj)
      plansArray.push(planObj)
      planObj = {}
    }
  }

  /**
  Initializing the source for dataAdapter
  **/

  source = {
    localData: plansArray,
    dataType: "json",
    dataFields: fields
  }

  let dataAdapter = new $.jqx.dataAdapter(source)
  let resourcesSource = {
    localData:resArray,
    dataType: "array",
    dataFields: [
         { name: "id", type: "number" },
         { name: "name", type: "string" },
         { name: "image", type: "string" },
         { name: "common", type: "boolean" }
    ]
  }

  /*
  * create columns array
  */
  let columnArray = []
  let cObj={}
  for(let i = 0; i < numOfSessions; i++){
    cObj["text"] = "Session "+ (i+1) +": "+data["Sessions"][i]["Label"]
    cObj["dataField"] = "session"+ (i+1)
    cObj["iconClassName"] = getIconClassName()
    columnArray.push(cObj)
    cObj={}
  }

  /**
  Kanban board settings
  **/

  let kCO = {}
  kCO["template"] = "<div class='jqx-kanban-item' id=''>"
    + "<div class='jqx-kanban-item-color-status'></div>"
    + "<div style='display: none;' class='jqx-kanban-item-avatar'></div>"
    + "<div class='jqx-icon jqx-icon-close jqx-kanban-item-template-content jqx-kanban-template-icon'></div>"
    + "<div class='jqx-kanban-item-text'></div>"
    + "<div class='jqx-kanban-item-content'></div>"
    + "<div style='display: none;' class='jqx-kanban-item-footer'></div>"
    + "</div>"
  kCO["resources"] = new $.jqx.dataAdapter(resourcesSource)
  kCO["source"] = dataAdapter
  kCO["itemRenderer"] = function(item, data, resource){
    $(item).find(".jqx-kanban-item-color-status").html("<span style='line-height: 23px; margin-left: 5px;'>" + resource.name + "</span>");
    $(item).find(".jqx-kanban-item-text").css('background', item.color)
    $(item).find(".jqx-kanban-item-content").html("<button type='button' class='btn btn-default btn-sm' data-toggle='modal' data-target='#itemModal-"+data.id+"'>Edit</button>")
    $(item).find(".jqx-kanban-item-content").append(addItemModal(data,resource))
    console.log("item: ", item )
    $(document).on('shown.bs.modal','#itemModal-'+data.id,function(event) {
      console.log("Item modal clicked:")
      console.log("event:", event)
      //console.log("data: ", data)
      let estTime = $(this).find('#modal-est-'+data.id)
      estTime.focus()
    //})
      $(document).on('click','#btn-update-modal-'+data.id,function(){
        //item.on('click','#btn-update-modal',function(){
        console.log("update button clicked")
        let estTime = $('#modal-est-'+ data.id)
        estimateTime = estTime.val()
        let tObj = {"est": estimateTime}
        console.log("estimate = ",estimateTime)
        let newItem = "Estimated Time:" + estimateTime

        let newContent = {"id": data.id,
          "status": data.status,
          "text":newItem,
          "content":tObj,
          "tags":data.tag,
          "color":data.hex,
          "resourceId": data.resourceId
        }
        console.log("newContent: ", newContent, "id: ", data.id)
        $('#kanban1').jqxKanban('updateItem',data.id,newContent)
        $('body').removeClass('modal-open')
        $('.modal-backdrop').remove()
      })
    })


  }
  kCO["columns"]= columnArray
  kCO["columnRenderer"]= function (element, collapsedElement, column) {
                    var columnItems = $("#kanban1").jqxKanban('getColumnItems', column.dataField).length;
                    // update header's status.
                    element.find(".jqx-kanban-column-header-status").html(" (" + columnItems + ")");
                    // update collapsed header's status.
                    collapsedElement.find(".jqx-kanban-column-header-status").html(" (" + columnItems + ")");
                }
  kCO["width"] = '100%'
  kCO["height"] = '100%'
  $('#kanban1').jqxKanban(kCO)

}

$(document).on('itemAttrClicked', '#kanban1', function (event) {
  var args = event.args;
    console.log("Click to remove")
    if(args.attribute == "template") {
      $('#kanban1').jqxKanban('removeItem', args.item.id);
    }
    console.log('args.item.id: ', args.item.id)
    //$('#itemModal-'+args.item.id).modal('show')
    /*$(document).on('shown.bs.modal','#itemModal-'+args.item.id,function(event) {
      console.log("Item modal clicked:")
      console.log("event:", event)
      //console.log("data: ", data)
      let estTime = $(this).find('#modal-est-'+args.item.id)
      estTime.focus()*/

    /*let estTime = item.find('#modal-est-S1I2')
    estTime.focus()*/
  //})
})

var itemIndex = 0;
$(document).on('columnAttrClicked', '#kanban1', function (event) {
  var args = event.args;
  if (args.attribute == "button") {
    args.cancelToggle = true;
    if (!args.column.collapsed) {
      var colors = ['#f19b60', '#5dc3f0', '#6bbd49', '#732794']
      $('#kanban1').jqxKanban('addItem', { status: args.column.dataField, text: "<input placeholder='(No Title)' style='width: 96%; margin-top:2px; border-radius: 3px; border-color: #ddd; line-height:20px; height: 20px;' class='jqx-input' id='newItem" + itemIndex + "' value=''/>", tags: "new task", color: colors[Math.floor(Math.random() * 4)], resourceId: 3 });
      var input =  $("#newItem" + itemIndex);
      input.mousedown(function (event) {
      event.stopPropagation();
      });
      input.mouseup(function (event) {
        event.stopPropagation();
      });
      input.keydown(function (event) {
        if (event.keyCode == 13) {
          $("<span>" + $(event.target).val() + "</span>").insertBefore($(event.target));
          $(event.target).remove();
        }
      });
      input.focus();
      itemIndex++;
    }
  }
});

function getListOrder(id) {
     var list = document.getElementById(id).childNodes
     var listLength = list.length
     var i = 0
     var res = []
     console.log("ChildNodes: ",list)
     for(var i=0; i<listLength; i++){
          var chain = list.item(i).id
          var tableau = chain.split("_")
          var index = tableau[1]
          res.push(index)
     }
     var chain = res.toString()
     return chain;
}
