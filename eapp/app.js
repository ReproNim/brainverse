//Adapted from https://github.com/theallmightyjohnmanning/electron-express

module.exports = () => {

  const express = require('express')
  const session = require('express-session')
  const cookieParser = require('cookie-parser')
  const bodyParser = require('body-parser')
  const flash = require('express-flash')
  const path = require('path')
  const fs = require('fs')
  const rdfstore = require('rdfstore')
  const passport = require('passport')
  const methodOverride = require('method-override')
  const GitHubStrategy = require('passport-github2').Strategy
  const partials = require('express-partials')
  const config = require('./config/app-config.js')
  const rdfHelper = require('./util/graph.js')

  global.uid = {}

  const GITHUB_CLIENT_ID = config.clientId
  const GITHUB_CLIENT_SECRET = config.clientSecret

  console.log("clientId: ", GITHUB_CLIENT_ID)
  console.log("clientSecret", GITHUB_CLIENT_SECRET)

  passport.serializeUser(function(user, done) {
    //console.log("user:",user)
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    //console.log("obj",obj)
    done(null, obj);
  });
  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {

        // To keep the example simple, the user's GitHub profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the GitHub account with a user record in your database,
        // and return that user instead.
        console.log("profile:", profile)
        return done(null, profile)
      })
    }
  ))

  app = express()

  //app.use(cookieParser('secret'))
  //app.use(session({cookie: { maxAge: 60000 }}))
  app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))
  app.use(flash())


  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(partials())
  app.use(methodOverride())

  //app.use(express.static(__dirname + '/public'));

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', function(req, res){
    console.log("user from request:",req.user)
    res.render('index',{user:req.user})
  })
  app.get('/main', ensureAuthenticated, function(req, res){
    //console.log("user from request:",req.user)
    res.render('main',{user:req.user})
  })
  /*app.get('/account', ensureAuthenticated, function(req, res){
    console.log("Authenticate account: ", req.user)
    res.render('account', { user: req.user });
  })*/
  app.get('/login', function(req, res){
    console.log("Trying to login: ", req.user)
    res.render('login', { user: req.user });
  })

  app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  })

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
      //res.redirect('/')
      res.redirect('/main')
    })
  app.get('/logout', function(req, res){
    req.logout()
    res.redirect('/')
  })
  app.use('/dist/css',express.static(path.join(__dirname,'/../node_modules/bootstrap/dist/css')))
  app.use('/dist/fonts',express.static(path.join(__dirname,'/../node_modules/bootstrap/dist/fonts')))
  app.use('/dist/jquery',express.static(path.join(__dirname,'/../node_modules/jquery/dist/')))
  app.use('/dist/moment',express.static(path.join(__dirname,'/../node_modules/moment/')))
  app.use('/dist/bootstrap',express.static(path.join(__dirname,'/../node_modules/bootstrap/dist/js')))
  app.use('/dist/select2',express.static(path.join(__dirname,'/../node_modules/select2/dist')))
  app.use('/dist/select2-bootstrap',express.static(path.join(__dirname,'/../node_modules/select2-bootstrap-theme/dist')))
  app.use('/dist/slickgrid',express.static(path.join(__dirname,'/../node_modules/slickgrid')))
  app.use('/dist/slickgrid-bootstrap',express.static(path.join(__dirname,'/../node_modules/slickgrid-bootstrap-dev/bootstrap')))
  app.use('/dist/jqwidgets-framework',express.static(path.join(__dirname,'/../node_modules/jqwidgets-framework')))
  app.use('/dist/handlebars',express.static(path.join(__dirname,'/../node_modules/handlebars/dist')))
  app.use('/views/js',express.static(path.join(__dirname,'views/js')))
  app.use('/dist/alpacalib',express.static(path.join(__dirname,'/../node_modules/alpaca/dist/lib')))
  app.use('/dist/alpaca',express.static(path.join(__dirname,'/../node_modules/alpaca/dist/alpaca')))
  app.use('/dist/uuid',express.static(path.join(__dirname,'/../node_modules/uuid-random')))

  app.use(function (req, res, next) {
    if (!req.isAuthenticated()) { return res.redirect('/') }
    next();
  });

  app.use(express.static(path.join(__dirname, 'public/css')))
  app.use(express.static(path.join(__dirname, 'public/html')))
  app.use(express.static(path.join(__dirname, 'public/js')))
  app.use(express.static(path.join(__dirname, 'public/terms')))
  app.use(express.static(path.join(__dirname, 'public/lib')))
  app.use(express.static(path.join(__dirname, 'public/images')))


  app.locals.setup = rdfHelper.rdfStoreSetup()
  app.locals.store = app.locals.setup.store
  app.locals.rgraph = app.locals.setup.graph
  //console.log("app.locals:", app.locals.store, app.locals.rgraph)

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
    fs.mkdir(path.join(__dirname,'/../uploads/plansdocs'),function(err4){
      if(err4){
        console.log('sub-directory:plansdocs exists. No need to create it')
      }
    })
  })

  app.listen(3000, function(){
    console.log('Example app listening on port 3000')
  })

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }
}
