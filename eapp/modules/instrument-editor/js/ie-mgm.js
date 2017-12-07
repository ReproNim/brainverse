let form = new AlpacaForm('#div-newInstrument')

function createInstrument(){
  $('#btn-newInstrument').remove()
  $('#div-instrumentList').remove()
  form.inputForm('Instrument Name', 'Instrument Name', 'instName', 'string', undefined, null, false)
  form.textAreaForm('Description', 'Description', 'instDescription','string', undefined, null, false)
  form.submitBtnForm('Save Instrument Information',submitAction)
  form.alpacaGen()
}

function submitAction(){
  console.log("New Instrument Being Added Action performed")
  instObj["Instrument Name"] = $("#instName").val()
  instObj["Description"] = $("#instDescription").val()
  instObj["version"]=0
  console.log("[submitAction] instObj: ", instObj)
  localStorage.setItem("instObj", JSON.stringify(instObj))
  form.alpacaDestroy()
  window.location.href = serverURL+"/instrument-editor/html/ie.html"
}

$('#btn-newInstrument').click(createInstrument)
