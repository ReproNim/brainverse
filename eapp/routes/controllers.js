module.exports = () => {

  const path = require('path')
  const fileUpload = require('express-fileupload')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')

  const jsonParser = bodyParser.json()

  app.use(fileUpload())

  app.get('/', function(req, res){
    res.render('index')
  })

  app.get('/projects/new', function(req,res){
    const loadJsonFile = require('load-json-file')
    console.log('loading Terms file')
    loadJsonFile('eapp/public/terms/addProjectTerms.json').then(ob => {
      console.log(ob)
      res.render('addProject',{json:ob})
    })
  })

  app.post('/projects/new', jsonParser, function(req, res){
    if (!req.body) return res.sendStatus(400)
    console.log('recived at server side')
    console.log(req.body)
    writeJsonFile('uploads/proj-info-test.json', req.body).then(() => {
      console.log('done')
    })
    res.send('success')
  })

  app.get('/projects/:id',function(req,res){
    res.send('project info for id'+ req.params.id)
  })

  app.post('/projects/:id', jsonParser,function(req,res){
    res.send('project info updated!')
  })

  app.get('/upload', function(req,res){
    console.log('server side')
    res.render('sampleUpload')
  })

  app.post('/upload',function(req,res){
    console.log(req.files);
    if (!req.files)
      return res.status(400).send('No files were uploaded.');

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let sampleFile = req.files.sampleFile;

      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(path.join(__dirname,'/../../uploads/',req.files.sampleFile.name), function(err) {
        if (err)
          return res.status(500).send(err)

        req.flash('success', 'file uploaded')
        res.render('index', { expressFlash: req.flash('success')})

      })
  })

  app.get('/experiments/new', function(req,res){
    res.send('TODO: create new experiment form')
  })

  app.post('/experiments/new', jsonParser,function(req,res){
    res.send('TODO:received experiments info!')
  })

  app.get('/experiments/:id',function(req,res){
    res.send('experiment info for id'+ req.params.id)
  })

  app.post('/experiments/:id', jsonParser,function(req,res){
    res.send('experiment info updated!')
  })

  app.get('/query',function(req,res){
    res.send('TODO: query is called')
  })
}
