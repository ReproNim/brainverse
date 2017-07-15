let saveObj = {}
let selectedFields =[]
var source = {}
let resourcesSource = {}
//----
let plansArray = []
let columnArray = []
//---

/**
Field  for Data Fields for Item of Kanban Board
**/
var fields =  [
                { name: "id", type: "string" },
                { name: "status", map: "state", type: "string" },
                //{ name: "text", map: "label", type: "array" },
                { name: "text", map: "label", type: "string" },
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
    let pforms = data.list
    if(pforms.length == 0){
      console.log("no forms")
      $("#plan-form").empty()
    }else{
      for (let i=0;i<pforms.length;i++){
        if(pforms[i] != ".DS_Store"){
          $("#pforms").append('<option value="'+ pforms[i]+'">'+ pforms[i] +'</option>')
        }
      }
    }
  }
})

/**
On selection of a project plan, display the project plan in the kanban board space
**/
$("#pforms").change(function(){
  console.log("Plan Selected: ", $("#pforms").val())
  $("#kanban1").empty()
  $("#kanban1").remove()
  $("#kanban-space").empty()
  $("#kanban-space").append('<div id ="kanban1"></div>')
  getPlanJson($("#pforms").val())
  $("#kanban-form-display").append('<button id= "btn-kanbanSave" type="submit" class="btn btn-primary">Save</button>')
})

/**
* Get the contents of the plan selected
* convert plan's JSON data to kanban board data
**/
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
        //console.log('acquisitions term forms:success', data)
        planJson = data
        createSourceData(planJson)
      }//data
    })
  } else{
    createSourceData(planJson)
  }
}//end of getPlanJson function

/**
TODO : Look into different icon class
**/
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
  let modalEx = '<div class="modal fade in" id="itemModal-'+ data.id +'" role="dialog">\
    <div class="modal-dialog modal-sm">\
      <div class="modal-content">'
        + modalHeader + '\
        <div class="modal-body">'
        + modalBody +'\
        </div>\
        <div class="modal-footer">\
          <button type="button" class="btn btn-default" data-dismiss="modal" id="btn-save-modal-'+ data.id +'">Save</button>\
          <button type="button" class="btn btn-default" data-dismiss="modal" id="btn-close-'+ data.id +'">Cancel</button>\
        </div>\
      </div>\
    </div>\
  </div>\
</div>'
//console.log("Displaying modal HTML string:--- \n", modalEx)
return modalEx
}

