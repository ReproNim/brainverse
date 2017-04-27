let saveObj = {}
let selectedFields =[]
$('[data-toggle="tooltip"]').tooltip()

$.ajax({
  type: "GET",
  url: "http://localhost:3000/acquisitions/forms",
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
          //count++
      }
    }
  }
})

$("#tforms").change(function(){
  console.log($("#tforms").val())
  $("#ndar-fields").empty()
  addAqFields($("#tforms").val())
})

function addAqFields(formName){
  //check if for, is in local storage
  //let termform = JSON.parse(localStorage.getItem('termform'))
  let termform = JSON.parse(localStorage.getItem(formName))
  console.log("selectedFields",termform)

  let url = "http://localhost:3000/acquisitions/forms/" + formName

  // if the file is not in localstorage, read from the disk
  if(termform == null){

    $.ajax({
      type: "GET",
      url: url,
      accept: "application/json",
      success: function(data){
        console.log('acquistions term forms:success', data)
        termform = data
        add_term_to_form(termform)
      }//data
    })
  } else{
    add_term_to_form(termform)
  }

}//end of addAqFields function

function add_term_to_form(termform){
  selectedFields = termform['fields']
  console.log(selectedFields.length)
  //console.log("x",x.length)



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

    }//end of outermost for

    $("#ndar-fields").append('<div class="form-group row">\
    <label for="ndar-'+selectedFields.length+'" class="col-xs-2 col-form-label" data-toggle="tooltip" title="ExperimentID">ExperimentID</label>\
    <div class="col-xs-7">\
    <input class="form-control" type="text" placeholder="ExperimentID" id="ndar-'+selectedFields.length+'">\
    </div>\
    </div>')
}

function saveAqInfo(e){
  e.preventDefault()
  saveObj['objID'] = ''
  for (let i=0; i<=selectedFields.length; i++){
    let lb =$('label[for="ndar-' + i + '"]').html()
    saveObj[lb] = $("#ndar-"+ i).val()
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
