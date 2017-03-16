$('[data-toggle="tooltip"]').tooltip()

let selectedFields = JSON.parse(sessionStorage.getItem('termform'))
console.log(selectedFields)
console.log(selectedFields.length)


for (let i=0; i<selectedFields.length; i++){
    let sid = "ndar-"+i
    if(selectedFields[i].valueRange == null){
      $("#ndar-fields").append('<div class="form-group row">\
      <label for="remote-dir" class="col-xs-2 col-form-label" data-toggle="tooltip" title="'+selectedFields[i].description+'">'+selectedFields[i].name+'</label>\
      <div class="col-xs-7">\
      <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="field-'+i+'">\
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
            <label for="remote-dir" class="col-xs-2 col-form-label" data-toggle="tooltip" title="'+selectedFields[i].description+'">'+selectedFields[i].name+'</label>\
            <div class="col-xs-7">\
            <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="field-'+i+'">\
            </div>\
            </div>')
          }else{
          $("#ndar-fields").append('<div class="form-group row">\
            <label for="ndar-'+i+'" class="col-xs-2 col-form-label" data-toggle="tooltip" title="'+ selectedFields[i].description+'">'+selectedFields[i].name+'</label>\
            <div class="col-xs-7">\
              <select class="form-control" id="ndar-'+i+'">\
              <option value="nsource">Select</option>\
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
          <label for="remote-dir" class="col-xs-2 col-form-label" data-toggle="tooltip" title="'+selectedFields[i].description+'">'+selectedFields[i].name+'</label>\
          <div class="col-xs-7">\
          <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="field-'+i+'">\
          </div>\
          </div>')
        }

}
