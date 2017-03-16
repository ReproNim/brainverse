let saveObj = {}
$('[data-toggle="tooltip"]').tooltip()

let selectedFields = JSON.parse(sessionStorage.getItem('termform'))
console.log(selectedFields)
console.log(selectedFields.length)


for (let i=0; i<selectedFields.length; i++){
    let sid = "ndar-"+i
    if(selectedFields[i].valueRange == null){
      $("#ndar-fields").append('<div class="form-group row">\
      <label for="ndar-'+i+'" class="col-xs-2 col-form-label" data-toggle="tooltip" title="'+selectedFields[i].description+'">'+selectedFields[i].name+'</label>\
      <div class="col-xs-7">\
      <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
      </div>\
      </div>')
    }else if (selectedFields[i].valueRange.indexOf(';')> -1){
        let options = selectedFields[i].valueRange.split(';')
        console.log(options)
        $("#ndar-fields").append('<div class="form-group row">\
          <label for="ndar-'+i+'" class="col-xs-2 col-form-label" data-toggle="tooltip" title="'+ selectedFields[i].description+'">'+selectedFields[i].name+'</label>\
          <div class="col-xs-7">\
            <select class="form-control" id="ndar-'+i+'">\
            <option value="nsource">Select</option>\
            </select>\
          </div>\
        </div>')

        //console.log(sid)
        for (let j=0; j< options.length; j++){
          console.log("Adding",options[j])
          if(options[j].indexOf("::")> -1){
            let sub_options = options[j].split("::")
            for(let k=sub_options[0];k<sub_options[1];k++){
              $("#"+sid).append('<option value="'+ k+'">'+ k +'</option>')
            }
          }else{
            $("#"+sid).append('<option value="'+ options[j]+'">'+ options[j] +'</option>')
          }
        }
      } else if (selectedFields[i].valueRange.indexOf("::")> -1){
          let sub_options1 = selectedFields[i].valueRange.trim().split("::")
          console.log(":: ",sub_options1)
          if(sub_options1[1].trim()>20){
            $("#ndar-fields").append('<div class="form-group row">\
            <label for="ndar-'+i+'" class="col-xs-2 col-form-label" data-toggle="tooltip" title="'+selectedFields[i].description+'">'+selectedFields[i].name+'</label>\
            <div class="col-xs-7">\
            <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
            </div>\
            </div>')
          }else{
          $("#ndar-fields").append('<div class="form-group row">\
            <label for="ndar-'+i+'" class="col-xs-2 col-form-label" data-toggle="tooltip" title="'+ selectedFields[i].description+'">'+selectedFields[i].name+'</label>\
            <div class="col-xs-7">\
              <select class="form-control" id="ndar-'+i+'">\
              <option value="select">Select</option>\
              </select>\
            </div>\
          </div>')

          for(let m=sub_options1[0].trim();m<sub_options1[1].trim();m++){
            $("#"+sid).append('<option value="'+ m+'">'+ m +'</option>')
          }
        }
        }
        else{
          //$("#"+sid).append('<option value="'+ options[j]+'">'+ options[j] +'</option>')
          $("#ndar-fields").append('<div class="form-group row">\
          <label for="ndar-'+i+'" class="col-xs-2 col-form-label" data-toggle="tooltip" title="'+selectedFields[i].description+'">'+selectedFields[i].name+'</label>\
          <div class="col-xs-7">\
          <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
          </div>\
          </div>')
        }

}

function saveAqInfo(e){
  e.preventDefault()
  saveObj['objID'] = ''
  for (let i=0; i<selectedFields.length; i++){
    let lb =$('label[for="ndar-' + i + '"]').html()
    saveObj[lb] = $("#ndar-"+ i).val()
  }

  if (typeof(Storage) !== "undefined") {
    sessionStorage.setItem('termform', JSON.stringify(saveObj))
  } else {
    console.log('no storage support')
  }

  //Save the data entered
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/acquisitions/new",
    contentType: "application/json",
    data: JSON.stringify(saveObj),
    success: function(data){
      console.log('success')
      //$("#div-projectFields").empty()
      $("#termsInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
      <a href="#" class="close" data-dismiss="alert">&times;</a>\
  <strong>Aquisition Object Saved in uploads/acquisition!</strong>\
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
