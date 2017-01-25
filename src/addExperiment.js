window.$ = window.jQuery = require('jquery')
const bootstrap = require('bootstrap')

const remote = require('electron').remote
const {dialog} = require('electron').remote

const writeJsonFile = require('write-json-file')
const path = require('path')
const url = require('url')
const fs = require('fs')

let bwin = remote.getCurrentWindow()
let templateSelected = ''
let saveObj = {}

$(document).ready(function(){
  fs.readdir(__dirname+'/templates', function(err, files){
    console.log(files)
    for (let i = 0; i <files.length; i++){
      $("#expmt-template").append('<option id="expmt-'+ i +'" value='+files[i]+'>'+ files[i] +'</option>')
    }
  })

  $("#expmt-template").on('change',function(){
    templateSelected = $("#expmt-template").val()
  })
})

// Save the experiment information entered and the selected fields
// The information is saved in a local file named 'expmt-info.json'
function saveExpmtInfo(){
   console.log(templateSelected)

  //Save the data entered
  saveObj["Title"] = $("#expmt-title").val()
  saveObj["Hypothesis"] = $("#expmt-hypo").val()
  saveObj["Description"] = $("#expmt-desc").val()
  saveObj["Template"] = templateSelected
  writeJsonFile('expmt-info.json', saveObj).then(() => {
    console.log('done');
  });

  // Redirects to next page to let users fill up further information
  //TODO reference to another html rather than index.html
  bwin.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
}

function browseFilePath(){
  dialog.showOpenDialog(function (fileNames) {
  let fileName = fileNames[0]
  console.log(path.basename(fileName))
  $("#fileSelected").empty().append('<h6>'+path.basename(fileName)+'<h6>')
  templateSelected = fileName
  })
}
