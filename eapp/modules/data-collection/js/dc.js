$.fn.select2.defaults.set( "theme", "bootstrap" )
$("#div-planListMenu").select2()
collectionObj = JSON.parse(localStorage.getItem("collectionObj"))
console.log("collectionObj: ", collectionObj)

$('#collectionInfo').append('<h4 id="collectionName">'+ collectionObj['Name']+' <a data-toggle="modal" href="#updateCollectionInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a></h4><hr>')
$('#collectionInfo').append(createModal('updateCollectionInfoModal', 'Update Collection Information', 'Update'))
let collectionInfoForm = new AlpacaForm('#body-updateCollectionInfoModal')
createCollectionInfoForm(collectionInfoForm,"updateCollectionInfoModal", collectionObj["Name"],collectionObj["Description"])

/*
* Update Collection Info - Name and Description
*/
$(document).on('hidden.bs.modal','#updateCollectionInfoModal', function(e){
  console.log("[dc] collection name",  $("#updateCollectionInfoModal-name").val())
  console.log("[dc] desc: ", $("#collectionDescription").val())
  let name = $("#updateCollectionInfoModal-name").val()
  let desc = $("#collectionDescription").val()
  if(name != ""){
    collectionObj["Name"] = $("#updateCollectionInfoModal-name").val()
  }
  if(desc!= ""){
    collectionObj["Description"] = $("#collectionDescription").val()
  }
  localStorage.setItem("collectionObj", JSON.stringify(collectionObj))
  $('#collectionName').html(collectionObj['Name']+' <a data-toggle="modal" href="#updateCollectionInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a>')
  updateCollectionInfo()
})

/**
** Updating and Saving the updated collection info into the format for rdf serialization
**/
function updateCollectionInfo(){
  localStorage.setItem("collectionObj", JSON.stringify(collectionObj))
  console.log("[dc] update collection obj info: ", collectionObj)
}

function displayPlanList(){
  return new Promise(function(resolve){
    $.ajax({
      type: "GET",
      url: serverURL +"/project-plans",
      accept: "application/json",
      success: function(data){
        console.log('acquistions forms:success', data)
        let pforms = data.list
        if(pforms.length == 0){
          console.log("no forms to display")
          resolve([])
        }else{
          resolve(pforms)
        }
      }
    })
  })
}

displayPlanList().then(function(planList){
  var values = planList.map(function(planName){
    return new Promise(function(resolve){
      let url = serverURL+"/project-plans/" + planName
        $.ajax({
          type: "GET",
          url: url,
          accept: "application/json",
          success: function(data){
            console.log('acquisitions term forms:success', data)
            resolve(data)
          }//data
        })
    })
  })
  return Promise.all(values)
}).then(function(planObjs){
  console.log("all plan obj: ", planObjs)
  if(planObjs.length !== 0){
    for (let i=0;i<planObjs.length;i++){
      $("#div-planListMenu").append('<option value="'+ planObjs[i]["Project Name"]+'">'+ planObjs[i]["Project Name"] +'</option>')
      planListObjs[planObjs[i]["Project Name"].trim()] = planObjs[i]
    }
  }
})

$("#div-planListMenu").change(function(){
  let planSelected = $("#div-planListMenu").val()
  let planObjSelected = planListObjs[planSelected.trim()]
  localStorage.setItem('planObjSelected', JSON.stringify(planObjSelected))
  //let test = JSON.parse(localStorage.getItem('planObjSelected'))
  //console.log("test: ", test)
})
