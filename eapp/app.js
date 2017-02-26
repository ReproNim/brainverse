module.exports = () => {

  const express = require('express')
  const fileUpload = require('express-fileupload')
  const session = require('express-session')
  const cookieParser = require('cookie-parser')
  const flash = require('express-flash')
  const path = require('path')

  app = express()

  app.use(fileUpload())
  app.use(cookieParser('secret'))
  app.use(session({cookie: { maxAge: 60000 }}))
  app.use(flash())


  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  app.use(express.static(path.join(__dirname, 'public/css')))
  app.use(express.static(path.join(__dirname, 'public/terms')))
  app.use('/dist/css',express.static(path.join(__dirname,'/../node_modules/bootstrap/dist/css')))
  app.use('/dist/jquery',express.static(path.join(__dirname,'/../node_modules/jquery/dist/')))
  app.use('/dist/bootstrap',express.static(path.join(__dirname,'/../node_modules/bootstrap/dist/js')))
  app.use('/views/js',express.static(path.join(__dirname,'views/js')))


  app.get('/', function(req, res){
    res.render('index')
  })


  app.get('/addProject', function(req,res){
  const loadJsonFile = require('load-json-file')
  console.log('loading terms file')
  loadJsonFile('eapp/public/terms/addProjectTerms.json').then(ob => {
    console.log(ob)
    res.render('addProject',{json:ob})
  })
})

  app.get('/projects/new', function(req,res){
    console.log('server side')
    //res.send('Hello World')
    res.render('sampleUpload')
  })

  app.post('/projects/new',function(req,res){
    console.log(req.files);
    if (!req.files)
      return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(path.join(__dirname,'/uploads/',req.files.sampleFile.name), function(err) {
      if (err)
        return res.status(500).send(err)

    req.flash('success', 'file uploaded')
    res.render('index', { expressFlash: req.flash('success')})

    })
  })


  app.get('/query',function(req,res){
    res.send('query is called')
  })

  app.listen(3000, function(){
    console.log('Example app listening on port 3000')
  })
}
