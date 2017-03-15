let count = 1
let chkboxSelectedArray = []
let saveObj = {}
let termsKey = []
let categories = []
let ntypes = []
let nsources = []
let nparamObj = {}

$('[data-toggle="tooltip"]').tooltip()
/*
* NDAR-TYPES
*/
$.ajax({
  type: "GET",
  url: "http://localhost:3000/ndar-types",
  accept: "application/json",
  success: function(data){
    console.log('ndar-types:success')
    let dE = JSON.parse(data)
    ntypes = dE.list
    for (let i=0;i<ntypes.length;i++){
        console.log(ntypes[i])
        $("#ndar-type").append('<option value="'+ ntypes[i]+'">'+ ntypes[i] +'</option>')
        //count++
    }
  }
})

/*
* NDAR-SOURCES
*/
$.ajax({
  type: "GET",
  url: "http://localhost:3000/ndar-sources",
  accept: "application/json",
  success: function(data){
    console.log('ndar-sources:success')
    let dE = JSON.parse(data)
    nsources = dE.list
    for (let i=0;i<nsources.length;i++){
        $("#ndar-source").append('<option value="'+ nsources[i]+'">'+ nsources[i] +'</option>')
        //count++
    }
  }
})

/*
* NDAR-CATEGORIES
*/
$.ajax({
  type: "GET",
  url: "http://localhost:3000/ndar-categories",
  accept: "application/json",
  success: function(data){
    console.log('ndar-cat:success')
    let dE = JSON.parse(data)
    categories = dE.list
    for (let i=0;i<categories.length;i++){
        $("#ndar-cat").append('<option value="'+ categories[i]+'">'+ categories[i] +'</option>')
    }
  }
})

/*
* Data Dictionaries
*/
function getDataForms(e1){
  e1.preventDefault()
  $("#btn-dataForms").remove()
  nparamObj['type'] = $("#ndar-type").val()
  nparamObj['source'] = $("#ndar-source").val()
  nparamObj['category'] = $("#ndar-cat").val()
  console.log(nparamObj)

  $.ajax({
    type: "POST",
    url: "http://localhost:3000/ndar-terms/forms",
    contentType: "application/json",
    data: JSON.stringify(nparamObj),
    success: function(data){
      console.log('get forms: success')
      let dE = JSON.parse(data)
      console.log(dE)
      $("#ndar-dd").append('<select class="form-control" id="ndar-forms">\
          <option value="ddform">Select a form</option>\
          </select>')
      for (let i=0;i<dE.length;i++){
          $("#ndar-forms").append('<option value="'+ dE[i].shortName+'">'+ dE[i].title +'</option>')
      }
    }
  })

}


function getDataDictionary(e3){
  e3.preventDefault()
  $("#btn-dd-selected").remove()
  $("#ndar-dd-2").append('<p><h5> Select fields for your form </h4></p>')

  console.log(encodeURI($('#ndar-forms').val()))

  let nUrl = "http://localhost:3000/ndar-terms/"+ encodeURI($("#ndar-forms").val())
  console.log("nUrl",nUrl)
  $.ajax({
    type: "GET",
    url: nUrl ,
    accept: "application/json",
    success: function(data){
      console.log('success')

      let dE = JSON.parse(data)
      termsKey = dE.dataElements
      console.log(termsKey[0])
      for (let i=0;i<termsKey.length;i++){
          $("#div-projectFields").append('<div class="form-check"><label class="form-check-label" data-toggle="tooltip" title="'+termsKey[i].description+'">\
            <input class="form-check-input"  type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ termsKey[i].name +'"\
            >' +termsKey[i].name +'</label></div>')
            count++
      }
    }
  })
}


// Save the project information entered and the selected fields
// The information is saved in a local file named 'proj-info.json'
function saveProjInfo(e){
  e.preventDefault()
  for (let i=1; i<count; i++){
    if(document.getElementById("projfield-" + i).checked){
      console.log(document.getElementById("projfield-"+ i).checked)
      chkboxSelectedArray.push(document.getElementById("projfield-"+ i).value)
    } else{
      console.log("checkbox is not selected")
    }
  }

  console.log(chkboxSelectedArray)

  //Save the data entered
  saveObj['ProjectID'] = ''
  saveObj["Name"] = document.getElementById("proj-name").value
  saveObj["Description"] = document.getElementById("proj-desc").value
  saveObj["fields"] = chkboxSelectedArray

  $.ajax({
    type: "POST",
    url: "http://localhost:3000/projects/new",
    contentType: "application/json",
    data: JSON.stringify(saveObj),
    success: function(data){
      console.log('success')

      $("#pjInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
      <a href="#" class="close" data-dismiss="alert">&times;</a>\
  <strong>Project Terms Information Saved in /uploads !</strong>\
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

$("#btn-dataForms").click(getDataForms)
$("#btn-dd-selected").click(getDataDictionary)
//$('#btn-pjInfoSave').click(saveProjInfo)
//$('#pj-list').click(projectListPage)
//$('#pj-back').click(mainpage)
