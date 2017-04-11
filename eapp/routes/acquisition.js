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
      console.log("cfn: tstring: ", tstring)

      let cpath = 'uploads/acquisition/entity-graph-' + obj_info['ExperimentID'] + '.ttl'
      let fname = 'entity-graph-'+obj_info['ExperimentID'] + '.ttl'

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
    console.log('loading terms file')
    loadJsonFile('uploads/termforms/'+req.params.name).then(ob => {
      console.log("ob:==>", ob)
      res.json(ob)
    })
  })

  app.get('/acquisitions/forms', function(req, res){
    var files = []
    fs.readdir('uploads/termforms', function(err,list){
      if(err) throw err;
      res.json({'list':list})
    })
  })

  function saveToRDFstore(jsonObj, cfn){
    let tstring = ""
    let cpath = path.join(__dirname,'/../../uploads/acquisition/')
    let fname = 'entity-graph-' + jsonObj['ExperimentID'] + '.ttl'

    fs.stat(cpath+fname, function(err, stat) {
      console.log(cpath+fname)
      if(err == null) {
        console.log('File exists');
        rdfstore.create(function(err, store) {
          var graph1 = store.rdf.createGraph();
          store.rdf.setPrefix("nidm", "http://purl.org/nidash/nidm#")
          store.rdf.setPrefix("xsd", "http://www.w3.org/2001/XMLSchema#")
          store.rdf.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#")

          console.log("prefix:", store.rdf.prefixes.get("nidm"))
          let dgO = uuid()
          let n = store.rdf.createNamedNode(store.rdf.resolve("nidm:entity_"+ dgO))
          graph1.add(store.rdf.createTriple(n,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("nidm:DemographicsAcquisitionObject"))))
          for(var key in jsonObj){
            graph1.add(store.rdf.createTriple(n,
                store.rdf.createNamedNode(store.rdf.resolve("nidm:"+key)),
                store.rdf.createLiteral(jsonObj[key])))
          }
          /*var serialized = graph1.toNT();
          console.log("serialized:1", serialized)*/
          store.insert(graph1, "nidm:tgraph", function(err) {
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
              //let tstring = ""
              ///-------------------------------------
              // TODO: Add a method to automatically identify the namespace, add prefix and object properties
              
              tstring = "\nnidm:entity_"+ dgO+ " rdf:type nidm:DemographicsAcquisitionObject ;\n "

              tstring = tstring + getObjStr(jsonObj)

              //-------------------------------------
                /*for(var key in subject){
                  tstring = key + " "+ getObjStr(subject[key])
                }*/
              console.log("tstring: ", tstring)
              cfn(tstring)
            })//graph
          })//insert
        })//create


      } else if(err.code == 'ENOENT') {
        console.log("file does not exist")
        rdfstore.create(function(err, store) {
          var graph1 = store.rdf.createGraph();
          store.rdf.setPrefix("nidm", "http://purl.org/nidash/nidm#")
          store.rdf.setPrefix("xsd", "http://www.w3.org/2001/XMLSchema#")
          store.rdf.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#")

          console.log("prefix:", store.rdf.prefixes.get("nidm"))
          let dgO = uuid()
          let n = store.rdf.createNamedNode(store.rdf.resolve("nidm:entity_"+ dgO))
          graph1.add(store.rdf.createTriple(n,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("nidm:DemographicsAcquisitionObject"))))
          for(var key in jsonObj){
            graph1.add(store.rdf.createTriple(n,
                store.rdf.createNamedNode(store.rdf.resolve("nidm:"+key)),
                store.rdf.createLiteral(jsonObj[key])))
          }
          /*var serialized = graph1.toNT();
          console.log("serialized:1", serialized)*/
          store.insert(graph1, "nidm:tgraph", function(err) {
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
              //let tstring = ""
              ///-------------------------------------
              // TODO: Add a method to automatically identify the namespace, add prefix and object properties
              tstring = "@prefix nidm: <"+ store.rdf.prefixes.get("nidm")+"> .\n"
              tstring = tstring + "@prefix rdf: <"+ store.rdf.prefixes.get("rdf")+"> .\n"

              tstring = tstring + "nidm:entity_"+ dgO + " rdf:type nidm:DemographicsAcquisitionObject ;\n "
              tstring = tstring + getObjStr(jsonObj)

              //-------------------------------------
                /*for(var key in subject){
                  tstring = key + " "+ getObjStr(subject[key])
                }*/
              console.log("tstring: ", tstring)
              cfn(tstring)
            })//graph
          })//insert
        })//create
        //fs.writeFile('log.txt', 'Some log\n');
      } else {
        console.log('Some other error: ', err.code);
      }
   }) //fs.stat

  }

  //Serialize JSON Object where Objects are literals, to turtle syntax
  function getObjStr(sObj){
    let s = ""
    let sl = Object.keys(sObj).length
    let count = 0
    for(var key in sObj){
      s = s + " nidm:"+ key + " " + "\""+sObj[key]+"\""
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
