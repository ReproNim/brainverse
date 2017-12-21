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
      for(var key in recentObjs){
        let ob = recentObjs[key]
        nameList.push({"shortName":ob.shortName,"title": ob.Name, "author":ob.author})
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

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }
}
