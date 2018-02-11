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

  app.get('/instruments/local/list', ensureAuthenticated,jsonParser, function(req,res){
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
        console.log("[1-/instruments/local/list]instruments lists:---> ", instList)
        resolve(instList)
      })
    })
    listOfFiles.then(function(list){
      //console.log("lists: then---> ", list)
      let namesArr = list.map(function(fname){
        return loadJsonFile(path.join(userData, '/uploads/termforms/'+fname))
      })
      return Promise.all(namesArr)
    }).then(function(obs){
      let nameList = []
      let recentObjs = {}
      let deleteList = []
      // Getting the chain of derivation and getting the recent version
      for(let i = 0; i< obs.length;i++){
        recentObjs[obs[i].shortName] = obs[i]
      }
      for(let j=0;j<obs.length;j++){
        let k = 0
        let sname = obs[j].shortName
        while(recentObjs.hasOwnProperty(sname)){
          k++
          if(k!==1){
            deleteList.push(sname)
          }
          sname = recentObjs[sname].DerivedFrom
        }
        for(k=0; k<deleteList.length;k++){
          delete recentObjs[deleteList[k]]
        }
      }
      // -----------------------------
      let hashObj = {}
      for(var key in recentObjs){
        let ob = recentObjs[key]
        let title = ob.Name.split(' ')[0]
        let fileName = 'terms-'+ob.shortName+'-'+title+".json"
        if(!hashObj.hasOwnProperty(ob.DerivedFrom)){
          hashObj[ob.DerivedFrom] = ob
          //nameList.push({"shortName":ob.shortName,"title": ob.Name, "author":ob.author,"filename": fileName})
        }else{
          let stats = fs.statSync(path.join(userData, '/uploads/termforms/'+fileName))
          let mtime = new Date(stats.mtime)
          console.log("current file name: ", fileName," modification time: ",mtime)
          let prevFile = hashObj[ob.DerivedFrom]
          let prevTitle = prevFile.Name.split(' ')[0]
          let prevFileName = 'terms-'+prevFile.shortName+'-'+prevTitle+".json"
          let prevStats = fs.statSync(path.join(userData, '/uploads/termforms/'+prevFileName))
          let prevMtime=new Date(prevStats.mtime)
          console.log("prev file name:",prevFileName,"modification time: ",prevMtime)
          if(mtime > prevMtime){
            console.log("Adding the recent copy of the file ---")
            delete hashObj[ob.DerivedFrom]
            hashObj[ob.DerivedFrom] = ob

            //nameList.push({"shortName":ob.shortName,"title": ob.Name, "author":ob.author,"filename": fileName})
          }
        }
        //nameList.push({"shortName":ob.shortName,"title": ob.Name, "author":ob.author,"filename": fileName})
      }
      for(var key in hashObj){
        let ob = hashObj[key]
        let title = ob.Name.split(' ')[0]
        let fileName = 'terms-'+ob.shortName+'-'+title+".json"
        nameList.push({"shortName":ob.shortName,"title": ob.Name, "author":ob.author,"filename": fileName})
      }
      console.log("[2-/instruments/local/list/] nameList:--> ", nameList)
      res.json({"list":nameList})
    })
  })
  app.get('/instruments/local/:shortName', ensureAuthenticated,jsonParser, function(req,res){
    console.log("[/instruments/local/:shortName]: ", req.params.shortName)
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

        resolve(instList)
      })
    })
    listOfFiles.then(function(list){
      //console.log("lists: then---> ", list)
      console.log("then 1 - [/instruments/local/:shortName]file list:---> ", list)
      let namesArr = list.map(function(fname){
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
      //res.send(JSON.stringify(ob))
      res.send(ob)
      //res.json(ob)
    })
  })

  app.post('/instruments/local/new', ensureAuthenticated,jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log('[instruments/dictionaries/] Received at server side')
    //console.log(req.body)
    let term_info = req.body
    term_info['DictionaryID'] = uuid()
    term_info['author'] = req.user.username
    console.log(term_info)
    pid = term_info['DictionaryID'].split('-')
    psname = term_info['shortName'].split(' ')
    pname = term_info['Name'].split(' ')

    let cpath = path.join(userData, '/uploads/termforms/terms-'+ psname[0]+'-'+ pname[0] +'.json')
    writeJsonFile(cpath, req.body).then(() => {
      console.log('done')
      res.json({'tid': term_info['DictionaryID'], 'fid':'terms-'+ psname[0]+'-'+ pname[0] +'.json'})
    })
  })

  // saving instruments locally and pushing to GitHub
  app.post('/instruments/github/new', ensureAuthenticated,jsonParser, function(req,res){
    let user = req.user
    if (!req.body) return res.sendStatus(400)
    console.log('[instruments/github/new] Received at server side')
    //console.log(req.body)
    let term_info = req.body
    term_info['DictionaryID'] = uuid()
    term_info['author'] = req.user.username
    console.log(term_info)
    pid = term_info['DictionaryID'].split('-')
    psname = term_info['shortName'].split(' ')
    pname = term_info['Name'].split(' ')
    let fileName = psname[0]+'-'+ pname[0] +'.json'

    //Local save
    let cpath = path.join(userData, '/uploads/termforms/terms-'+ fileName)
    writeJsonFile(cpath, term_info).then(() => {
      console.log('done')
    })

    //Saving to GitHub
    // create instruments repository in GitHub in user's account
    let url = 'https://api.github.com/'
    request.get({url:url+'repos/'+req.user.username+'/instruments',headers:{'User-Agent':'brainverse','accept':'application/json'}}, function(err, resn, body){
      //console.log(JSON.parse(body))
      //res.send(body)
      let jbody = JSON.parse(body)
      if("message" in jbody){
        console.log("has message: ")
        if(jbody.message == "Not Found"){
          console.log("--Message not found--")
          console.log("access_token", github_token)
          // create the repo
          var options = {
            method: 'POST',
            url: url + 'user/repos',
            headers: {
              'Authorization': 'token '+ github_token,
              'User-Agent': 'brainverse',
              'Content-Type': 'application/json'
              //'Content-Type': 'multipart/form-data'
            },
            body: {
              "name": "instruments",
              "description": "Repository created by BrainVerse to save and share forms being using during experimental studies"
            },
            json : true
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
            //console.log("post: create ", JSON.parse(body1).full_name)
          })
        } //ends - If block - NotFound
      }else{
        console.log("It already exist----")
        //create File in the repo
        createFileInRepo(url,term_info,fileName,user)
      }

      res.json({'tid': term_info['DictionaryID'], 'fid':'terms-'+ fileName})
    })// end of request GET end
  })

  function createFileInRepo(url,jsonTermObj,pathToFile,user){
    let content = Buffer.from(JSON.stringify(jsonTermObj,undefined,2)).toString('base64')
    var options = {
      method: 'PUT',
      url: url + 'repos/'+ user.username+'/instruments/contents/'+ pathToFile,
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
    })
  }

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }
}
