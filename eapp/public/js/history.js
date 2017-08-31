let planName = ""
let saveObj = {}
let selectedFields =[]

let serverURL = "http://127.0.0.1:3000"
moment().format()
//----
let plansArray = []
let columnArray = []
//---

/**
Get all project plans
**/
$.ajax({
  type: "GET",
  url: serverURL +"/project-plans",
  accept: "application/json",
  success: function(data){
    console.log('acquistions forms:success', data)
    let pforms = data.list
    if(pforms.length == 0){
      console.log("no forms")
      $("#plan-form").empty()
    }else{
      for (let i=0;i<pforms.length;i++){
        if(pforms[i] != ".DS_Store"){
          $("#pforms").append('<option value="'+ pforms[i]+'">'+ pforms[i] +'</option>')
        }
      }
    }
  }
})

/**
On selection of a project plan, display the project plan in the kanban board space
**/
$("#pforms").change(function(){
  console.log("Plan Selected: ", $("#pforms").val())
  $.ajax({
    type: "GET",
    url: serverURL +"/history/project-plans/"+$("#pforms").val(),
    accept: "application/json",
    success: function(data){
      console.log('history:success', data)
    }
  })

})
