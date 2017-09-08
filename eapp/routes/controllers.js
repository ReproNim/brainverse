module.exports = () => {

  const path = require('path')
  const fileUpload = require('express-fileupload')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const uuid = require('uuid-random')
  const loadJsonFile = require('load-json-file')
  const fs = require('fs')
  const moment = require('moment')


  const jsonParser = bodyParser.json()
  const rdfHelper = require('./../util/nidme-graph.js')

  global.store = app.locals.store

  app.use(fileUpload())

  app.get('/account', ensureAuthenticated, function(req,res){
    res.send({'user':req.user})
  })

  app.post('/projects/new', ensureAuthenticated, jsonParser, function(req, res){
    if (!req.body) return res.sendStatus(400)
    console.log('recived at server side')
    //console.log(req.body)
    let pj_info = req.body
    pj_info['ProjectID'] = uuid()
    console.log(pj_info)
    pid = pj_info['ProjectID'].split('-')
    pname = pj_info['Name'].split(' ')
    let cpath = 'uploads/proj-info-'+ pname[0]+'-'+ pid[0] +'.json'
    writeJsonFile(cpath, req.body).then(() => {
      console.log('done')
      res.json({'status':'success'})
    })
  })

  app.get('/projects/:id', ensureAuthenticated, function(req,res){
    res.send('TODO: project info for id:'+ req.params.id)
  })

  app.post('/projects/:id', ensureAuthenticated, jsonParser,function(req,res){
    res.send('TODO: project info updated!')
  })

  app.get('/projects/list', ensureAuthenticated, function(req,res){
    res.send('TODO: projects list')
  })

  app.get('/upload', ensureAuthenticated, function(req,res){
    console.log('server side')
    res.render('sampleUpload')
  })

  app.post('/upload',ensureAuthenticated, function(req,res){
    console.log(req.files);
    if (!req.files)
      return res.status(400).send('No files were uploaded.');

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let sampleFile = req.files.sampleFile;

      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(path.join(__dirname,'/../../uploads/',req.files.sampleFile.name), function(err) {
        if (err)
          return res.status(500).send(err)
        res.json({'status': 'success'})
      })
  })

  app.get('/experiments/new', ensureAuthenticated, function(req,res){
    res.send('TODO: create new experiment form')
  })

  app.post('/experiments/new', ensureAuthenticated, jsonParser,function(req,res){
    res.send('TODO:received experiments info!')
  })

  app.get('/experiments/:id',ensureAuthenticated, function(req,res){
    res.send('TODO:experiment info for id'+ req.params.id)
  })

  app.post('/experiments/:id', ensureAuthenticated, jsonParser,function(req,res){
    res.send('TODO:experiment info updated!')
  })

  app.get('/query/terms', ensureAuthenticated,function(req,res){
    const loadJsonFile = require('load-json-file')
    console.log('loading Terms file')
    loadJsonFile(path.join(__dirname, '/../public/terms/addProjectTerms.json')).then(ob => {
      console.log(ob)
      res.json(ob)
    })
  })

  app.get('/query/instruments', ensureAuthenticated, function(req,res){
    const loadJsonFile = require('load-json-file')
    console.log('loading Terms file')
    loadJsonFile(path.join(__dirname, '/../public/terms/instrumentsTerms.json')).then(ob => {
      console.log(ob)
      res.json(ob)
    })
  })

  app.post('/project-plans/new',ensureAuthenticated, jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log('[Recieved at server side]: ',req.body)

    let pj_plan_info = req.body
    pj_plan_info['ProjectPlanID'] = uuid()
    console.log("[Project Plan Info]: ", pj_plan_info)

    let pname = pj_plan_info['Project Name'].split(' ')
    let jsonFile = 'plan-'+ pname[0]+'-'+ pj_plan_info['ProjectPlanID'] +'.json'
    let cpath = path.join(__dirname, '/../../uploads/plansdocs/'+ jsonFile)
    /**
    ** Writing plan to JSON document
    **/
    writeJsonFile(cpath, req.body).then(() => {
      console.log('[Plan written to JSON Document]: ', jsonFile )
    })

    let fName = 'plans/plan-graph-' + pj_plan_info['ProjectPlanID'] + '.ttl'
    let graphId = "nidm:plan-graph-" + pj_plan_info["ProjectPlanID"]
    let nidmg = new rdfHelper.NIDMGraph()
    nidmg.addPlan(pj_plan_info)
    /**
    ** Saving Graph to RDF Store
    **/
    rdfHelper.saveToRDFstore(nidmg, graphId, fName, function(graphId,tstring){
      console.log("savetTRDF callback fn: tstring: ", tstring)
      let cpath = path.join(__dirname, '/../../uploads/acquisition/'+fName)
      fs.appendFile(cpath, tstring, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("[The graph was serialized to Turtle file and was saved!]: ",fName );
        res.json({'pid': pj_plan_info['ProjectPlanID'], 'fid': fName})
      })
    })
  })

  app.put('/project-plans/:id', ensureAuthenticated, jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log("update obj received at server:", req.body)

    let pj_plan_info = req.body
    let previousProjectPlanID = pj_plan_info['ProjectPlanID']
    let previousVersion = pj_plan_info['version']
    pj_plan_info['ProjectPlanID'] = uuid()
    pj_plan_info['created'] = moment().format()
    pj_plan_info['wasDerivedFrom'] = previousProjectPlanID
    pj_plan_info['version'] = previousVersion + 1
    console.log("pj_plan_info: ", pj_plan_info)

    let pname = pj_plan_info['Project Name'].split(' ')

    let cpath = path.join(__dirname, '/../../uploads/plansdocs/plan-'+ pname[0]+'-'+pj_plan_info['ProjectPlanID'] +'.json')
    console.log("cpath for file update: ", cpath)
    writeJsonFile(cpath, req.body).then(() => {
      console.log('json document written done')
    })
    var nidmg = new rdfHelper.NIDMGraph()
    nidmg.addPlan(pj_plan_info)

    let fName = 'plans/plan-graph-' + pj_plan_info['ProjectPlanID'] + '.ttl'
    let graphId = "nidm:plan-graph-" + pj_plan_info["ProjectPlanID"]
    rdfHelper.saveToRDFstore(nidmg, graphId, fName, function(graphId,tstring){
      console.log("[saveToRDF callback fn: tstring] : ", tstring)

      let cpath = path.join(__dirname, '/../../uploads/acquisition/' + fName)

      fs.appendFile(cpath, tstring, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("[The new updated turtle file was saved!]");
        res.json({'pid': pj_plan_info['ProjectPlanID'], 'fid': fName})
      })
    })
  })


  app.get('/project-plans/:name', ensureAuthenticated, function(req,res){
    console.log('loading project-plan file:',req.params.name )
    loadJsonFile(path.join(__dirname, '/../../uploads/plansdocs/'+req.params.name)).then(ob => {
      console.log("ob:==>", ob)
      res.json(ob)
    })
  })
  app.get('/project-plans', ensureAuthenticated, function(req, res){
    var listOfGraphs = new Promise(function(resolve){
        store.registeredGraphs(function(results, graphs) {
          var values = []
          for (var i = 0; i < graphs.length; i++) {
            values.push(graphs[i].valueOf())
          }
          resolve(values)
        })
    })
    listOfGraphs.then(function(values){
        console.log("Registered graphs: ", values)
        var graphOfPromises = values.map(function(graph){
          return new Promise(function(resolve){
            store.execute(queryFunction("<"+graph+">"), function(err,results){
              console.log("graph: ", graph, "  results: \n", results)
              if(results == []){
                resolve({})
              }else{
              resolve({
                "origin":results[0].s.value,
                "derivedFrom":results[0].derivedFrom.value,
                "date":results[0].date.value,
                "pjname":results[0].pjname.value
              })
            }
            })//execute
          })//promise
        })//graph of promises
        return Promise.all(graphOfPromises)
    }).then(function(obj){
        console.log("obj:", obj)
        let unique = []
        if(obj != {}){
          for(i=0;i<obj.length;i++){
            let flag = true
            for(j=0;j<obj.length;j++){
              if(obj[i]["origin"] === obj[j]["derivedFrom"]){
                flag = false
                break;
              }
            }
            if(flag){
              unique.push(obj[i])
            }
          }
        }
        console.log("unique array", unique)
        let list = []
        for(i=0;i<unique.length;i++){
          let parr = unique[i]["origin"].split("#")
          let pf = parr[1].split("_")[1]
          list.push("plan-"+unique[i]["pjname"]+"-"+pf+".json")
        }
        console.log("list: ", list)
        res.json({'list':list})
    }).catch(function(error){
      console.log("error:", error)
    })
  })

  app.get('/history/project-plans/:name', ensureAuthenticated, function(req,res){
    var listOfGraphs = new Promise(function(resolve){
        store.registeredGraphs(function(results, graphs) {
          var values = []
          for (var i = 0; i < graphs.length; i++) {
            values.push(graphs[i].valueOf())
          }
          console.log("Registered graphs: ", values)
          resolve(values)
        })
      })
    listOfGraphs.then(function(values){
          var graphOfPromises = values.map(function(graph){
            return new Promise(function(resolve){
              store.execute(queryFunction("<"+graph+">"), function(err,results){
                resolve({
                  "origin":results[0].s.value,
                  "derivedFrom":results[0].derivedFrom.value,
                  "date":results[0].date.value,
                  "pjname":results[0].pjname.value
                })
              })//execute
            })//promise
          })//graph of promises
          return Promise.all(graphOfPromises)
    }).then(function(objArr){
        let unique = {}
        let obj = {}
        for(i=0;i<objArr.length;i++){
          let flag = true
            for(j=0;j<objArr.length;j++){
            if(objArr[i]["origin"] === objArr[j]["derivedFrom"]){
              flag = false
              break;
            }
          }
          if(flag){
            unique[objArr[i]["origin"]] = objArr[i]
          }
          obj[objArr[i]["origin"]] = objArr[i]
        }
        console.log("unique obj", unique)
        console.log("obj: ~~~", obj)
        let dirGraph = {}
        for(k of Object.keys(unique)){
          let list=[]
          let node = obj[k]
          let i = 0
          console.log("key", k);
          console.log("node: ", node["derivedFrom"])
          let parent = node["derivedFrom"]
          while(parent != "http://purl.org/nidash/nidm#plan_None"){
            list[i] = node
            node = {}
            node = obj[parent]
            console.log("node: ", node["derivedFrom"])
            parent = node["derivedFrom"]
            i++
          }
          list[i] = node
          dirGraph[obj[k]["origin"]] = list
        }
        let name = req.params.name
        let history = []
        for(m of Object.keys(dirGraph)){
          let parr = m.split("#")
          let pf = parr[1].split("_")[1]
          name1 = "plan-"+ dirGraph[m][0]["pjname"]+"-"+pf+".json"
          console.log("name: ", name, " name1: ", name1, " dirgraph: ", dirGraph[m][0]["pjname"])
          if(name == name1){
            history = dirGraph[m]
          }
        }
         res.json(history)
        //res.json(dirGraph)
    }).catch(function(error){
    console.log(error)
  })

  })

  app.post('/query',jsonParser,function(req,res){
    res.send('TODO: query is called')
  })

  app.get('/queries', function(req,res){
    res.send('TODO:Queries list')
  })
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }


  function queryFunction(graphId){
    let query = 'PREFIX prov:<http://www.w3.org/ns/prov#>\
    PREFIX nidm:<http://purl.org/nidash/nidm#> \
    PREFIX dc:<http://purl.org/dc/terms/> \
    SELECT * \
    FROM NAMED '+ graphId + '\
    {GRAPH '+graphId+'{ ?s prov:wasDerivedFrom ?derivedFrom ; \
      nidm:ProjectName ?pjname; \
      dc:created ?date.\
    } }'
    return query
  }
}
