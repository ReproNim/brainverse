let count = 0
let vnum = 0
let chkboxSelectedArray = []
let saveObj = {}
let projPlanObj = {}
let personnelArray = []

let accordionCount = 0
let sessionCountStateArray = []

//Read from a local static JSON file with a limited set of lexicons
//TODO Read and parse a turtle/owl file with all lexicons
$.fn.select2.defaults.set( "theme", "bootstrap" );

function addProject(e){
  e.preventDefault()
  count=0
  console.log('Add project button Clicked')
  $("#btn-addProject").remove()
  let prjPersonnel = '<div class="form-group row">\
    <label for="proj-name" class="col-xs-2 col-form-label">Name</label>\
    <div class="col-xs-7">\
    <input class="form-control" type="text" placeholder="Project Name here" id="proj-name">\
    </div>\
  </div>\
  <div class="form-group row">\
    <label for="proj-personnel" class="col-xs-2 col-form-label">Personnel</label>\
    <div class="col-xs-7">\
    <input class="form-control" type="text" placeholder="Personnel names separated by commas" id="proj-personnel">\
    </div>\
  </div>'

  $('#prjInfo').append(prjPersonnel)
  $('#btn-addSession').prop({'disabled':false})
}

/*$("#proj-personnel").change(function(){
  personnelArray = $.map($("#proj-personnel").val().split(","), $.trim);
  console.log("OnChange:PersonnelArray", personnelArray)
})*/
$(document).on('change', '#proj-personnel', function(){
  personnelArray = $.map($("#proj-personnel").val().split(","), $.trim);
  console.log("OnChange:PersonnelArray", personnelArray)
})

function addSession(e){
  e.preventDefault()
  console.log('Add session button clicked')
  count++
  let i = count
  addAccordionPanel(i)
  getInstruments(i,1)
  addPersonnel(i,1)
  addChangeFunction(i,1)
  addClickFunctions(i)
  let sessionCountStateObject = {}
  sessionCountStateObject['instrumentCount'] = 1
  sessionCountStateObject['taskCount'] = 0
  sessionCountStateObject['conditionCount'] = 0
  sessionCountStateArray.push(sessionCountStateObject)
  console.log("Count Array: ", sessionCountStateArray)
  console.log("Count object: ", sessionCountStateArray[0]['instrumentCount'])
  if($("#btn-pjInfoSave").length==0){
    $("#submitBtn").append('<button id= "btn-pjInfoSave" type="submit" class="btn btn-primary">Save</button>')
  }
}

function addPersonnel(vnum,icount){
  $("#pnl-"+vnum+"-"+icount).select2()
  console.log("personnelArray", personnelArray)
  for (let i=0;i<personnelArray.length;i++){
    $("#pnl-"+vnum+"-"+icount).append('<option value="'+ personnelArray[i]+'">'+ personnelArray[i] +'</option>')
  }
}
function getInstruments(vnum,icount){
  let dvalues = []
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/query/instruments",
    accept: "application/json",
    success: function(data){
      console.log('instruments:success')
      console.log("instrument: ",data)
      dvalues = data["Instruments"]
      $("#inst-"+vnum+"-"+icount).select2()
      for (let i=0;i<dvalues.length;i++){
        $("#inst-"+vnum+"-"+icount).append('<option value="'+ dvalues[i]+'">'+ dvalues[i] +'</option>')
      }
    }
  })
}

/**
* Change function attached to Instrument type field. Based on Instrument type selected, corresponding list of forms are listed
* TODO Organize instrument type forms. If needed add new endpoints
**/
function addChangeFunction(vnum,icount){
  $("#inst-"+vnum+"-"+icount).change(function(){
    console.log("instrument value: ", $("#inst-"+vnum).val())
    if($("#inst-"+vnum+"-"+icount).val() == 'Assessments'){
      getAqFormNames($("#inst-"+vnum+"-"+icount).val(),vnum,icount)
    }else{
      //$("#term-form").empty()
      $("#iforms-"+vnum).empty()
    }
  })
}

