module.exports = () => {

  const path = require('path')
  const fileUpload = require('express-fileupload')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const uuid = require('uuid-random')
  const request = require('request')


  const jsonParser = bodyParser.json()
  let ndarUrl = "https://ndar.nih.gov/api/datadictionary/v2/datastructure"

  app.get('/ndar-categories', function(req, res){
    let url = ndarUrl + "/categories"
    request.get({url:url,headers:{'accept':'application/json'}}, function(err, resn, body){
      //console.log(body)
      res.send(body)
    })
  })

  app.get('/ndar-types', function(req, res){
    let url = ndarUrl + "/types"
    request.get({url:url,headers:{'accept':'application/json'}}, function(err, resn, body){
      //console.log(body)
      res.send(body)
    })
  })

  app.get('/ndar-sources', function(req, res){
    let url = ndarUrl + "/sources"
    request.get({url:url,headers:{'accept':'application/json'}}, function(err, resn, body){
      //console.log(body)
      res.send(body)
    })
  })

  app.post('/ndar-terms/forms', jsonParser, function(req,res){
    //let url = ndarUrl + "?type=Clinical%20Assessments&source=NDAR&category=Demographics"
    let url = ndarUrl + "?type=" + encodeURI(req.body['type'])+ "&source="+ encodeURI(req.body['source']) + "&category=" + encodeURI(req.body['category'])
    request.get({url:url,headers:{'accept':'application/json'}}, function(err, resn, body){
    //  console.log(body)
      res.send(body)
    })
  })

  app.get('/ndar-terms/:shortName', function(req,res){
    let url = ndarUrl + "/" + req.params.shortName
    console.log(url)
    request.get({url:url,headers:{'accept':'application/json'}}, function(err, resn, body){
      //console.log(body)
      res.send(body)
    })
  })


}
