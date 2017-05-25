let saveObj = {}
let selectedFields =[]
let source = {}
$('[data-toggle="tooltip"]').tooltip()
var fields = [
                   { name: "id", type: "string" },
                   { name: "status", map: "state", type: "string" },
                   { name: "text", map: "label", type: "string" },
                   { name: "content", map: "label", type: "string" },
                   { name: "tags", type: "string" },
                   { name: "color", map: "hex", type: "string" },
                   { name: "resourceId", type: "number" }
          ];

$.ajax({
  type: "GET",
  url: "http://localhost:3000/project-plans",
  accept: "application/json",
  success: function(data){
    console.log('acquistions forms:success', data)
    //let dE = JSON.parse(data)
    let tforms = data.list
    if(tforms.length == 0){
      console.log("no forms")
      $("#term-form").empty()
    }else{
      for (let i=0;i<tforms.length;i++){
          console.log(tforms[i])
          if(tforms[i] != ".DS_Store"){
            $("#tforms").append('<option value="'+ tforms[i]+'">'+ tforms[i] +'</option>')
          }
      }
    }
  }
})

$("#tforms").change(function(){
  console.log($("#tforms").val())
  $("#kanban").empty()
  $("#kanban").remove()
  $("#kanban-space").empty()
  $("#kanban-space").append('<div id ="kanban"></div>')
  getPlanJson($("#tforms").val())

})

function getPlanJson(formName){
  //check if form is in local storage
  let termform = JSON.parse(localStorage.getItem(formName))
  console.log("Form Selected:",termform)

  let url = "http://localhost:3000/project-plans/" + formName

  // if the file is not in localstorage, read from the disk
  if(termform == null){

    $.ajax({
      type: "GET",
      url: url,
      accept: "application/json",
      success: function(data){
        console.log('acquistions term forms:success', data)
        termform = data
        //add_term_to_form(termform)
        createSourceData(data)



      }//data
    })

  } else{
    createSourceData(terform)
  }

}//end of addAqFields function

function createSourceData(data){
  let plansArray = []
  let planObj = {}

  let numOfSessions = data["Sessions"].length


  let resourceId=1


  for(let i = 0; i < numOfSessions; i++){
    let numOfInstruments = data["Sessions"][i]["Instruments"].length
    for(let j= 0; j < numOfInstruments; j++){
      planObj["id"] = "S"+(i+1) + "I" + (j+1)
      planObj["state"] = "session"+ (i+1)

      label = data["Sessions"][i]["Instruments"][j]["Instrument Type"]+": "+ data["Sessions"][i]["Instruments"][j]["Form Name"]
      planObj["label"] = label
      planObj["tags"] = "test"
      planObj["hex"] = "#5dc3f0"
      planObj["resourceId"] = resourceId
      console.log("planObj: ", planObj)
      plansArray.push(planObj)
      planObj = {}
      resourceId++
    }
  }

  source = {
    localData: plansArray,
    dataType: "array",
    dataFields: fields
  }

  let dataAdapter = new $.jqx.dataAdapter(source)
  //var resourcesAdapterFunc = function () {
              var resourcesSource =
              {
                  localData: [
                        { id: 0, name: "No name", common: true },
                        { id: 1, name: "Smruti",image: "/sp.jpg"},
                        { id: 2, name: "Smruti",image: "/sp.jpg"},
                        { id: 3, name: "Dorota",image: "/sp.jpg" },
                        { id: 4, name: "Dorota",image: "/sp.jpg"},
                        { id: 5, name: "Smruti",image: "/sp.jpg"},
                        { id: 6, name: "Smruti",image: "/sp.jpg"},
                        { id: 7, name: "Smruti",image: "/sp.jpg"},
                        { id: 8, name: "Smruti",image: "/sp.jpg"}

                  ],
                  dataType: "array",
                  dataFields: [
                       { name: "id", type: "number" },
                       { name: "name", type: "string" },
                       { name: "image", type: "string" },
                       { name: "common", type: "boolean" }
                  ]
              };
              //var resourcesDataAdapter = new $.jqx.dataAdapter(resourcesSource);
              //return resourcesDataAdapter;
          //}


  let kCO = {}
  let columnArray = []
  kCO["template"] = "<div class='jqx-kanban-item' id=''>"
                + "<div class='jqx-kanban-item-color-status'></div>"
                + "<div style='display: none;' class='jqx-kanban-item-avatar'></div>"
                + "<div class='jqx-icon jqx-icon-close-white jqx-kanban-item-template-content jqx-kanban-template-icon'></div>"
                + "<div class='jqx-kanban-item-text'></div>"
                + "<div style='display: none;' class='jqx-kanban-item-footer'></div>"
        + "</div>"
  kCO["source"] = dataAdapter
  kCO["resources"] = new $.jqx.dataAdapter(resourcesSource)
  let cObj={}

  for(let i = 0; i < numOfSessions; i++){
    cObj["text"] = "Session "+ (i+1) +": "+data["Sessions"][i]["Label"]
    cObj["dataField"] = "session"+ (i+1)
    console.log("cObj:", cObj)
    columnArray.push(cObj)
    cObj={}
  }
  kCO["itemRenderer"] = function(element, item, resource)
        {
            $(element).find(".jqx-kanban-item-color-status").html("<span style='line-height: 23px; margin-left: 5px; color:white;'>" + resource.name + "</span>");
        }
  kCO["columns"]= columnArray
  console.log("kCO: ", kCO)

  $('#kanban').jqxKanban(kCO)

}