/**
* Get all the forms corresponding to an instrument type selection
*
**/
function getAqFormNames(formName, vnum,icount){
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/acquisitions/forms",
    accept: "application/json",
    success: function(data){
      console.log('acquistions forms:success', data)
      //let dE = JSON.parse(data)
      let iforms = data.list
      if(iforms.length == 0){
        console.log("no forms")
        //$("#term-form").empty()
      }else{
        for (let i=0;i<iforms.length;i++){
            console.log("forms Name: ", iforms[i])
            if(iforms[i] != ".DS_Store"){
              $("#iforms-"+vnum+"-"+icount).append('<option value="'+ iforms[i]+'">'+ iforms[i] +'</option>')
            }
        }
      }
    }
  })
}

//TODO Replace this piece of code either with a javascript method or use some library
function addAccordionPanel(a_id){
  let in_option = ""
  let expand = "false"
  //if(a_id == 1){
    in_option = " in"
    expand = "true"
  //}
  let instrumentCount = 1
  $("#div-projectFields").append('<div class="panel-group" id="accordion">\
                      <div class="panel panel-default">\
                        <div class="panel-heading" data-toggle="collapse" data-parent="#accordion" data-target="#collapse-'+a_id+'" id="heading-'+ a_id+'">\
                          <h4 class="panel-title accordion-toggle" aria-expanded="'+ expand +'">\
                            Session '+a_id+'\
                          </h4>\
                        </div>\
                        <div id="collapse-'+a_id+'" class="panel-collapse collapse'+in_option+'">\
                          <div class="panel-body">\
                            <div class="form-group row">\
                              <label for="vist-name-'+ a_id+'" class="col-xs-2 col-form-label">Label</label>\
                              <div class="col-xs-7">\
                              <input class="form-control" type="text" placeholder="Visit Name" id="visit-name-'+ a_id+'">\
                              </div>\
                            </div>\
                            <div class="form-group row">\
                              <label for="visit-desc-'+ a_id +'" class="col-xs-2 col-form-label">Description</label>\
                              <div class="col-xs-7">\
                              <input class="form-control" type="text" placeholder="Description here" id="visit-desc-'+ a_id +'">\
                              </div>\
                            </div>\
                            <br>\
                            <div id="instruments-'+ a_id+'">\
                              <div class="form-group row">\
                                <label for="inst-'+ a_id+'-'+ instrumentCount +'" class="col-xs-2 col-form-label">Instrument Type</label>\
                                <div class="col-xs-7">\
                                  <select class="form-control" id="inst-'+ a_id+'-'+ instrumentCount+'">\
                                  <option value="">Select an Instrument</option>\
                                  </select>\
                                </div>\
                              </div>\
                              <div class="form-group row" id="inst-form">\
                                <label for="iforms-'+ a_id+'-'+ instrumentCount+'" class="col-xs-2 col-form-label">Forms</label>\
                                <div class="col-xs-7">\
                                  <select class="form-control" id="iforms-'+a_id+'-'+ instrumentCount+'">\
                                  <option value="">Select a form</option>\
                                  </select>\
                                </div>\
                              </div>\
                              <div class="form-group row">\
                                <label for="est-'+ a_id+'-'+ instrumentCount +'" class="col-xs-2 col-form-label">Estimated Time</label>\
                                <div class="col-xs-7">\
                                <input class="form-control" type="text" placeholder="Estimated time for this task" id="est-'+ a_id+'-'+ instrumentCount +'">\
                                </div>\
                              </div>\
                              <div class="form-group row" id="inst-form">\
                                <label for="pnl-'+ a_id+'-'+ instrumentCount+'" class="col-xs-2 col-form-label">Assigned To</label>\
                                <div class="col-xs-7">\
                                  <select class="form-control" id="pnl-'+a_id+'-'+ instrumentCount+'">\
                                  <option value="">Select a Personnel</option>\
                                  </select>\
                                </div>\
                              </div>\
                            </div>\
                            <div id="tasks-'+ a_id+'">\
                            </div>\
                            <!--div class="row" id="add-btn-group"-->\
                            <br>\
                            <div>\
                              <button id="btn-add-inst-'+ a_id+'" type="submit" class="btn btn-default"> + Add Instrument</button>\
                              <button id="btn-create-inst-'+ a_id+'" type="submit" class="btn btn-default"> + Create Instrument</button>\
                              <!--button id="btn-add-task-'+ a_id+'" type="submit" class="btn btn-primary">Add a Task</button>\
                              <button id="btn-add-cond-'+ a_id+'" type="submit" class="btn btn-primary" disabled>Add a Condition</button-->\
                            </div>\
                          </div>\
                        </div>\
                      </div>\
                    </div>')
}

