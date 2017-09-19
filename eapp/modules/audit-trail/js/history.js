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
      $("#timeline").empty()
      let list = []
      for(i=0;i<data.length;i++){
        let parr = data[i]["origin"].split("#")
        let pf = parr[1].split("-")[0].split("_")
        let fname = "proj-plan-"+data[i]["pjname"]+"-"+pf[1]+".json"
        data[i]["filename"]= fname
        data[i]["version"] = data.length-1-i
      }
      console.log("data:", data)
      let htmlstr = createHTMLDisplay(data)
      $("#timeline").append(htmlstr)
      svg.selectAll("*").remove()
      
      let d3json=convertDataToD3(data)
      //console.log("d3json: ", d3json)
      //d3.json(d3json, function(error,flare) {
      //  if (error) throw error;

        root = d3json
        root.x0 = height / 2;
        root.y0 = 0;

        function collapse(d) {
          if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
          }
        }

        root.children.forEach(collapse);
        update(root);
      //});
      //d3.select(self.frameElement).style("height", "800px")
    }
  })

})

function createHTMLDisplay(data){
  let htmlstr = '<ol>'
  for(i=0;i<data.length-1;i++){
    htmlstr = htmlstr+ '<li>'+ data[i]["filename"]+ '  created from: '+ data[i+1]["filename"]+'</li>'
  }
  htmlstr = htmlstr + '</ol>'
  return htmlstr
}

function convertDataToD3(data){
  let d3json={}
  let dl = data.length
  let obj1 = {}
  for(i=dl-1;i>-1;i--){
    let obj={}
    let d={}
    if(i==(dl-1)){
      obj["name"]= data[dl-1-i]["filename"]
      obj["children"]=[{"name": data[dl-1-i]["date"]}]
      //d["name"]=data[dl-1-i]["date"]
      //obj["children"].push(d["date"])
    }else{
      obj["name"]= data[dl-1-i]["filename"]
      obj["children"]= [obj1,{"name": data[dl-1-i]["date"]}]
      //d["name"]=data[dl-1-i]["date"]
      //obj["children"].push(d["date"])
    }
    obj1 = obj
    //console.log("obj1: ",obj1)
  }

  return obj1
}
function exploreFile(name){
  let url = serverURL+"/project-plans/" + formName
  let planJson = null
    $.ajax({
      type: "GET",
      url: url,
      accept: "application/json",
      success: function(data){
        console.log('acquisitions term forms:success', data)
      }//data
    })
}
