module.exports = () => {
  const path = require('path')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const loadJsonFile = require('load-json-file')
  const uuid = require('uuid-random')
  const request = require('request')
  const fs = require('fs')
  const rdfstore = require('rdfstore')

  const jsonParser = bodyParser.json()
  const rdfHelper = require('./../util/nidme-graph.js')

  global.store = app.locals.store

  /**
  New acquisition data
  **/
  app.post('/acquisitions/new', ensureAuthenticated, jsonParser, function(req,res){
    if (!req.body)
      return res.sendStatus(400)
    console.log('recieved at server side')
    let obj_info = req.body
    let pname = obj_info['Project']['Name'].split(' ')
    let jsonFile = 'exp-'+ pname[0]+'-'+ obj_info['objID'] +'.json'
    let cpath = path.join(userData, '/uploads/experimentdocs/'+ jsonFile)

    /**
    ** Writing plan to JSON document
    **/
    writeJsonFile(cpath, req.body).then(() => {
      console.log('[ProjectActivity written to JSON Document]: ', jsonFile )
    })

    //let fName = 'experiments/entity-graph-' + obj_info['experimentid'] + '.ttl'
    //let graphId = "nidm:entity-graph-" + obj_info['experimentid']
    //let fName = 'experiments/activity-graph-' + obj_info['Project']['ID'] + '.ttl'
    //let graphId = "nidm:entity-graph-" + obj_info['Project']['ProjectID']

    let fName = 'experiments/activity-graph-' + obj_info['objID'] + '.ttl'
    //let graphId = "nidm:entity-graph-" + obj_info['objID']
    let graphId = "nidm:activity-graph-" + obj_info['Project']['ID']

    let nidmg = new rdfHelper.NIDMGraph()
    //nidmg.addNDAExperiment(obj_info)
    let projectNode = nidmg.addProjectActivity(obj_info)
    let sessionNode = {}
    let taskNode = {}
    let agentNode = {}
    let acqObjNode = {}
    if(obj_info.hasOwnProperty('Session')){
      sessionNode = nidmg.addSessionActivity(obj_info,projectNode)
    }
    if(obj_info.hasOwnProperty('AcquisitionActivity')){
      taskNode = nidmg.addAcquisitionActivity(obj_info,sessionNode)
    }
    if(obj_info.hasOwnProperty('SubjectID')) {
     agentNode = nidmg.addAgent(obj_info,taskNode,sessionNode)
    }
    if(obj_info.hasOwnProperty('fields')){
      acqNode = nidmg.addAcquisitionObject(obj_info,taskNode,agentNode)
    }

    /**
    ** Saving Graph to RDF Store
    **/
    rdfHelper.saveToRDFstore(nidmg, graphId, fName, function(graphId,tstring){
      console.log("callback fn: tstring: ", tstring)
      //let cpath = path.join(__dirname, '/../../../uploads/acquisition/'+fName)
      //let cpath = path.join(userData, '/uploads/acquisition/'+fName)
      let cpath = path.join(userData, '/uploads/acquisition/'+fName)
      //fs.appendFile(cpath, tstring, function(err) {
        fs.writeFile(cpath, tstring, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
        res.json({'tid': obj_info['objID'], 'fid': fName})
      })
    })
  })



  app.get('/acquisitions/forms/:name', ensureAuthenticated, function(req,res){
    //var cpath = path.join(__dirname, '/../../../uploads/termforms/')
    var cpath = path.join(userData, '/uploads/termforms/')
    console.log('loading terms file')
    loadJsonFile(cpath + req.params.name).then(ob => {
      console.log("ob:==>", ob)
      res.json(ob)
    })
  })

  app.get('/acquisitions/forms', ensureAuthenticated, function(req, res){
    var files = []
    //var cpath = path.join(__dirname, '/../../../uploads/termforms')
    var cpath = path.join(userData, '/uploads/termforms')
    fs.readdir(cpath, function(err,list){
      if(err) throw err;
      let instList = []
      for(let i=0;i< list.length;i++){
        if(list[i]!==".DS_Store"){
          instList.push(list[i])
        }
      }
      console.log("[1-/instruments/local/list]instruments lists:---> ", instList)
      //resolve(instList)
      res.json({'list':instList})
    })
  })

  app.get('/acquisitions/local/list', ensureAuthenticated,jsonParser, function(req,res){
    let termDirPath = path.join(userData, '/uploads/experimentdocs/')
    var listOfFiles = new Promise(function(resolve){
      fs.readdir(termDirPath, function(err,list){
        if(err) throw err
        let instList = []
        for(let i=0;i< list.length;i++){
          if(list[i]!==".DS_Store"){
            instList.push(list[i])
          }
        }
        console.log("[1-/acquisitions/local/list]experiment project lists:---> ", instList)
        resolve(instList)
      })
    })
    listOfFiles.then(function(list){
      //console.log("lists: then---> ", list)
      let namesArr = list.map(function(fname){
        return loadJsonFile(path.join(userData, '/uploads/experimentdocs/'+fname))
      })
      return Promise.all(namesArr)
    }).then(function(obs){
      let nameList = []
      let recentObjs = {}
      let deleteList = []
      // Getting the chain of derivation and getting the recent version
      for(let i = 0; i< obs.length;i++){
        if(recentObjs.hasOwnProperty(obs[i]['Project'].ID)){
          recentObjs[obs[i]['Project'].ID].push(obs[i])
        }else{
          recentObjs[obs[i]['Project'].ID] = []
          recentObjs[obs[i]['Project'].ID].push(obs[i])
        }

      }
      for(var key in recentObjs){
        let ob = recentObjs[key]
        nameList.push({"Name":ob[0]['Project']['Name'],"Description": ob[0]['Project']['Description'], "ID":ob[0]['Project']['ID']})
      }
      console.log("[2-/acquisitions/local/list]experiment project lists--> ", nameList)
      res.json({"list":nameList})
    })
  })

    // api to get list of acquisitions in a data collection
    app.get('/acquisitions/local/list/:dcId', ensureAuthenticated,jsonParser, function(req,res){
        console.log("dcId: --", req.params.dcId)
        let termDirPath = path.join(userData, '/uploads/experimentdocs/')
        var listOfFiles = new Promise(function(resolve){
            fs.readdir(termDirPath, function(err,list){
                if(err) throw err
                let dcList = []
                for(let i=0;i< list.length;i++){
                    if(list[i]!==".DS_Store"){
                        dcList.push(list[i])
                    }
                }
                console.log("[1-/acquisitions/local/list/dcId]experiment project lists:---> ", dcList)
                resolve(dcList)
            })
        })
        listOfFiles.then(function(list){
            //console.log("lists: then---> ", list)
            let namesArr = list.map(function(fname){
                return loadJsonFile(path.join(userData, '/uploads/experimentdocs/'+fname))
            })
            return Promise.all(namesArr)
        }).then(function(obs){
            let recentObjs = {}
            let acqObj = {}
            // Getting the chain of derivation and getting the recent version
            for(let i = 0; i< obs.length;i++){
                if (obs[i]['Project'].ID === req.params.dcId && obs[i].hasOwnProperty('AcquisitionActivity')) { // for
                    // current data collection only
                    console.log(i, "----obs[i]-----", obs[i])
                    if(recentObjs.hasOwnProperty(obs[i]['AcquisitionActivity'].AcquisitionActivityID)){
                        var acquisitionActivityID = obs[i]['AcquisitionActivity'].AcquisitionActivityID
                        if(obs[i]['AcquisitionActivity'].Status =='completed'){

                            // obs[i]['version'] = obs[i]['Project']['version']
                            recentObjs[obs[i]['AcquisitionActivity'].AcquisitionActivityID] = []
                            recentObjs[obs[i]['AcquisitionActivity'].AcquisitionActivityID].push(obs[i])
                        }
                    }else{
                        recentObjs[obs[i]['AcquisitionActivity'].AcquisitionActivityID] = []
                        // var versionObj = {'version' : obs[i]['Project']['version']}
                        // obs[i]['version'] = obs[i]['Project']['version']
                        recentObjs[obs[i]['AcquisitionActivity'].AcquisitionActivityID].push(obs[i])
                    }
                }

            }
            acqObj[req.params.dcId] = []
            for (key in recentObjs) { // assign acquisition objects to the project id
              acqObj[req.params.dcId].push(recentObjs[key][0])
            }

            console.log("recentObjs: ", recentObjs)
            console.log("acqObj", acqObj)
            res.json(acqObj[req.params.dcId])
        })
    })

  app.get('/acquisitions/local/:dcId', ensureAuthenticated,jsonParser, function(req,res){
    console.log("dcId: --", req.params.dcId)
    let termDirPath = path.join(userData, '/uploads/experimentdocs/')
    var listOfFiles = new Promise(function(resolve){
      fs.readdir(termDirPath, function(err,list){
        if(err) throw err
        let dcList = []
        for(let i=0;i< list.length;i++){
          if(list[i]!==".DS_Store"){
            dcList.push(list[i])
          }
        }
        console.log("[1-/acquisitions/local/dcId]experiment project lists:---> ", dcList)
        resolve(dcList)
      })
    })
    listOfFiles.then(function(list){
      //console.log("lists: then---> ", list)
      let namesArr = list.map(function(fname){
        return loadJsonFile(path.join(userData, '/uploads/experimentdocs/'+fname))
      })
      return Promise.all(namesArr)
    }).then(function(obs){
      let nameList = []
      let recentObjs = {}

      // Getting the chain of derivation and getting the recent version
      for(let i = 0; i< obs.length;i++){
        console.log("----obs[i]-----", obs[i])
        if(recentObjs.hasOwnProperty(obs[i]['Project'].ID)){
          recentObjs[obs[i]['Project'].ID].push(obs[i])
        }else{
          recentObjs[obs[i]['Project'].ID] = []
          recentObjs[obs[i]['Project'].ID].push(obs[i])
        }

      }
      console.log("recentObjs: ", recentObjs)
      res.json({"list":recentObjs[req.params.dcId]})
      //res.send(recentObjs[dcId])
    })
  })

  app.get('/acquisitions/nda_forms', ensureAuthenticated, function(req, res){
    let termDirPath = path.join(userData, '/uploads/termforms/')
    var listOfFiles = new Promise(function(resolve){
      fs.readdir(termDirPath, function(err,list){
        if(err) throw err
        //console.log("lists:---> ", list)
        let instList = []
        for(let i=0;i< list.length;i++){
          if(list[i]!==".DS_Store"){
            instList.push(list[i])
          }
        }
        console.log("[1-/instruments/local/list]instruments lists:---> ", instList)
        resolve(instList)
        //resolve(list)
      })
    })
    listOfFiles.then(function(list){
      console.log("lists: then---> ", list)
      let namesArr = list.map(function(fname){
        return loadJsonFile(path.join(userData, '/uploads/termforms/'+fname))
      })
      return Promise.all(namesArr)
    }).then(function(obs){
      let nameList = []
      console.log("obs:-->", obs)
      for(let i = 0; i< obs.length;i++){
        let title = obs[i].Name.split(' ')[0]
        let fileName = 'terms-'+obs[i].shortName+'-'+title+".json"
        nameList.push({"shortName":obs[i].shortName,"title": obs[i].Name, "filename": fileName})
      }
      console.log("nameList:--> ", nameList)
      res.json({"list":nameList})
    })
  })
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }

}