function addInstruments(a_id){
  return function(e1){
  e1.preventDefault()
  console.log("a_id: ",a_id)
  sessionCountStateArray[a_id-1]["instrumentCount"]++
  instrumentCount = sessionCountStateArray[a_id-1]["instrumentCount"]
  //count++
  console.log("Instrument has been clicked, count: ", instrumentCount)
  $("#instruments-"+ a_id).append('<br><div class="form-group row">\
    <label for="inst-'+a_id+'-'+instrumentCount+'" class="col-xs-2 col-form-label">Instrument Type</label>\
    <div class="col-xs-7">\
      <select class="form-control" id="inst-'+a_id+'-'+instrumentCount+'">\
      <option value="">Select an Instrument</option>\
      </select>\
    </div>\
  </div>\
  <div class="form-group row" id="inst-form">\
    <label for="iforms-'+a_id+'-'+instrumentCount+'" class="col-xs-2 col-form-label">Forms</label>\
    <div class="col-xs-7">\
      <select class="form-control" id="iforms-'+a_id+'-'+instrumentCount+'">\
      <option value="">Select a form</option>\
      </select>\
    </div>\
  </div>\
  <div class="form-group row">\
    <label for="est-'+ a_id+'-'+ instrumentCount +'" class="col-xs-2 col-form-label">Estimated Time</label>\
    <div class="col-xs-7">\
    <input class="form-control" type="text" placeholder="Estimated time for this task" id="est-'+ a_id+'-'+ instrumentCount +'">\
    </div>\
  </div>\
  <div class="form-group row" id="inst-form">\
    <label for="pnl-'+ a_id+'-'+ instrumentCount+'" class="col-xs-2 col-form-label">Assigned To</label>\
    <div class="col-xs-7">\
      <select class="form-control" id="pnl-'+a_id+'-'+ instrumentCount+'">\
      <option value="">Select a Personnel</option>\
      </select>\
    </div>\
  </div>')

  getInstruments(a_id,instrumentCount)
  addPersonnel(a_id,instrumentCount)
  addChangeFunction(a_id,instrumentCount)
}}

function addTasks(a_id){
  return function(e2){
    e2.preventDefault()
    console.log("a_id: ",a_id)
    sessionCountStateArray[a_id-1]["taskCount"]++
    taskCount = sessionCountStateArray[a_id-1]["taskCount"]
    console.log("Add Task has been clicked, count: ", taskCount)
    $("#tasks-"+ a_id).append('<div class="form-group row">\
      <label for="task-'+ a_id+'-'+taskCount +'" class="col-xs-2 col-form-label">Task Description</label>\
      <div class="col-xs-7">\
      <input class="form-control" type="text" placeholder="Task Description here" id="task-'+ a_id+'-'+taskCount +'">\
      </div>\
    </div>')
    $("#btn-add-cond-"+ a_id).prop('disabled', false)
    //if($("#btn-add-cond-"+ a_id).length ==0){
    //  $("#add-btn-group").append('<button id="btn-add-cond" type="submit" class="btn btn-primary">Add a Condition</button>')
    //}
  }
}
function addConditions(a_id){
  return function(e3){
    e3.preventDefault()
    console.log("a_id: ",a_id)
    sessionCountStateArray[a_id-1]["conditionCount"]++
    taskCount = sessionCountStateArray[a_id-1]["taskCount"]
    conditionCount = sessionCountStateArray[a_id-1]["conditionCount"]
    console.log("Add Condition has been clicked, count", conditionCount)
    $("#tasks-"+ a_id).append('<div class="form-group row">\
      <label for="condn-'+ a_id+'-'+taskCount+'-'+conditionCount +'" class="col-xs-2 col-form-label">Condition</label>\
      <div class="col-xs-7">\
      <input class="form-control" type="text" placeholder="Condition here" id="condn-'+ a_id+'-'+ taskCount+'-'+conditionCount +'">\
      </div>\
    </div>')
    console.log("stateArray:", sessionCountStateArray)
    //$("#add-btn-group").append('<button id="btn-add-cond" type="submit" class="btn btn-primary">Add a Condition</button>')
  }
}

