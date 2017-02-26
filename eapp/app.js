//Adapted from https://github.com/theallmightyjohnmanning/electron-express

module.exports = () => {

  const express = require('express')
  //const fileUpload = require('express-fileupload')
  const session = require('express-session')
  const cookieParser = require('cookie-parser')
  const flash = require('express-flash')
  const path = require('path')
  const fs = require('fs')

  app = express()

  //app.use(fileUpload())
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

  // Setup Globally Included Routes
  fs.readdirSync(path.join(__dirname, 'routes')).forEach(function(filename) {
    console.log('reading routes file')
  	if(~filename.indexOf('.js'))
  		require(path.join(__dirname, 'routes/'+filename))(app)
  })

  app.listen(3000, function(){
    console.log('Example app listening on port 3000')
  })
}
