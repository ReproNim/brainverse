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

app.get('/query/graphs/projects/:projectId/instruments',ensureAuthenticated, function(req, res){
  console.log("projectId: ", req.params.projectId, "  projectId: ", req.params.projectId)
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
        store.execute(queryInstruments(req.params.projectId,"<"+graph+">"), function(err,results){
          console.log('[execute] for graph: ', graph)
          let instrumentArray = []
          if(err){
            console.log("err: ", err)
            console.log(" err: graph: ", graph, "  results: ", results)
            resolve({})
          }
          //console.log("results: ", results)
          if(typeof results !== 'undefined'  && results !== []){
            //console.log("results value undefined? ", typeof(results) === 'undefined')
            console.log("[if] results is defined: [0]", results[0])

            if(typeof results[0]!=='undefined' && results[0].hasOwnProperty("projectId")){

              for(let i = 0; i< results.length; i++){
                instrumentArray.push(results[i].instrument.value)
              }
              resolve({
                  "projectId": req.params.projectId,
                  "instrument": instrumentArray
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
        console.log("objs[i].projectId: ", objs[i].projectId," objs[i].instrument: ", objs[i].instrument)
      }
      if(objs[i].hasOwnProperty('instrument')){
        attrVal = objs[i].instrument
        break
      }
    }
    res.json({'instruments':attrVal})
  }).catch(function(error){
    console.log("error:", error)
  })
})

app.get('/query/graphs/instrument/:projectId/:instrument_name',ensureAuthenticated, function(req, res){
  console.log("projectId: ", req.params.projectId, "  instrumentName: ", req.params.instrument_name)
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
        store.execute(getInstrumentFields(req.params.projectId,req.params.instrument_name,"<"+graph+">"), function(err,results){
          console.log('[execute] for graph: ', graph)
          let fieldsArray = []
          if(err){
            console.log("err: ", err)
            console.log(" err: graph: ", graph, "  results: ", results)
            resolve({})
          }
          //console.log("results: ", results)
          if(typeof results !== 'undefined'  && results !== []){
            //console.log("results value undefined? ", typeof(results) === 'undefined')
            console.log("[if] results is defined: [0]", results[0])
            let entity = {}
            if(typeof results[0]!=='undefined' && results[0].hasOwnProperty("entity")){
              console.log("looking for own property")
              entity[results[0].entity.value] = []
              let earr =[]
              for(let i = 0; i< results.length; i++){
                if(entity.hasOwnProperty(results[i].entity.value)){ //just picking fields of first entity
                  if(results[i].v.token === 'literal'){
                    let fieldName = results[i].p.value
                    let fieldValue = results[i].v.value
                    earr.push({fieldName : fieldValue})
                    fieldsArray.push(results[i].p.value)
                    console.log("field name: ", results[i].p.value)
                  }
                }
                /*else{
                  entity[results[i].entity.value] = []
                  earr = []
                }*/

              }
              entity[results[0].entity.value] = earr
              resolve({
                  "projectId": req.params.projectId,
                  "instrumentName": req.params.instrument_name,
                  "instrument_fields": fieldsArray
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
        console.log("objs[i].projectId: ", objs[i].projectId," objs[i].instrumentName: ", objs[i].instrumentName, "objs[i].instrument_field:", objs[i].fieldsArray)
      }
      if(objs[i].hasOwnProperty('instrument_fields')){
        attrVal = objs[i].instrument_fields
        break
      }
    }
    res.json({'instrument fields':attrVal})
  }).catch(function(error){
    console.log("error:", error)
  })
})

  function getInstrumentFields(projectId, instrumentName, graphId){
    let query = 'PREFIX prov:<http://www.w3.org/ns/prov#>\
    PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX nidm:<http://purl.org/nidash/nidm#> \
    SELECT ?entity ?p ?v\
    FROM NAMED '+ graphId + '\
    {GRAPH '+graphId+'{ ?entity rdf:type prov:Entity ;\
      prov:wasGeneratedBy ?activity; \
      ?p ?v.\
      ?activity rdf:type prov:Activity ;\
      provone:isPartOf ?sessionactivity;\
      prov:used nidm:'+instrumentName+' .\
      ?sessionactivity provone:isPartOf ?pj .\
      ?pj nidm:ID "'+ projectId +'" .\
    } }'
    let query1 = 'PREFIX prov:<http://www.w3.org/ns/prov#>\
    PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX nidm:<http://purl.org/nidash/nidm#> \
    SELECT ?entity ?p ?v\
    FROM NAMED '+ graphId + '\
    {GRAPH '+graphId+'{ ?entity rdf:type prov:Entity ;\
      prov:wasGeneratedBy ?activity; \
      ?p ?v.\
      ?activity rdf:type prov:Activity ;\
      prov:used nidm:'+ instrumentName +' .\
    } }'
    return query1
  }
  function queryInstruments(projectId,graphId){
    let queryInstruments = 'PREFIX prov:<http://www.w3.org/ns/prov#>\
      PREFIX provone:<http://purl.org/provone#>\
      PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
      PREFIX nidm:<http://purl.org/nidash/nidm#> \
      SELECT DISTINCT ?projectId ?instrument \
      FROM NAMED '+ graphId + '\
      {GRAPH '+graphId+'{ ?s rdf:type prov:Activity;\
        provone:isPartOf ?sessionactivity;\
        prov:used ?instrument .\
        ?sessionactivity provone:isPartOf ?projectId .\
        ?p nidm:ID "'+ projectId +'" .\
      }}'
    return queryInstruments
  }
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

  function queryAttributes(subjectId, graphId){
    let query = 'PREFIX prov:<http://www.w3.org/ns/prov#>\
  PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
  PREFIX nidm:<http://purl.org/nidash/nidm#> \
  SELECT * \
  FROM NAMED '+ graphId + '\
  {GRAPH '+graphId+'{ ?s rdf:type prov:Entity ; \
    prov:wasAttributedTo nidm:agent_'+subjectId+' ;\
    ?prop ?attr .\
  } }'
    return query
  }

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }

}