// Save the project information entered and the selected fields
// The information is saved in a local file named 'proj-info.json'
function saveProjInfo(e){
  e.preventDefault()

  let sessions = []
  let session = {}
  let instrument={}
  let instruments=[]
  let task = {}
  let tasks = []
  let condn = []

  vnum=count
  projPlanObj["Project Name"] = $("#proj-name").val()
  projPlanObj["Number of Sessions"] = vnum
  projPlanObj["Personnel"] = $.map($("#proj-personnel").val().split(","), $.trim);

  for(let j=1; j<= vnum; j++){
    session['Session Number'] = j
    session['Label'] = $("#visit-name-"+j).val()
    session['Description'] = $("#visit-desc-"+j).val()

    icount = sessionCountStateArray[j-1]["instrumentCount"]
    for(let i=1; i<=icount;i++){
      instrument['Instrument Type'] = $("#inst-"+j+"-"+i).val()
      instrument['Form Name'] = $("#iforms-"+j+"-"+i).val()
      instrument['Estimated Time'] = $("#est-"+j+"-"+i).val()
      instrument['Assigned To'] = $("#pnl-"+j+"-"+i).val()
      instruments.push(instrument)
      instrument = {}
    }
    let tcount = sessionCountStateArray[j-1]["taskCount"]
    let ccount = sessionCountStateArray[j-1]["conditionCount"]
    console.log("(vcount, tcount, ccount): ", j,tcount,ccount)
    for(let t=1;t<=tcount;t++){
      task["Task number"] = t
      task["Description"] = $("#task-"+ j+"-"+t).val()
      for(let c=1;c<=ccount;c++){
        if($("#condn-"+j+"-"+t+"-"+c).length == 0){
          console.log("element not present")
        }else{
          condn.push($("#condn-"+j+"-"+t+"-"+c).val())
        }
      }
      task["Conditions"] = condn
      tasks.push(task)
      task={}
      condn=[]
    }

    session["Instruments"]=instruments
    session["Tasks"] = tasks
    sessions[j-1] = session
    session = {}
    instruments =[]
    tasks = []
  }

  projPlanObj["Sessions"] = sessions
  console.log(projPlanObj)

  $.ajax({
    type: "POST",
    url: "http://localhost:3000/project-plans/new",
    contentType: "application/json",
    data: JSON.stringify(projPlanObj),
    success: function(data){
      console.log('success: response:', data)
      $("#pjInfoSaveMsg").empty()
      $("#pj-list").empty()
      $("#pj-back").empty()
      $("#div-addProject").empty()
      $("#div-addProject").append('<button id="btn-addProject" class="btn btn-primary"> + Add Project </button>')
      $("#prjInfo").empty()
      $("#div-projectFields").empty()
      $("#btn-addSession").prop({'disabled':true})
      $("#submitBtn").empty()
      $("#pjInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
    <a href="#" class="close" data-dismiss="alert">&times;</a>\
    <strong>Project Plans Information Saved in /uploads/plansdocs/'+ data['plan_id']+' !</strong>\
    </div>')
    $("#pjInfoSaveMsg").append('<br>')
    $("#pj-list").append('<button id= "btn-pj-list" class="btn btn-primary">Project Lists </button><br>')
    $("#pj-back").append('<button id= "btn-back" class="btn btn-primary">Back To Main Page </button>')
    }
  })
  console.log('done')
}

function projectListPage(){
  window.location.href = "http://localhost:3000/projectList.html"
}

function mainpage(){
  window.location.href = "http://localhost:3000"
}

function addClickFunctions(a_id){
  $(document).on('click','#btn-add-inst-'+ a_id,addInstruments(a_id))
  //$(document).on('click','#btn-add-task-'+ a_id,addTasks(a_id))
  //$(document).on('click','#btn-add-cond-'+ a_id,addConditions(a_id))
}

$('#btn-addProject').click(addProject)
$('#btn-addSession').click(addSession)
//$('#btn-pjInfoSave').click(saveProjInfo)
$(document).on('click','#btn-pjInfoSave',saveProjInfo)
$('#pj-list').click(projectListPage)
$('#pj-back').click(mainpage)
