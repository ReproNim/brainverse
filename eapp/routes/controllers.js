module.exports = () => {

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
}
