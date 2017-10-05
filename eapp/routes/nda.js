module.exports = () => {

  const path = require('path')
  //const fileUpload = require('express-fileupload')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const uuid = require('uuid-random')
  const loadJsonFile = require('load-json-file')
  const fs = require('fs')
  const moment = require('moment')


  const jsonParser = bodyParser.json()
  const rdfHelper = require('./../util/nidme-graph.js')

  global.store = app.locals.store

  //app.use(fileUpload())

  app.post('/nda/dictionaries', ensureAuthenticated,jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log('[nda/dictionaries/] Received at server side')
    //console.log(req.body)
    let term_info = req.body
    term_info['DictionaryID'] = uuid()
    console.log(term_info)
    pid = term_info['DictionaryID'].split('-')
    psname = term_info['shortName'].split(' ')
    pname = term_info['Name'].split(' ')

    let cpath = path.join(__dirname, '/../../uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
    writeJsonFile(cpath, req.body).then(() => {
      console.log('done')
      res.json({'tid': term_info['DictionaryID'], 'fid':'terms-'+ psname[0]+'-'+ pname[0] +'.json'})
    })
  })


  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }
}
