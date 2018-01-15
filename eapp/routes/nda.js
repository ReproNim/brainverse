module.exports = () => {

  const path = require('path')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const uuid = require('uuid-random')
  const loadJsonFile = require('load-json-file')
  const fs = require('fs')
  const moment = require('moment')
  const request = require('request')
  const jsonParser = bodyParser.json()
  const rdfHelper = require('./../util/nidme-graph.js')

  global.store = app.locals.store

  function promiseRequest(options){
    return new Promise(function(resolve, reject){
      request.get(options, function(err, resn, body){
        console.log("response-->", resn.statusCode)
        console.log("typeof (body): ", typeof(body))
        if(typeof(body)==='string'){
          resolve(JSON.parse(body))
        }else{
          resolve(body)
        }
      })
    })
  }
  function setOptionsContents(rpath, acceptType, github_token){
    let options = {
      url: rpath,
      headers:{
        'User-Agent':'brainverse',
        'Authorization': 'token '+ github_token,
        'accept':acceptType
      }
    }
    return options
  }
  function getMetaInfoGithub(dataD){
    let nameList = []
    console.log("getMetaInfoGithub:dataD:-->")
    for(let i = 0; i<dataD.length;i++){
      let pid = dataD[i].DictionaryID.split('-')
      let psname = dataD[i].shortName.split(' ')
      let pname = dataD[i].Name.split(' ')
      nameList.push({"shortName":dataD[i].shortName,"title":dataD[i].Name, "author":dataD[i].author})
      //let cpath = path.join(__dirname, '/../../../uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
      let cpath = path.join(userData, '/uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
      writeJsonFile(cpath,dataD[i]).then(() => {
        console.log('data dictionary saved: ', cpath)
      })
    }
    return nameList
  }
  app.get('/nda/dictionaries/github', ensureAuthenticated, jsonParser, function(req,res){
    let url = 'https://api.github.com/'
    let rpath = url+'repos/'+req.user.username+'/ni-terms/contents'
    let options = setOptionsContents(rpath, 'application/json', github_token)
    promiseRequest(options).then(function(fileListInRepo){
      let filesInfo = []
      //let gitFilesInfo = JSON.parse(fileListInRepo)
      let gitFilesInfo = fileListInRepo
      for(let i = 0; i<gitFilesInfo.length; i++){
        if(gitFilesInfo[i].name !== 'README.md'){
          filesInfo.push(gitFilesInfo[i].path)
        }
      }
      console.log("fileName list: ", filesInfo)
      let gitObj = {}
      let nameList = []
      var arr = filesInfo.map(function(filePath) {
        let rpath = url+'repos/'+req.user.username+'/ni-terms/contents/'+filePath
        let options_download = setOptionsContents(rpath,'application/vnd.github.v3.raw',github_token)
        return promiseRequest(options_download)
      })
      return Promise.all(arr)
    })
    .then(function(contents){
      let nameList = getMetaInfoGithub(contents)
      console.log("After getMetaInfo : nameList:-->", nameList)
      res.json({"list":nameList})
    })
    .catch(function(err){
      console.log("get: contents list call err: ", err)
    })
  })

  app.get('/nda/dictionaries/github/:shortName', ensureAuthenticated, jsonParser, function(req,res){
    console.log('loading file:--',req.params.shortName )
    let url = 'https://api.github.com/'
    let rpath = url+'repos/'+req.user.username+'/ni-terms/contents'
    let options = setOptionsContents(rpath, 'application/json', github_token)
    promiseRequest(options).then(function(fileListInRepo){
      let filesInfo = []
      let gitFilesInfo = fileListInRepo
      for(let i = 0; i<gitFilesInfo.length; i++){
        if(gitFilesInfo[i].name !== 'README.md'){
          filesInfo.push(gitFilesInfo[i].path)
        }
      }
      console.log("fileName list: ", filesInfo)
      let fname = ''
      for(let i = 0; i<filesInfo.length;i++){
        if(filesInfo[i].indexOf(req.params.shortName)!== -1){
          fname = filesInfo[i]
          break;
        }
      }
      let rpath_download = url+'repos/'+req.user.username+'/ni-terms/contents/'+fname
      let options_download = setOptionsContents(rpath_download,'application/vnd.github.v3.raw',github_token)
      return promiseRequest(options_download)
    })
    .then(function(contents){
      //res.send(contents)
      res.json(contents)
    })
    .catch(function(err){
      console.log("get: content call err: ", err)
    })
  })

  app.post('/nda/dictionaries/github/url', ensureAuthenticated, jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log('[nda/dictionaries/github/url] Received at server side:')
    console.log(req.body)
    let download_url = req.body.durl
    let urlParts =  download_url.split('/')
    let fileName = urlParts[urlParts.length-1]
    let repoName = urlParts[3]
    let url = 'https://api.github.com/'
    let rpath = url+'repos/'+repoName+'/ni-terms/contents/'+fileName
    let options_download = setOptionsContents(rpath,'application/vnd.github.v3.raw',github_token)
    promiseRequest(options_download).then(function(contents){
      res.json(contents)
    })
    //res.json({"res","ok"})
  })

  app.get('/nda/dictionaries/github_repronim', ensureAuthenticated, jsonParser, function(req,res){

    let url = 'https://api.github.com/'
    let rpath = url+'repos/ReproNim/ni-terms/contents'
    let options = setOptionsContents(rpath, 'application/json', github_token)
    promiseRequest(options).then(function(fileListInRepo){
      let filesInfo = []
      let gitFilesInfo = fileListInRepo
      for(let i = 0; i<gitFilesInfo.length; i++){
        if(gitFilesInfo[i].name !== 'README.md'){
          filesInfo.push(gitFilesInfo[i].path)
        }
      }
      console.log("fileName list: ", filesInfo)
      let gitObj = {}
      let nameList = []
      var arr = filesInfo.map(function(filePath) {
        let rpath = url+'repos/ReproNim/ni-terms/contents/'+filePath
        let options_download = setOptionsContents(rpath,'application/vnd.github.v3.raw',github_token)
        return promiseRequest(options_download)
      })
      return Promise.all(arr)
    })
    .then(function(contents){
      let nameList = getMetaInfoGithub(contents)
      console.log("After getMetaInfo : nameList:-->", nameList)
      res.json({"list":nameList})
    })
    .catch(function(err){
      console.log("get: contents list call err: ", err)
    })
  })

  app.get('/nda/dictionaries/github_repronim/:shortName', ensureAuthenticated, jsonParser, function(req,res){
    console.log('loading file:--',req.params.shortName )
    let url = 'https://api.github.com/'
    let rpath = url+'repos/ReproNim/ni-terms/contents'
    let options = setOptionsContents(rpath, 'application/json', github_token)
    promiseRequest(options).then(function(fileListInRepo){
      let filesInfo = []
      let gitFilesInfo = fileListInRepo
      for(let i = 0; i<gitFilesInfo.length; i++){
        if(gitFilesInfo[i].name !== 'README.md'){
          filesInfo.push(gitFilesInfo[i].path)
        }
      }
      console.log("fileName list: ", filesInfo)
      let fname = ''
      for(let i = 0; i<filesInfo.length;i++){
        if(filesInfo[i].indexOf(req.params.shortName)!== -1){
          fname = filesInfo[i]
          break;
        }
      }
      let rpath_download = url+'repos/ReproNim/ni-terms/contents/'+fname
      let options_download = setOptionsContents(rpath_download,'application/vnd.github.v3.raw',github_token)
      return promiseRequest(options_download)
    })
    .then(function(contents){
      res.json(contents)
    })
    .catch(function(err){
      console.log("get: content call err: ", err)
    })
  })
  app.get('/nda/dictionaries/local', ensureAuthenticated,jsonParser, function(req,res){
    //let termDirPath = path.join(__dirname, '/../../../uploads/termforms/')
    let termDirPath = path.join(userData, '/uploads/termforms/')
    var listOfFiles = new Promise(function(resolve){
      fs.readdir(termDirPath, function(err,list){
        if(err) throw err
        let instList = []
        for(let i=0;i< list.length;i++){
          if(list[i]!==".DS_Store"){
            instList.push(list[i])
          }
        }
        console.log("instrument lists:---> ", list)
        resolve(instList)
      })
    })
    listOfFiles.then(function(list){
      //console.log("lists: then---> ", list)
      let namesArr = list.map(function(fname){
        //return loadJsonFile(path.join(__dirname, '/../../../uploads/termforms/'+fname))
        return loadJsonFile(path.join(userData, '/uploads/termforms/'+fname))
      })
      return Promise.all(namesArr)
    }).then(function(obs){
      let nameList = []
      console.log("obs:-->", obs)
      for(let i = 0; i< obs.length;i++){
        nameList.push({"shortName":obs[i].shortName,"title": obs[i].Name, "author":obs[i].author})
      }
      //console.log("nameList:--> ", nameList)
      res.json({"list":nameList})
    })
  })
  app.get('/nda/dictionaries/local/:shortName', ensureAuthenticated,jsonParser, function(req,res){
    console.log("shortName: ", req.params.shortName)
    //let termDirPath = path.join(__dirname, '/../../../uploads/termforms/')
    let termDirPath = path.join(userData, '/uploads/termforms/')
    var listOfFiles = new Promise(function(resolve){
      fs.readdir(termDirPath, function(err,list){
        if(err) throw err
        let instList = []
        for(let i=0;i< list.length;i++){
          if(list[i]!==".DS_Store"){
            instList.push(list[i])
          }
        }
        console.log("instrument lists:---> ", list)
        resolve(instList)
      })
    })
    listOfFiles.then(function(list){
      console.log("lists: then---> ", list)
      let namesArr = list.map(function(fname){
        //return loadJsonFile(path.join(__dirname, '/../../../uploads/termforms/'+fname))
        return loadJsonFile(path.join(userData, '/uploads/termforms/'+fname))
      })
      return Promise.all(namesArr)
    }).then(function(obs){
      let ob = {}
      for(let i = 0; i< obs.length;i++){

        if(obs[i].shortName === req.params.shortName){
          console.log("shortName from list:", obs[i].shortName)
          ob = obs[i]
          break;
        }
      }
      //console.log("ob:--> ", ob)
      res.send(JSON.stringify(ob))
    })
  })

  app.post('/nda/dictionaries/local', ensureAuthenticated,jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log('[nda/dictionaries/] Received at server side')
    //console.log(req.body)
    let term_info = req.body
    term_info['DictionaryID'] = uuid()
    term_info['author'] = req.user.username
    console.log(term_info)
    pid = term_info['DictionaryID'].split('-')
    psname = term_info['shortName'].split(' ')
    pname = term_info['Name'].split(' ')

    //let cpath = path.join(__dirname, '/../../../uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
    let cpath = path.join(userData, '/uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
    writeJsonFile(cpath, req.body).then(() => {
      console.log('done')
      res.json({'tid': term_info['DictionaryID'], 'fid':'terms-'+ psname[0]+'-'+ pname[0] +'.json'})
    })
  })

  app.post('/nda/dictionaries/github', ensureAuthenticated,jsonParser, function(req,res){
    console.log("github: req.user: ",req.user)
    let user = req.user
    if (!req.body) return res.sendStatus(400)
    console.log('[nda/dictionaries/github] Received at server side')
    //console.log(req.body)
    let term_info = req.body
    term_info['DictionaryID'] = uuid()
    term_info['author'] = req.user.username
    console.log(term_info)
    pid = term_info['DictionaryID'].split('-')
    psname = term_info['shortName'].split(' ')
    pname = term_info['Name'].split(' ')
    let fileName = psname[0]+'-'+ pname[0] +'.json'
    //let termsJson = JSON.parse(req.body)
    //Local save
    //let cpath = path.join(__dirname, '/../../../uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
    let cpath = path.join(userData, '/uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
    writeJsonFile(cpath, term_info).then(() => {
      console.log('done')
      //res.json({'tid': term_info['DictionaryID'], 'fid':'terms-'+ psname[0]+'-'+ pname[0] +'.json'})
    })

    //Saving to GitHub
    // Fork the term if not available
    let url = 'https://api.github.com/'
    request.get({url:url+'repos/'+req.user.username+'/ni-terms',headers:{'User-Agent':'brainverse','accept':'application/json'}}, function(err, resn, body){
      //console.log(JSON.parse(body))
      //res.send(body)
      let jbody = JSON.parse(body)
      if("message" in jbody){
        console.log("has message: ")
        if(jbody.message == "Not Found"){
          console.log("--Message not found--")
          console.log("access_token", github_token)
          // fork the repo
          var options = {
            method: 'POST',
            url: url + 'repos/ReproNim/ni-terms/forks',
            headers: {
              'Authorization': 'token '+ github_token,
              'User-Agent': 'brainverse',
              'Content-Type': 'multipart/form-data'
            },
            form: {}
          }
          request(options,function(err1,resn1,body1){
            console.log("resn1.statusCode", resn1.statusCode)
            //console.log("resn1", resn1)
            if(!err1 && resn1.statusCode == 200 || resn1.statusCode == 201){
              console.log("resn1.statusCode", resn1.statusCode)
              createFileInRepo(url,term_info,fileName,user)
            }else if(resn1.statusCode == 202){
              setTimeout(createFileInRepo,3000,url,term_info,fileName,user)
            }
            //console.log("resn: ", resn1)
            console.log("post: fork: ", JSON.parse(body1).full_name)
          })
        }
      }else{
        console.log("It already exist----")
        //create File in the repo
        createFileInRepo(url,term_info,fileName,user)
      }

      res.json({'tid': term_info['DictionaryID'], 'fid':'terms-'+ psname[0]+'-'+ pname[0] +'.json'})
    })// end of request GET end
  })

  function createFileInRepo(url,jsonTermObj,pathToFile,user){
    let content = Buffer.from(JSON.stringify(jsonTermObj,undefined,2)).toString('base64')
    var options = {
      method: 'PUT',
      url: url + 'repos/'+ user.username+'/ni-terms/contents/'+ pathToFile,
      headers: {
        'Authorization': 'token '+ github_token,
        'User-Agent': 'brainverse',
        'Content-Type': 'application/json'
      },
      body: {
        message: pathToFile + ' added',
        content: content
      },
      json: true
    }
    request(options,function(err,response,body){
      console.log("statusCode for createFile: ", response.statusCode)
      if(response.statusCode == 200 || response.statusCode == 201){
        //console.log("body: ", body)
        createPullRequest(url,pathToFile,user)
      }
    })
  }
  function createPullRequest(url,pathToFile,user){
    var options = {
      method: 'POST',
      url: url + 'repos/ReproNim/ni-terms/pulls',
      headers: {
        'Authorization': 'token '+ github_token,
        'User-Agent': 'brainverse',
        'Content-Type': 'application/json'
      },
      body: {
        "title": "Data Dictionary: "+ pathToFile +" curated",
        "body": "Edited or Added Terms",
        "head": user.username+":master",
        "base": "master"
      },
      json: true
    }
    request(options,function(err,response,body){
      console.log("StatusCode for Pull Request: ", response.statusCode)
    })
  }

  app.post('/repronim/dictionaries/local', ensureAuthenticated,jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log('[nda/dictionaries/] Received at server side')
    //console.log(req.body)
    let term_info = req.body
    term_info['DictionaryID'] = uuid()
    term_info['author'] = req.user.username
    console.log(term_info)
    pid = term_info['DictionaryID'].split('-')
    psname = term_info['shortName'].split(" ")
    pname = term_info['Name'].split(" ")

    //let cpath = path.join(__dirname, '/../../../uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
    let cpath = path.join(userData, '/uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
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
