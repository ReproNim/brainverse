module.exports = () => {

  const path = require('path')
  const fileUpload = require('express-fileupload')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const uuid = require('uuid-random')
  const loadJsonFile = require('load-json-file')
  const fs = require('fs')


  const jsonParser = bodyParser.json()
  const rdfHelper = require('./../util/graph.js')

  global.store = app.locals.store
  global.rgraph = app.locals.rgraph

  app.use(fileUpload())

  /*app.get('/', function(req, res){
    res.render('index')
  })*/

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
    console.log('recived at server side')
    //console.log(req.body)
    let pj_plan_info = req.body
    pj_plan_info['ProjectPlanID'] = uuid()
    console.log(pj_plan_info)
    pid = pj_plan_info['ProjectPlanID'].split('-')
    pname = pj_plan_info['Project Name'].split(' ')
    let cpath = path.join(__dirname, '/../../uploads/plansdocs/proj-plan-'+ pname[0]+'-'+ pid[0] +'.json')

    writeJsonFile(cpath, req.body).then(() => {
      console.log('done')
      //res.json({'status':'success', 'plan_id':'proj-plan-'+ pname[0]+'-'+ pid[0] +'.json'})
    })
    let obj_info = pj_plan_info
    //obj_info['objID'] = uuid()
    rdfHelper.saveToRDFstore(obj_info,function(tstring){
      console.log("callback fn: tstring: ", tstring)

      let cpath = path.join(__dirname, '/../../uploads/acquisition/plan-graph-' + obj_info['ProjectPlanID'] + '.ttl')
      let fname = 'plan-graph-' + obj_info['ProjectPlanID'] + '.ttl'

      fs.appendFile(cpath, tstring, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
        res.json({'pid': obj_info['ProjectPlanID'], 'fid': fname})
      })
    })
  })

  app.put('/project-plans/:id', ensureAuthenticated, jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log('recived at server side')
    //console.log(req.body)
    let pj_plan_info = req.body
    //pj_plan_info['ProjectPlanID'] = uuid()
    console.log(pj_plan_info)
    pid = pj_plan_info['ProjectPlanID'].split('-')
    pname = pj_plan_info['Project Name'].split(' ')
  //  let cpath = 'uploads/plansdocs/proj-plan-'+ pname[0]+'-'+ pid[0] +'.json'
    let cpath = path.join(__dirname, '/../../uploads/plansdocs/proj-plan-'+ pname[0]+'-'+ pid[0] +'.json')
    console.log("cpath for file update: ", cpath)
    writeJsonFile(cpath, req.body).then(() => {
    //fs.writeFile(cpath, JSON.stringify(pj_plan_info,null,2), (err) => {
      console.log('json document written done')
      //res.json({'status':'success', 'plan_id':'proj-plan-'+ pname[0]+'-'+ pid[0] +'.json'})
    })
    let obj_info = pj_plan_info
    obj_info['objID'] = uuid()
    rdfHelper.saveToRDFstore(obj_info,function(tstring){
      console.log("callback fn: tstring: ", tstring)

      let cpath = path.join(__dirname, '/../../uploads/acquisition/plan-graph-' + obj_info['ProjectPlanID'] + '.ttl')
      let fname = 'plan-graph-' + obj_info['ProjectPlanID'] + '.ttl'

      fs.appendFile(cpath, tstring, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
        res.json({'pid': obj_info['ProjectPlanID'], 'fid': fname})
      })
    })
  })


  app.get('/project-plans/:name', ensureAuthenticated, function(req,res){
    console.log('loading project-plan file')
    loadJsonFile(path.join(__dirname, '/../../uploads/plansdocs/'+req.params.name)).then(ob => {
      console.log("ob:==>", ob)
      res.json(ob)
    })
  })
  app.get('/project-plans', ensureAuthenticated, function(req, res){
    var files = []
    fs.readdir(path.join(__dirname, '/../../uploads/plansdocs'), function(err,list){
      if(err) throw err;
      res.json({'list':list})
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
}
