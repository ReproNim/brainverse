let count = 1
let chkboxSelectedArray = []
let saveObj = {}

//Read from a local static JSON file with a limited set of lexicons
//TODO Read and parse a turtle/owl file with all lexicons
$.ajax({
  type: "GET",
  url: "http://localhost:3000/query/terms",
  success: function(data){
    console.log('success')
    console.log(data)
    let termsKey = Object.keys(data)

    for (let i=0;i<termsKey.length;i++){
      if(termsKey[i] == "Project Information"){
        for (let j=0; j<data["Project Information"].length; j++){
          $("#div-projectFields").append('<div class="form-check"><label class="form-check-label">\
          <input class="form-check-input" type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ data["Project Information"][j] +'">\
          '+ data["Project Information"][j] +'</label></div>')
          count++
        }
      } else{
          $("#div-projectFields").append('<div class="form-check"><label class="form-check-label">\
          <input class="form-check-input" type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ termsKey[i] +'">\
          '+ termsKey[i] +'</label></div>')
          count++
        }
      }
  }
})

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
$('#btn-pjInfoSave').click(saveProjInfo)
$('#pj-list').click(projectListPage)
$('#pj-back').click(mainpage)
