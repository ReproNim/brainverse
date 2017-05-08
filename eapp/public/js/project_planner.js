let count = 1
let vnum = 0
let chkboxSelectedArray = []
let saveObj = {}
let projPlanObj = {}

let accordionCount = 0
//Read from a local static JSON file with a limited set of lexicons
//TODO Read and parse a turtle/owl file with all lexicons
$.fn.select2.defaults.set( "theme", "bootstrap" );

$("#proj-visit").change(function(){
  console.log("inside change function")
  vnum = $("#proj-visit").val()
  console.log("vnum: ",vnum)
  accordionCount = vnum
  for(let i=1; i<=vnum; i++){
    addAccordionPanel(i)
    getInstruments(i)
    addChangeFunction(i)

  }
})

function getInstruments(vnum){
  let dvalues = []
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/query/instruments",
    accept: "application/json",
    success: function(data){
      console.log('instruments:success')
      console.log("instrument: ",data)
      /*if(data != null){
        dvalues = Object.keys(data).map(function(key) {
            return data[key]
            })
      }*/
      dvalues = data["Instruments"]
      $("#inst-"+vnum).select2()
      for (let i=0;i<dvalues.length;i++){
        $("#inst-"+vnum).append('<option value="'+ dvalues[i]+'">'+ dvalues[i] +'</option>')
      }
    }
  })
}

function addChangeFunction(vnum){
  $("#inst-"+vnum).change(function(){
    console.log("instrument value: ", $("#inst-"+vnum).val())
    if($("#inst-"+vnum).val() == 'Assessments'){
      getAqFormNames($("#inst-"+vnum).val(),vnum)
    }else{
      //$("#term-form").empty()
      $("#iforms-"+vnum).empty()
    }
  })
}

function getAqFormNames(formName, vnum){
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
              $("#iforms-"+vnum).append('<option value="'+ iforms[i]+'">'+ iforms[i] +'</option>')
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
  if(a_id == 1){
    in_option = " in"
    expand = "true"
  }

  $("#div-projectFields").append('<div class="panel-group" id="accordion">\
                      <div class="panel panel-default">\
                        <div class="panel-heading" data-toggle="collapse" data-parent="#accordion" data-target="#collapse-'+a_id+'" id="heading-'+ a_id+'">\
                          <h4 class="panel-title accordion-toggle" aria-expanded="'+ expand +'">\
                            Session/Visit '+a_id+'\
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
                            <div class="form-group row">\
                              <label for="inst-'+ a_id+'" class="col-xs-2 col-form-label">Instruments</label>\
                              <div class="col-xs-7">\
                                <select class="form-control" id="inst-'+ a_id+'">\
                                <option value="">Select an Instrument</option>\
                                </select>\
                              </div>\
                            </div>\
                            <div class="form-group row" id="inst-form">\
                              <label for="iforms-'+ a_id+'" class="col-xs-2 col-form-label">Forms</label>\
                              <div class="col-xs-7">\
                                <select class="form-control" id="iforms-'+a_id+'">\
                                <option value="">Select a form</option>\
                                </select>\
                              </div>\
                            </div>\
                          </div>\
                        </div>\
                      </div>\
                    </div>')
}

// Save the project information entered and the selected fields
// The information is saved in a local file named 'proj-info.json'
function saveProjInfo(e){
  e.preventDefault()

  let sessions = []
  let session = {}

  projPlanObj["Project Name"] = $("#proj-name").val()
  projPlanObj["Number of Sessions"] = vnum

  for(let j=1; j<= vnum; j++){
    session = {}
    session['Session Number'] = j
    session['Label'] = $("#visit-name-"+j).val()
    session['Description'] = $("#visit-desc-"+j).val()
    session['Instrument'] = $("#inst-"+j).val()
    session['Form Name'] = $("#iforms-"+j).val()
    sessions[j-1] = session
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
      $("#pjInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
    <a href="#" class="close" data-dismiss="alert">&times;</a>\
    <strong>Project Plans Information Saved in /uploads/plansdocs/'+ data['fid']+' !</strong>\
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
$('#btn-pjInfoSave').click(saveProjInfo)
$('#pj-list').click(projectListPage)
$('#pj-back').click(mainpage)