/**
* Convert plan JSON data to Kaban board data
* Display on the Kanban board
**/
function createSourceData(data){
  /*let plansArray = []*/
  let planObj = {}

 /* Create Resources Array for resourcesDataAdapter */
  let resObj = {}
  let resources = {}
  let resArray = []
  let personnelArray = data["Personnel"]
  let numOfSessions = data["Sessions"].length
  let numOfResources = personnelArray.length
  console.log("personneArray:", personnelArray)

  for(let j = 0; j <= numOfResources; j++){
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
      //let lar = []
      label = data["Sessions"][i]["Instruments"][j]["Instrument Type"]+": "+ data["Sessions"][i]["Instruments"][j]["Form Name"]
      //est = " Estimated Time: "+ data["Sessions"][i]["Instruments"][j]["Estimated Time"]
      //lar.push(label)
      //lar.push(est)
      let tobj = {"est": data["Sessions"][i]["Instruments"][j]["Estimated Time"]}
      planObj["id"] = "S"+(i+1) + "I" + (j+1)
      planObj["state"] = "session"+ (i+1)
      //planObj["label"] = lar
      planObj["label"] = label
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

  //let dataAdapter = new $.jqx.dataAdapter(source)
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

  /**
  * create columns array
  **/
  //let columnArray = []
  let cObj={}
  for(let i = 0; i < numOfSessions; i++){
    cObj["text"] = "Session " + (i+1) + ": " + data["Sessions"][i]["Label"]
    cObj["dataField"] = "session"+ (i+1)
    cObj["iconClassName"] = getIconClassName()
    columnArray.push(cObj)
    cObj={}
  }
  /**
  * Caching source and resource data in localStorage
  * This is required due to limitation of jqWidgets kanban API:
    * not able to track information on the changes/updates made inside kanban board UI
    * when using with Bootstrap Modal to allow edit content of an item and update button in the modal is clicked, it calls jqWidgets Kanban updateItem method, updates the content, closes the modal but does not return control to parent page
      * tried using data-dismiss modal attribute for update button to close modal properly, did not workout
      * one has to programatically remove modal class from the body
    * When updateItem method is called inside itemRenderer for second time, the event propagates leading to the contents of the item updated to null.
      * tried using preventDefault and stopPropagation for the update event but it did not solve the problem.
      * tried updating the source data directly without updateItem method, but it didn't update the contents, it has to be done through jqWidgets API
      * posted question to the jqWidget forum asking about the required feature: http://www.jqwidgets.com/community/topic/jqxkanban-bug-with-updateitem-while-an-itemrenderer-function-is-set/#post-94592
  * TODO implement clean solution when jqWidget kanban API implements/fix these issues.
  **/
  localStorage.setItem("source",JSON.stringify(source))
  localStorage.setItem("resourceSource",JSON.stringify(resourcesSource))
  localStorage.setItem("columns",JSON.stringify(columnArray))
  localStorage.setItem("newItem",JSON.stringify({}))

  /**
  * Kanban board settings
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
  //kCO["resources"] = new $.jqx.dataAdapter(resourcesSource)
  //kCO["source"] = new $.jqx.dataAdapter(source)
  kCO["resources"] = new $.jqx.dataAdapter(JSON.parse(localStorage.getItem("resourceSource")))
  kCO["source"] = new $.jqx.dataAdapter(JSON.parse(localStorage.getItem("source")))

  kCO["itemRenderer"] = function(item, data, resource){
    $(item).find(".jqx-kanban-item-color-status").html("<span style='line-height: 23px; margin-left: 5px;'>" + resource.name + "</span>");
    $(item).find(".jqx-kanban-item-text").css('background', item.color)
    $(item).find(".jqx-kanban-item-content").html("<div><p>Estimated Time:"+ data.content.est +"</p></div>")
    $(item).find(".jqx-kanban-item-content").append("<button type='button' class='btn btn-default btn-sm' data-toggle='modal' data-target='#itemModal-"+data.id+"' id='edit-"+data.id+"'>Edit</button>")
    $(item).find(".jqx-kanban-item-content").append(addItemModal(data,resource))
    $(item).find(".jqx-kanban-item-content").append('<button type="button" class="btn btn-default btn-sm" id="btn-update">Update</button>')

    var newContent = {}
    $(document).on('shown.bs.modal','#itemModal-'+data.id,function(event) {
      console.log("Item modal selected: #itemModal-",data.id)
      //console.log("Button that triggered Modal: ", $(event.relatedTarget))
      var modal = $(this)
      let estTime = modal.find('#modal-est-'+data.id)
      estTime.focus()
      $('#btn-save-modal-'+ data.id).click(function(e){
        console.log("update button clicked for: ", data.id)
        let estTime1 = $('#modal-est-'+ data.id)
        //console.log("estTime1 html element: ", estTime1)
        estimateTime = estTime1.val()
        let tObj = {"est": estimateTime}
        console.log("estimate = ",estimateTime)
        newContent = {"id": data.id,
          "status": data.status,
          "text":data.text,
          "content":tObj,
          "tags":data.tag,
          "color":data.hex,
          "resourceId": data.resourceId
        }
        localStorage.setItem("newItem",JSON.stringify(newContent))
        source = JSON.parse(localStorage.getItem("source"))
        let ld = source.localData
        for(let i=0;i<ld.length;i++){
          if(ld[i].id == newContent.id){
            source.localData[i].content = newContent.content
          }
        }
        console.log("source: content", source)
        localStorage.setItem("source",JSON.stringify(source))
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
  //console.log("KCO: \n",kCO)
  $('#kanban1').jqxKanban(kCO)

} //create source data method end

$(document).on('click','#btn-update',function(e){
  //console.log("inside update call")
  let ni = JSON.parse(localStorage.getItem("newItem"))
  $('#kanban1').jqxKanban('updateItem',ni.id, ni)
})

/**
* Trying storage event, not working
**/
/*$(document).bind('storage', function (e) {
    console.log("binding storage:", e.originalEvent.newItem, e.originalEvent.newValue)
 });*/

$(document).on('itemAttrClicked', '#kanban1', function (event) {
  var args = event.args;
  //let source = $('#kanban1').jqxKanban('source')
  //console.log('source is : ', source)
  if(args.attribute == "template") {
  $('#kanban1').jqxKanban('removeItem', args.item.id)
  }
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
     //console.log("ChildNodes: ",list)
     for(var i=0; i<listLength; i++){
          var order = list.item(i).id
          var table = chain.split("_")
          var index = table[1]
          res.push(index)
     }
     var order = res.toString()
     return order;
}
