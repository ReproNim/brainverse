module.exports = () => {
  const path = require('path')
  const fileUpload = require('express-fileupload')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const loadJsonFile = require('load-json-file')
  const uuid = require('uuid-random')
  const request = require('request')
  const fs = require('fs')
  const rdfstore = require('rdfstore')

  const jsonParser = bodyParser.json()

  let store = app.locals.store
  let rgraph = app.locals.rgraph
  /**
  New acquisition data
  **/
  app.post('/acquisitions/new', jsonParser, function(req,res){
    if (!req.body)
      return res.sendStatus(400)
    console.log('recieved at server side')
    let obj_info = req.body
    obj_info['objID'] = uuid()

    saveToRDFstore(obj_info,function(tstring){
      console.log("callback fn: tstring: ", tstring)

      //let cpath = 'uploads/acquisition/entity-graph-' + obj_info['ExperimentID'] + '.ttl'
      let cpath = path.join(__dirname, '/../../uploads/acquisition/entity-graph-' + obj_info['ExperimentID'] + '.ttl')
      let fname = 'entity-graph-' + obj_info['ExperimentID'] + '.ttl'

      fs.appendFile(cpath, tstring, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
        res.json({'tid': obj_info['objID'], 'fid': fname})
      })
    })
  })

  app.get('/acquisitions/forms/:name', function(req,res){
    var cpath = path.join(__dirname, '/../../uploads/termforms/')
    console.log('loading terms file')
    loadJsonFile(cpath + req.params.name).then(ob => {
      console.log("ob:==>", ob)
      res.json(ob)
    })
  })

  app.get('/acquisitions/forms', function(req, res){
    var files = []
    var cpath = path.join(__dirname, '/../../uploads/termforms')
    fs.readdir(cpath, function(err,list){
      if(err) throw err;
      res.json({'list':list})
    })
  })

  function saveToRDFstore(jsonObj, callback_tstring){
    let tstring = ""
    let cpath = path.join(__dirname,'/../../uploads/acquisition/')
    let fname = 'entity-graph-' + jsonObj['ExperimentID'] + '.ttl'

    fs.stat(cpath+fname, function(err, stat) {
      console.log(cpath+fname)
      if(err == null){
        console.log('File exists')
        tstring = tstring + "\n"
      } else if(err.code == 'ENOENT') {
        console.log("File does not exist")
        console.log("prefix:", store.rdf.prefixes.get("nidm"))
        //-------------------------------------
        // TODO: Add a method to automatically identify the namespace, add prefix and object properties
        tstring = "@prefix nidm: <"+ store.rdf.prefixes.get("nidm")+"> .\n"
        tstring = tstring + "@prefix rdf: <"+ store.rdf.prefixes.get("rdf")+"> .\n"
        tstring = tstring + "@prefix nda: <"+ store.rdf.prefixes.get("nda")+"> .\n"
      } else{
        console.log('Some other error: ', err.code);
      }

      let dgO = addToGraph(jsonObj)
      store.graph("nidm:tgraph",function(err, graph){
        console.log("inside graph")
        let subject={}
        let objS = {}
        graph.forEach(function(triple){
          if(!triple.subject.nominalValue in subject){
            objS = {}
          }
          objS[triple.predicate.toString()] = triple.object.toString()
          subject[triple.subject.nominalValue] = objS
        })
        console.log("Serialized to turtle ---")
        tstring = tstring + "nidm:entity_"+ dgO + " rdf:type nidm:DemographicsAcquisitionObject ;\n "
        tstring = tstring + getObjStr(jsonObj)
        //-------------------------------------
        //console.log("tstring: ", tstring)
        callback_tstring(tstring)
      })//graph
    }) //fs.stat
  }

  //Create node and add to RDF graph
  function addToGraph(jsonObj){
    let dgO = uuid()
    let n = store.rdf.createNamedNode(store.rdf.resolve("nidm:entity_"+ dgO))
    rgraph.add(store.rdf.createTriple(n,
    store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
    store.rdf.createNamedNode(store.rdf.resolve("nidm:DemographicsAcquisitionObject"))))
    for(var key in jsonObj){
      rgraph.add(store.rdf.createTriple(n,
        store.rdf.createNamedNode(store.rdf.resolve("nda:"+key)),
        store.rdf.createLiteral(jsonObj[key])))
    }
    store.insert(rgraph, "nidm:tgraph", function(err) {
      if(err){
        console.log("Not able to insert subgraph to nidm:graph")
      }
    })//insert
    return dgO
  }

  //Serialize JSON Object where Objects are literals, to turtle syntax
  function getObjStr(sObj){
    let s = ""
    let sl = Object.keys(sObj).length
    let count = 0
    for(var key in sObj){
      s = s + " nda:"+ key + " " + "\""+sObj[key]+"\""
      if(count<(sl-1)) {
        s = s + " ; \n "
        count ++
      } else{
        s = s + " ."
      }
    }
    return s
  }
}
