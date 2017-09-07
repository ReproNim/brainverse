let count = 0
let vnum = 0
let chkboxSelectedArray = []
let saveObj = {}
let projPlanObj = {}
let personnelArray = []

let accordionCount = 0
let sessionCountStateArray = []

let serverURL = "http://127.0.0.1:3000"

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
  </div>'

  $('#prjInfo').append(prjPersonnel)
  $('#btn-addSession').prop({'disabled':false})
}


/*$(document).on('change', '#proj-personnel', function(){
  personnelArray = $.map($("#proj-personnel").val().split(","), $.trim);
  console.log("OnChange:PersonnelArray", personnelArray)
})*/

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
  //sessionCountStateObject['taskCount'] = 0
  //sessionCountStateObject['conditionCount'] = 0
  sessionCountStateArray.push(sessionCountStateObject)
  console.log("Count Array: ", sessionCountStateArray)
  console.log("Count object: ", sessionCountStateArray[0]['instrumentCount'])
  if($("#btn-pjInfoSave").length==0){
    $("#submitBtn").append('<button id= "btn-pjInfoSave" type="submit" class="btn btn-primary">Save</button>')
  }
}

function addPersonnel(vnum,icount){
  $("#pnl-"+vnum+"-"+icount).select2({
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
}//end of addPersonnel

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

function getInstruments(vnum,icount){
  let dvalues = []
  $.ajax({
    type: "GET",
    url: serverURL+"/query/instruments",
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
    url: serverURL+"/acquisitions/forms",
    accept: "application/json",
    success: function(data){
      console.log('acquistions forms:success', data)
      //let dE = JSON.parse(data)
      let iforms = data.list
      if(iforms.length == 0){
        console.log("no forms")
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
                                    <option value="3620194" selected="selected">Select a Personnel</option>\
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
      <option value="3620194" selected="selected">Select a Personnel</option>\
      </select>\
    </div>\
  </div>')

  getInstruments(a_id,instrumentCount)
  addPersonnel(a_id,instrumentCount)
  addChangeFunction(a_id,instrumentCount)
}}


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
  projPlanObj["Number Of Sessions"] = vnum
  //projPlanObj["Personnel"] = $.map($("#proj-personnel").val().split(","), $.trim);

  for(let j=1; j<= vnum; j++){
    session['Session Number'] = j
    session['Label'] = $("#visit-name-"+j).val()
    session['Description'] = $("#visit-desc-"+j).val()

    icount = sessionCountStateArray[j-1]["instrumentCount"]
    for(let i=1; i<=icount;i++){
      let userLogin = $("#pnl-"+j+"-"+i).select2('data')[0]
      let personnelItem = {}
      personnelItem['user'] = userLogin.login
      personnelItem['uid'] = userLogin.id
      personnelItem['url'] = userLogin.url
      personnelItem['avatar_url'] = userLogin.avatar_url
      personnelArray.push(personnelItem)

      let username = userLogin.login
      instrument['Instrument Type'] = $("#inst-"+j+"-"+i).val()
      instrument['Form Name'] = $("#iforms-"+j+"-"+i).val()
      instrument['Estimated Time'] = $("#est-"+j+"-"+i).val()
      //instrument['Assigned To'] = username
      instrument['Assignee'] = username
      instruments.push(instrument)
      instrument = {}
    }
    //console.log(personnelArray)
    session["Instruments"] = instruments
    sessions[j-1] = session
    session = {}
    instruments =[]
    //tasks = []
  }
  projPlanObj["Personnel"] = personnelArray
  projPlanObj["Sessions"] = sessions
  projPlanObj["created"] = moment().format()
  projPlanObj["wasDerivedFrom"] = "None"
  projPlanObj["version"] = 0

  $.ajax({
    type: "POST",
    url: serverURL+"/project-plans/new",
    contentType: "application/json",
    data: JSON.stringify(projPlanObj),
    success: function(data){
      projPlanObj = {}
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
    <strong>Project Plans Information Saved in /uploads/plansdocs/'+ data['fid']+' !</strong>\
    </div>')
    $("#pjInfoSaveMsg").append('<br>')
    //$("#pj-list").append('<button id= "btn-pj-list" class="btn btn-primary">Project Lists </button><br>')
    //$("#pj-back").append('<button id= "btn-back" class="btn btn-primary">Back To Main Page </button>')
    }
  })
  console.log('done')
}

function projectListPage(){
  window.location.href = serverURL+"/projectList.html"
}

function mainpage(){
  window.location.href = serverURL
}

function addClickFunctions(a_id){
  $(document).on('click','#btn-add-inst-'+ a_id,addInstruments(a_id))
}

$('#btn-addProject').click(addProject)
$('#btn-addSession').click(addSession)
$(document).on('click','#btn-pjInfoSave',saveProjInfo)
$('#pj-list').click(projectListPage)
$('#pj-back').click(mainpage)
