//Adapted from https://github.com/theallmightyjohnmanning/electron-express

module.exports = () => {

  const express = require('express')
  const session = require('express-session')
  const cookieParser = require('cookie-parser')
  const bodyParser = require('body-parser')
  const flash = require('express-flash')
  const path = require('path')
  const fs = require('fs')

  app = express()

  app.use(cookieParser('secret'))
  app.use(session({cookie: { maxAge: 60000 }}))
  app.use(flash())


  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  app.use(express.static(path.join(__dirname, 'public/css')))
  app.use(express.static(path.join(__dirname, 'public/html')))
  app.use(express.static(path.join(__dirname, 'public/js')))
  app.use(express.static(path.join(__dirname, 'public/terms')))
  app.use(express.static(path.join(__dirname, 'public/lib')))
  app.use('/dist/css',express.static(path.join(__dirname,'/../node_modules/bootstrap/dist/css')))
  app.use('/dist/jquery',express.static(path.join(__dirname,'/../node_modules/jquery/dist/')))
  app.use('/dist/bootstrap',express.static(path.join(__dirname,'/../node_modules/bootstrap/dist/js')))
  app.use('/dist/select2',express.static(path.join(__dirname,'/../node_modules/select2/dist')))
  app.use('/dist/select2-bootstrap',express.static(path.join(__dirname,'/../node_modules/select2-bootstrap-theme/dist')))
  app.use('/dist/slickgrid',express.static(path.join(__dirname,'/../node_modules/slickgrid')))
  app.use('/dist/slickgrid-bootstrap',express.static(path.join(__dirname,'/../node_modules/slickgrid-bootstrap-dev/bootstrap')))
  app.use('/views/js',express.static(path.join(__dirname,'views/js')))

  // Setup Globally Included Routes
  fs.readdirSync(path.join(__dirname, 'routes')).forEach(function(filename) {
    console.log('reading routes file')
  	if(~filename.indexOf('.js'))
  		require(path.join(__dirname, 'routes/'+filename))(app)
  })

  fs.mkdir(path.join(__dirname,'/../uploads/'),function(err){
    if(err){
      console.log('directory exists. No need to create it')
    }
    fs.mkdir(path.join(__dirname,'/../uploads/dataDictionary'),function(err1){
      if(err1){
        console.log('sub-directory:dataDictionary exists. No need to create it')
      }
    })
    fs.mkdir(path.join(__dirname,'/../uploads/termforms'),function(err2){
      if(err2){
        console.log('sub-directory:termforms exists. No need to create it')
      }
    })
    fs.mkdir(path.join(__dirname,'/../uploads/acquisition'),function(err3){
      if(err3){
        console.log('sub-directory:acquistion exists. No need to create it')
      }
    })

  })

  app.listen(3000, function(){
    console.log('Example app listening on port 3000')
  })
}