$("#getItem").click(function(e){
  e.preventDefault()
  //var column = $('#kanban').jqxKanban('getColumnItems');
  var column = $('#kanban').jqxKanban('getColumnItems', 'session1');
  //var column = $('#kanban').jqxKanban('getColumn', 'session1');
  console.log("column: ", column)
  //var itemId = 'S1I1';
  //var newContent = { id: "S1I1", state: "session1", label: "Assessments: terms-bdi01-beck.json", tags: "test1", hex: "#5dc3f0" };
  // $('#kanban').jqxKanban('updateItem', itemId, newContent);
})
$('#kanban').on('itemMoved', function (event) {
                var args = event.args;
                var itemId = args.itemId;
                var idx = $('#kanban_' + itemId).index();
                alert(idx);
                var session1 = getListOrder("kanban-column-container-0");
                console.log("session1: ", session1)
                //var listAuditeesAudit = getListOrder("kanban-column-container-1");
})

var itemIndex = 0;
    $('#kanban').on('columnAttrClicked', function (event) {
        var args = event.args;
        if (args.attribute == "button") {
            args.cancelToggle = true;
            if (!args.column.collapsed) {
                var colors = ['#f19b60', '#5dc3f0', '#6bbd49', '#732794']
                $('#kanban1').jqxKanban('addItem', { status: args.column.dataField, text: "<input placeholder='(No Title)' style='width: 96%; margin-top:2px; border-radius: 3px; border-color: #ddd; line-height:20px; height: 20px;' class='jqx-input' id='newItem" + itemIndex + "' value=''/>", tags: "new task", color: colors[Math.floor(Math.random() * 4)], resourceId: Math.floor(Math.random() * 4) });
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
     var list = document.getElementById(id).childNodes;

     var listLength = list.length;
     var i=0;
     var res = [];
     console.log("ChildNodes: ",list)
     for(var i=0; i<listLength; i++){
          var chaine = list.item(i).id;
          var tableau = chaine.split("_");
          var indexAuditee = tableau[1];
          res.push(indexAuditee);
     }
     var chaine = res.toString();
     return chaine;
}

/**
Add fields to the acquistion form UI using a specified JSON file
*/
function add_term_to_form(termform){
  selectedFields = termform['fields']
  console.log("Number of Fields in the form: ",selectedFields.length)
  //console.log("x",x.length)

  for (let i=0; i<selectedFields.length; i++){
    let sid = "ndar-"+i
    let options = []
    let sub_options1 = []
    let nvalues = []

    // check the 'notes' field for any value specified
    let notes = checkNotes(selectedFields[i].name,selectedFields[i].notes)
    if(notes != null){
      nvalues = Object.keys(notes).map(function(key) {
          return notes[key]
          })
    }

    if(selectedFields[i].valueRange == null){
      /* Case1: No Value Range */
      $("#ndar-fields").append('<div class="form-group">\
        <label for="ndar-'+i+'" data-toggle="tooltip" title="'+selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
        <div>\
        <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'" required>\
        </div>\
        </div>')
    }else if (selectedFields[i].valueRange.indexOf(';')> -1){
      /*  Case 2:
      if valueRange specified with ';' separator
      check notes if values with its meaning specified in the notes
      if notes is empty then parse valueRange field
      otherwise parse notes field and obtain values representation, e.g (1 = "xyz"; 2 = "utty")
      */
      let sub_options2 = []
      options = selectedFields[i].valueRange.split(';')
          //if(notes== {}){
          //  options = selectedFields[i].valueRange.split(';')
          //} else
          //if((notes != null) && (Object.values(notes).length ==  options.length)){
          //  options = Object.values(notes)
          //}
      console.log("c2::options::", options)
      console.log("c2::options.length::", options.length)
      $("#ndar-fields").append('<div class="form-group">\
        <label for="ndar-'+i+'" data-toggle="tooltip" title="'+ selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
        <div>\
          <select class="form-control" id="ndar-'+i+'">\
            <option value="nsource">Select</option>\
            </select>\
          </div>\
        </div>')

      for (let j=0; j< options.length; j++){
        console.log("Adding:",options[j])
        if(options[j].indexOf("::")> -1){
          let sub_options = options[j].split("::")
          for(let k=sub_options[0];k<=sub_options[1];k++){
            //$("#"+sid).append('<option value="'+ k+'">'+ k +'</option>')
            sub_options2.push(k)
          }
        }else{
          sub_options2.push(options[j])
          //$("#"+sid).append('<option value="'+ options[j]+'">'+ options[j] +'</option>')
        }
      }
      if((notes != null) && (nvalues.length ==  sub_options2.length)){
        //options = Object.values(notes)
        options = nvalues
        for(let m=0;m<options.length;m++){
          $("#"+sid).append('<option value="'+ options[m]+'">'+ options[m] +'</option>')
        }
      }else{
        for(let m=0;m<sub_options2.length;m++){
          $("#"+sid).append('<option value="'+ sub_options2[m]+'">'+ sub_options2[m] +'</option>')
        }
      }
    } else if (selectedFields[i].valueRange.indexOf("::")> -1){
      /*
      * Case3: valueRange of the form - 0::3
      * check notes - parse notes
      */
      flag = false
      if(notes == {}){
        sub_options1 = selectedFields[i].valueRange.trim().split("::")
      } else{
        //sub_options1 = Object.values(notes)
        sub_options1 = nvalues
        console.log("c3::sub_options1:: ", sub_options1)
        console.log("c3::sub_options1.length:: ", sub_options1.length)
        //console.log("notes: ", notes)
        if(sub_options1.length == 1){
          sub_options1 = selectedFields[i].valueRange.trim().split("::")
        }
        //console.log(":: ",sub_options1)
      }

      console.log("c3-1::sub-options1:: ",sub_options1)
      console.log("c3-1::sub_options1.length:: ", sub_options1.length)

      if(sub_options1[1].trim()>20){
        $("#ndar-fields").append('<div class="form-group">\
          <label for="ndar-'+i+'" data-toggle="tooltip" title="'+selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
            <div>\
              <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
            </div>\
          </div>')

      }else{
        $("#ndar-fields").append('<div class="form-group">\
          <label for="ndar-'+i+'" data-toggle="tooltip" title="'+ selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
          <div>\
            <select class="form-control" id="ndar-'+i+'">\
              <option value="select">Select</option>\
            </select>\
          </div>\
          </div>')

        if(notes == null || notes.hasOwnProperty(selectedFields[i].name)){
          for(let m=sub_options1[0].trim();m<sub_options1[1].trim();m++){
            $("#"+sid).append('<option value="'+ m+'">'+ m +'</option>')
          }
        }else{
          for(let m=0;m<sub_options1.length;m++){
            $("#"+sid).append('<option value="'+ sub_options1[m]+'">'+ sub_options1[m] +'</option>')
          }
        }
      }
    }else{

      $("#ndar-fields").append('<div class="form-group">\
      <label for="ndar-'+i+'" data-toggle="tooltip" title="'+selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
        <div>\
          <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
        </div>\
      </div>')
    }

  }//end of outermost for

  $("#ndar-fields").append('<div class="form-group">\
  <label for="ndar-'+selectedFields.length+'" data-toggle="tooltip" title="ExperimentID">ExperimentID</label>\
  <div>\
    <input class="form-control" type="text" placeholder="ExperimentID" id="ndar-'+selectedFields.length+'" required />\
  </div>\
  </div>')
}

function saveAqInfo(e){
  e.preventDefault()
  saveObj['objID'] = ''
  for (let i=0; i<=selectedFields.length; i++){
    //let lb =$('label[for="ndar-' + i + '"]').html()
    let lb=$('label[for="ndar-' + i + '"]').attr('title')
    console.log('lb1:', lb)
    saveObj[lb] = $("#ndar-"+ i).val()
    console.log('saveObj[lb]:',saveObj[lb])
  }

  console.log(saveObj)
  //Save the data entered
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/acquisitions/new",
    contentType: "application/json",
    data: JSON.stringify(saveObj),
    success: function(data){
      console.log('success')
      //$("#div-projectFields").empty()
      $("#termsInfoSaveMsg").empty()
      $("#terms-list").empty()
      $("#terms-back").empty()

      $("#termsInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
      <a href="#" class="close" data-dismiss="alert">&times;</a>\
  <strong>Aquisition Object Saved in uploads/acquisition/'+ data['fid']+'!</strong>\
</div>')
      $("#termsInfoSaveMsg").append('<br>')
      $("#terms-list").append('<button id= "btn-pj-list" class="btn btn-primary">Fill up Another Form </button><br>')
      $("#terms-back").append('<button id= "btn-back" class="btn btn-primary">Back To Main Page </button>')
    }
  })
  console.log('done')
}
function projectListPage(){
  window.location.href = "http://localhost:3000/acquistionForm.html"
}

function mainpage(){
  window.location.href = "http://localhost:3000"
}
$('#btn-aqInfoSave').click(saveAqInfo)
$('#terms-list').click(projectListPage)
$('#terms-back').click(mainpage)

function checkNotes(key,notes){
  let values = {}
  if(notes != null){
    let options = notes.split(';')
    for(let i = 0;i < options.length; i++){
      let value = options[i].split('=')
      if(value.length<2){
        //values[value[0]] = key
        values[key] = value[0]
      } else{
        //values[value[1]] = value[0]
        values[value[0]] = value[1]
      }
    }
    return values
  } else {
    return {}
  }
}
