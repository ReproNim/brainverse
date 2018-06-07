let form = new AlpacaForm('#div-newPlan')
let serverURL = "http://127.0.0.1:3000"
let planObj = {}

function createPlan(){
  $('#btn-newPlan').remove()
  $('#div-planList').remove()
  form.inputForm('Name', 'Name', 'planName', 'string', undefined, null, false)
  form.textAreaForm('Description', 'Description', 'planDescription','string', undefined, null, false)
  form.submitBtnForm('Save Plan',sAction)
  form.alpacaGen()
}

function sAction(){
  console.log("New Plan  Being Added Action performed")
  planObj["Name"] = $("#planName").val()
  planObj["Description"] = $("#planDescription").val()
  planObj["version"]=0
  console.log("[sAction] planObj: ", planObj)
  localStorage.setItem("newPlanObj", JSON.stringify(planObj))
  //localStorage.setItem("projectPlanObj",JSON.stringify(planObj))
  savePlanInfo().then(function(){
    newPlanObj = JSON.parse(localStorage.getItem("newPlanObj"))
    console.log("newPlanObj:~~~",newPlanObj)
    form.alpacaDestroy()
    window.location.href = serverURL+"/experiment-planner/html/plan-board.html"
  })
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
    $('#div-planList').append('<table class="table table-striped" id="tab1"></table>')
    let planTable = document.getElementById("tab1")
    var header = planTable.createTHead()
    var rowH = header.insertRow(0)
    var cellH = rowH.insertCell(0)
    var cellD = rowH.insertCell(1)
    cellH.innerHTML = "<b>Project Plan Name</b>";
    cellD.innerHTML = "<b>Description</b>"
    for (let i=0;i<planObjs.length;i++){
      let row = planTable.insertRow(i+1)
      if(planObjs[i] != ".DS_Store"){
        let cell0 = row.insertCell(0)
        let cell1 = row.insertCell(1)
        //cell.innerHTML = '<a href="#">'+pforms[i]+'</a>'
        cell0.innerHTML = planObjs[i]["Project Name"]
        cell1.innerHTML = planObjs[i]["Description"]
        row.addEventListener("click",function(e){
          //console.log("getting the plan Info", this)
          var target = e.target;
          if ( target.nodeName != 'TD' )
            return;

          var columns = target.parentNode.getElementsByTagName( 'td' );
          console.log("target:", target)

          for ( var i = columns.length; i-- ; ){
            console.log("some value:", columns[ i ].innerHTML)
            let name = localStorage.getItem(columns[ i ].innerHTML)
            console.log("name: ", name)
            if(name != null){
              localStorage.setItem("projectPlanObj",name)
              window.location.href = serverURL+"/experiment-planner/html/plan-board.html"
            }

          }
        })
        localStorage.setItem(planObjs[i]["Project Name"], JSON.stringify(planObjs[i]))
      }
    }
  }
})

$('#btn-newPlan').click(createPlan)

$('#btn-back-mn').click(function(){
    window.location.href = serverURL+"/main"
})
