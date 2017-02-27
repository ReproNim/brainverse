   // Save the project information entered and the selected fields
  // The information is saved in a local file named 'proj-info.json'
  //const remote = require('electron').remote
  //const path = require('path')
  //const url = require('url')

  //let bwin = remote.getCurrentWindow()
  let chkboxSelectedArray = []
  let saveObj = {}

  function saveProjInfo(){
    console.log(local_count)
    console.log(local_json)
    for (let i=1; i<2; i++){
      if(document.getElementById("projfield-" + i).checked){
        console.log(document.getElementById("projfield-"+ i).checked)
        chkboxSelectedArray.push(document.getElementById("projfield-"+ i).value)
      } else{
        console.log("checkbox is not selected")
      }
    }
    console.log(chkboxSelectedArray)

    //Save the data entered
    saveObj["Name"] = document.getElementById("proj-name").value
    saveObj["Description"] = document.getElementById("proj-desc").value
    saveObj["fields"] = chkboxSelectedArray

    $.ajax({
      type: "POST",
      url: "http://localhost:3000/projects/new",
      contentType: "application/json",
      data: JSON.stringify(saveObj),
      success: function(data){
        console.log('success')
        $("#saveMessage").append("<p> Your Project Information Saved!</p>")
      }
      })
    //bwin.loadURL('http://localhost:3000')
    console.log('done')
  }
