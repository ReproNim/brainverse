window.$ = window.jQuery = require('jquery')
const bootstrap = require('bootstrap')
const loadJsonFile = require('load-json-file')
const writeJsonFile = require('write-json-file')

const remote = require('electron').remote
const path = require('path')
const url = require('url')

let bwin = remote.getCurrentWindow()

let count = 1
let chkboxSelectedArray = []
let saveObj = {}

//Read from a local static JSON file with a limited set of lexicons
//TODO Read and parse a turtle/owl file with all lexicons
loadJsonFile('src/addProjectTerms.json').then(json => {
  console.log(json)
  let termsKey = Object.keys(json)
    
  for (let i=0;i<termsKey.length;i++){
    if(termsKey[i] == "Project Information"){
      for (let j=0; j<json["Project Information"].length; j++){
        $("#div-projectFields").append('<div class="form-check"><label class="form-check-label">\
        <input class="form-check-input" type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ json["Project Information"][j] +'">\
        '+ json["Project Information"][j] +'</label></div>')
        count++
      }
    } else{
        $("#div-projectFields").append('<div class="form-check"><label class="form-check-label">\
        <input class="form-check-input" type="checkbox" name="projfield-checkbox" id="projfield-'+ count +'" value="'+ termsKey[i] +'">\
        '+ termsKey[i] +'</label></div>')
        count++
      }
    }
  }
)

// Save the project information entered and the selected fields
// The information is saved in a local file named 'proj-info.json'
function saveProjInfo(){
  for (let i=1; i<count; i++){
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
  writeJsonFile('proj-info.json', saveObj).then(() => {
    console.log('done');
  });

  // Redirects to next page to let users fill up information for the selected fields
  //TODO reference to another html rather than index.html
  bwin.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
}
