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
    obj_info['objID'] = uuid()

    let fName = 'experiments/entity-graph-' + obj_info['experimentid'] + '.ttl'
    let graphId = "nidm:entity-graph-" + obj_info['experimentid']
    let nidmg = new rdfHelper.NIDMGraph()
    nidmg.addNDAExperiment(obj_info)
    /**
    ** Saving Graph to RDF Store
    **/
    rdfHelper.saveToRDFstore(nidmg, graphId, fName, function(graphId,tstring){
      console.log("callback fn: tstring: ", tstring)
      //let cpath = path.join(__dirname, '/../../../uploads/acquisition/'+fName)
      let cpath = path.join(userData, '/uploads/acquisition/'+fName)
      fs.appendFile(cpath, tstring, function(err) {
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
      res.json({'list':list})
    })
  })

  app.get('/acquisitions/nda_forms', ensureAuthenticated, function(req, res){
    let termDirPath = path.join(userData, '/uploads/termforms/')
    var listOfFiles = new Promise(function(resolve){
      fs.readdir(termDirPath, function(err,list){
        if(err) throw err
        //console.log("lists:---> ", list)
        resolve(list)
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
