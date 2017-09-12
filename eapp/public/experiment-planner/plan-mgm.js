let form = new AlpacaForm('#div-newPlan')
let serverURL = "http://127.0.0.1:3000"
let planObj = {}

function createPlan(){
  $('#btn-newPlan').remove()
  form.inputForm('Name', 'Name', 'planName', 'string', undefined, null, false)
  form.textAreaForm('Description', 'Description', 'planDescription','string', undefined, null, false)
  form.submitBtnForm('Save Plan',sAction)
  form.alpacaGen()
  $('#div-newPlan').append()
}

function sAction(){
  console.log("Action performed")
  planObj["Name"] = $("#planName").val()
  planObj["Description"] = $("#planDescription").val()
  console.log("planObj: ", planObj)
  localStorage.setItem("newPlanObj", JSON.stringify(planObj))
  form.alpacaDestroy()
  window.location.href = serverURL+"/plan-board.html"
}
$('#btn-newPlan').click(createPlan)
