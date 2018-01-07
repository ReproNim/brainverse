module.exports = () => {
  const path = require('path')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const loadJsonFile = require('load-json-file')
  const uuid = require('uuid-random')
  const request = require('request')
  const fs = require('fs')
  const rdfstore = require('rdfstore')

  const jsonParser = bodyParser.json()
  const rdfHelper = require('./../util/nidme-graph.js')

  global.store = app.locals.store

  app.get('/query/graphs/:subjectId/dateofbirth',ensureAuthenticated, function(req, res){
    console.log("subjectId: ", req.params.subjectId)
    var listOfGraphs = new Promise(function(resolve){
      store.registeredGraphs(function(results, graphs) {
        var values = []
        for (var i = 0; i < graphs.length; i++) {
          if(graphs[i].valueOf()!== undefined){
            values.push(graphs[i].valueOf())
          }
        }
        resolve(values)
      })
    })
    listOfGraphs.then(function(values){
      console.log("Registered graphs: ", values)
      let regGraphs = []
      for(let i=0;i<values.length; i++){
        if(values[i].indexOf('activity')!== -1){
          regGraphs.push(values[i])
        }
      }
      console.log("Filtered graphs:", regGraphs)
      var graphOfPromises = regGraphs.map(function(graph){
        return new Promise(function(resolve){
          store.execute(queryDateOfBirth(req.params.subjectId,'dateOfBirth',"<"+graph+">"), function(err,results){
            console.log('[execute] for graph: ', graph)
            if(err){
              console.log("err: ", err)
              console.log(" err: graph: ", graph, "  results: ", results)
              resolve({})
            }
            //console.log("results: ", results)
            if(typeof results !== 'undefined'  && results !== []){
              console.log("[if] results is defined: [0]", results[0])
              if(typeof results[0]!=='undefined' && results[0].hasOwnProperty('dateOfBirth')){
                resolve({
                    "subId": req.params.subjectId,
                    "attr":results[0]['dateOfBirth'].value
                })
              }else{
                resolve({})
              }
            }else{
              console.log("[else] resolving for undefined/empty:--- ", results)
              resolve({})
            }
          //  }
          })//execute
        })//promise
      })//graph of promises
      return Promise.all(graphOfPromises)
    }).then(function(objs){
      let attrVal = ''
      for(let i=0; i<objs.length; i++){
        if(objs[i] !== []){
          console.log("objs[i].subId: ", objs[i].subId," objs[i].attr: ", objs[i].attr)
        }
        if(objs[i].hasOwnProperty('attr')){
          attrVal = objs[i].attr
          break
        }
      }
      res.json({'attr':attrVal})
    }).catch(function(error){
      console.log("error:", error)
    })

  })
  app.get('/query/graphs/:subjectId/:attrName',ensureAuthenticated, function(req, res){
    console.log("subjectId: ", req.params.subjectId, "  attrName: ", req.params.attrName)
    var listOfGraphs = new Promise(function(resolve){
      store.registeredGraphs(function(results, graphs) {
        var values = []
        for (var i = 0; i < graphs.length; i++) {
          if(graphs[i].valueOf()!== undefined){
            values.push(graphs[i].valueOf())
          }
        }
        resolve(values)
      })
    })
    listOfGraphs.then(function(values){
      console.log("Registered graphs: ", values)
      let regGraphs = []
      for(let i=0;i<values.length; i++){
        if(values[i].indexOf('activity')!== -1){
          regGraphs.push(values[i])
        }
      }
      console.log("Filtered graphs:", regGraphs)
      var graphOfPromises = regGraphs.map(function(graph){
        return new Promise(function(resolve){
          store.execute(queryAttribute(req.params.subjectId,req.params.attrName,"<"+graph+">"), function(err,results){
            console.log('[execute] for graph: ', graph)
            if(err){
              console.log("err: ", err)
              console.log(" err: graph: ", graph, "  results: ", results)
              resolve({})
            }
            //console.log("results: ", results)
            if(typeof results !== 'undefined'  && results !== []){
              //console.log("results value undefined? ", typeof(results) === 'undefined')
              console.log("[if] results is defined: [0]", results[0])
              if(typeof results[0]!=='undefined' && results[0].hasOwnProperty(req.params.attrName)){
                resolve({
                    "subId": req.params.subjectId,
                    "attr":results[0][req.params.attrName].value
                })
              }else{
                resolve({})
              }
            }else{
              console.log("[else] resolving for undefined/empty:--- ", results)
              resolve({})
            }
          //  }
          })//execute
        })//promise
      })//graph of promises
      return Promise.all(graphOfPromises)
    }).then(function(objs){
      let attrVal = ''
      for(let i=0; i<objs.length; i++){
        if(objs[i] !== []){
          console.log("objs[i].subId: ", objs[i].subId," objs[i].attr: ", objs[i].attr)
        }
        if(objs[i].hasOwnProperty('attr')){
          attrVal = objs[i].attr
          break
        }
      }
      res.json({'attr':attrVal})
    }).catch(function(error){
      console.log("error:", error)
    })

  })



  function queryAttribute(subjectId,attrName,graphId){
    let query = 'PREFIX prov:<http://www.w3.org/ns/prov#>\
  PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
  PREFIX nidm:<http://purl.org/nidash/nidm#> \
  SELECT * \
  FROM NAMED '+ graphId + '\
  {GRAPH '+graphId+'{ ?s rdf:type ?entity ; \
    nidm:src_subject_id "'+subjectId+'" ;\
    nidm:'+attrName+' ?'+attrName+' .\
  } }'
  return query
  }

  function queryDateOfBirth(subjectId, attrName, graphId){
    let query = 'PREFIX prov:<http://www.w3.org/ns/prov#>\
    PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX nidm:<http://purl.org/nidash/nidm#> \
    SELECT * \
    FROM NAMED '+ graphId + '\
    {GRAPH '+graphId+'{ nidm:agent_'+subjectId +' rdf:a prov:Agent ; \
      nidm:'+attrName+' ?'+attrName+' .\
    } }'
    return query
  }

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }

}
