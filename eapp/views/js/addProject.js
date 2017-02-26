   // Save the project information entered and the selected fields
  // The information is saved in a local file named 'proj-info.json'
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

    console.log('done')
  }
    
