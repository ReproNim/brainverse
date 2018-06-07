let form = new AlpacaForm('#div-newInstrument')

function createInstrument(){
  $('#btn-newInstrument').remove()
  $('#div-instrumentList').remove()
  form.inputForm('Name', 'Name', 'instName', 'string', undefined, null, false)
  form.textAreaForm('Description', 'Description', 'instDescription','string', undefined, null, false)
  form.submitBtnForm('Save Instrument Information',submitAction)
  form.alpacaGen()
}

function submitAction(){
  console.log("New Instrument Being Added Action performed")
  instObj["Name"] = $("#instName").val()
  instObj["Description"] = $("#instDescription").val()
  instObj["version"]=0
  console.log("[submitAction] instObj: ", instObj)
  localStorage.setItem("instObj", JSON.stringify(instObj))
  form.alpacaDestroy()
  window.location.href = serverURL+"/instrument-editor/html/ie.html"
}


$('#btn-newInstrument').click(createInstrument)

$('#btn-back-mn').click(function(){
    window.location.href = serverURL+"/main"
})

function displayInstrumentList(){
  return new Promise(function(resolve){
    $.ajax({
      type: "GET",
      url: serverURL +"/instruments/local/list",
      accept: "application/json",
      success: function(data){
        console.log('instruments list received :success', data)
        let iforms = data.list
        if(iforms.length == 0){
          console.log("no forms to display")
          resolve([])
        }else{
          resolve(iforms)
        }
      }
    })
  })
}

displayInstrumentList().then(function(instrumentList){
  var values = instrumentList.map(function(instrument){
    return new Promise(function(resolve){
      let url = serverURL+"/instruments/local/" + instrument.shortName
      $.ajax({
        type: "GET",
        url: url,
        accept: "application/json",
        success: function(data){
          console.log('instrument term received :success', data)
          resolve(data)
        }//data
      })
    })
  })
  return Promise.all(values)
}).then(function(instObjs){
  console.log("all inst obj: ", instObjs)
  if(instObjs.length !== 0){
    $('#div-instrumentList').append('<table class="table table-striped hand" id="tab1"></table>')
    let instTable = document.getElementById("tab1")
    var header = instTable.createTHead()
    var rowH = header.insertRow(0)
    var cellH = rowH.insertCell(0)
    var cellD = rowH.insertCell(1)
    cellH.innerHTML = "<b>Instrument Name</b>";
    cellD.innerHTML = "<b>Description</b>"
    for (let i=0;i<instObjs.length;i++){
      let row = instTable.insertRow(i+1)
      console.log("instObjs[i]: ", instObjs[i])
      let instObj1 = instObjs[i]
      let cell0 = row.insertCell(0)
      let cell1 = row.insertCell(1)
        console.log("instrument name: ", instObj["Name"])
      cell0.innerHTML = instObj1["Name"]
      cell1.innerHTML = instObj1["Description"]
      row.addEventListener("click",function(e){
        var target = e.target;
        if ( target.nodeName != 'TD' )
          return;
        var columns = target.parentNode.getElementsByTagName( 'td' );
        for ( var i = columns.length; i-- ; ){
          let instNameObj = localStorage.getItem(columns[ i ].innerHTML)
          if(instNameObj != null){
            localStorage.setItem("instObj",instNameObj)
            window.location.href = serverURL+"/instrument-editor/html/ie.html"
          }
        }
      })
      localStorage.setItem(instObj1["Name"], JSON.stringify(instObj1))
    }
  }
})
