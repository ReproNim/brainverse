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
  const rdfHelper = require('./util/nidme-graph.js')



  global.uid = {}
  global.github_token = ""

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
        console.log("accessToken: ", accessToken)
        github_token = accessToken
        console.log("profile: ", profile)
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
  passport.authenticate('github', { scope: [ 'user:email','repo'] }),
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

  app.use(express.static(path.join(__dirname, 'public/')))
  app.use(express.static(path.join(__dirname, 'modules/')))

  app.locals.setup = {}
  app.locals.store = {}
  // Setup Globally Included Routes
  fs.readdirSync(path.join(__dirname, 'routes')).forEach(function(filename) {
    console.log('reading routes file')
  	if(~filename.indexOf('.js'))
  		require(path.join(__dirname, 'routes/'+filename))(app)
  })

 /**
 ** TODO Create a directory structure specified on a default configuration file
 **/
 const dirPaths = config.dirPaths
  new Promise(function(resolve){
    console.log("paths list: ",dirPaths[0])
    console.log("userData path: ", userData)
    console.log("full path: ", path.join(userData,dirPaths[0]))
    fs.stat(path.join(userData,dirPaths[0]), function(err,stat){
      if(err){
        for(let i=0;i<config.dirPaths.length;i++){
          console.log("paths: ",dirPaths[i])
          fs.mkdirSync(path.join(userData,dirPaths[i]))
        }
      }
    resolve()
    })
  }).then(function(){
    setup = rdfHelper.rdfStoreSetup()
    store = setup.store
  })

  app.listen(3000, function(){
    console.log('Example app listening on port 3000')
  })

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }
}
