let count = 1
let chkboxSelectedArray = []
let saveObj = {}
let termsKey = []
let categories = []
let ntypes = []
let nsources = []
let nparamObj = {}
let shortName = ''
let termsIndex = {}

$('[data-toggle="tooltip"]').tooltip()
$.fn.select2.defaults.set( "theme", "bootstrap" );

/*
* Data Dictionaries
*/

  $.ajax({
    type: "GET",
    url: "http://localhost:3000/ndar-terms/forms",
    accept: "application/json",
    success: function(data){
      console.log('get forms:success')
      let dE = JSON.parse(data)
      console.log(dE)
      $("#ndar-dd").select2()
      for (let i=0;i<dE.length;i++){
        $("#ndar-dd").append('<option value="'+ dE[i].shortName+'">'+ dE[i].title +'</option>')
    }
  }
})

function getDataDictionary(e3){
  e3.preventDefault()
  $("#div-projectFields").empty()
  count = 1
  //chkboxSelectedArray = []
  $("#ndar-dd-2").append('<p><h5> Select fields for your form </h4></p>')
  
  console.log(encodeURI($('#ndar-dd').val()))
  shortName = encodeURI($('#ndar-dd').val())
  
  let nUrl = "http://localhost:3000/ndar-terms/"+ encodeURI($("#ndar-dd").val())
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
      $("#div-projectFields").append('<div><table class="table  table-striped"">\
      <thead><tr><th class="th-head-1">Select</th><th class="th-head-2">Term</th><th>Description</th></tr></thead>\
      <tbody>')
      for (let i=0;i<termsKey.length;i++){
        termsIndex[termsKey[i].id] = termsKey[i]

          /*$("#div-projectFields").append('<div class="form-check"><label class="form-check-label" data-toggle="tooltip" title="'+termsKey[i].description+'">\
            <input class="form-check-input"  type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ termsKey[i].id +'"\
            >' +termsKey[i].name +'</label></div>')
          */
          $("#div-projectFields").append('<tr>\
            <td class="td-chk">\
              <input class="form-check-input"  type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ termsKey[i].id +'"\
              ><td>\
            <td class="td-term"> '+ termsKey[i].name+'</td>\
            <td> '+ termsKey[i].description+ '</td>\
            </tr>')

            count++
      }
      $("#div-projectFields").append('</tbody></table></div>')
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
      //chkboxSelectedArray.push(document.getElementById("projfield-"+ i).value)
      chkboxSelectedArray.push(termsIndex[document.getElementById("projfield-"+ i).value])
    } else{
      console.log("checkbox is not selected")
    }
  }

  console.log(chkboxSelectedArray)
  /*if (typeof(Storage) !== "undefined") {
    localStorage.setItem('termform', JSON.stringify(chkboxSelectedArray))
  } else {
    console.log('no storage support')
  }*/

  //Save the data entered
  saveObj['DictionaryID'] = ''
  saveObj['shortName'] = shortName
  saveObj["Name"] = document.getElementById("proj-name").value
  saveObj["Description"] = document.getElementById("proj-desc").value
  saveObj['fields'] = chkboxSelectedArray

  if (typeof(Storage) !== "undefined") {
    //localStorage.setItem('termform', JSON.stringify(saveObj))
    let psname = saveObj['shortName'].split(' ')
    let pname = saveObj['Name'].split(' ')
    let fname = 'terms-'+ psname[0]+'-'+ pname[0] +'.json'
    localStorage.setItem(fname,JSON.stringify(saveObj))
  } else {
    console.log('no storage support')
  }

  $.ajax({
    type: "POST",
    url: "http://localhost:3000/dictionaries/new",
    contentType: "application/json",
    data: JSON.stringify(saveObj),
    success: function(data){
      console.log('success')
      console.log("data received",data)
      $("#div-projectFields").empty()
      $("#termsInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
      <a href="#" class="close" data-dismiss="alert">&times;</a>\
  <strong>Terms Information Saved in uploads/termforms/'+data['fid']+'!</strong>\
</div>')
      $("#termsInfoSaveMsg").append('<br>')
      $("#terms-list").append('<button id= "btn-pj-list" class="btn btn-primary">Fill up Form </button><br>')
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

$("#btn-dd-selected").click(getDataDictionary)
$('#btn-pjInfoSave').click(saveProjInfo)
$('#terms-list').click(projectListPage)
$('#terms-back').click(mainpage)
