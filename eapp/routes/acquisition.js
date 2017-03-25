module.exports = () => {

  const path = require('path')
  const fileUpload = require('express-fileupload')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const loadJsonFile = require('load-json-file')
  const uuid = require('uuid-random')
  const request = require('request')
  const fs = require('fs')


  const jsonParser = bodyParser.json()
  var rdfstore = require('rdfstore')

  app.post('/acquisitions/new', jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log('recived at server side')
    //console.log(req.body)
    let obj_info = req.body
    obj_info['objID'] = uuid()
    console.log(obj_info)
    let pid = obj_info['objID'].split('-')
    //pname = term_info['shortName'].split(' ')
    //let cpath = 'uploads/acquisition/entity-'+pid[0] +'.json'
    saveToRDFstore(obj_info,function(tstring){
      console.log("cfn: tstring: ", tstring)
      var cpath = 'uploads/acquisition/entity-xyz'+'.ttl'
      fs.writeFile(cpath, tstring, function(err) {
        if(err) {
           return console.log(err);
        }
        console.log("The file was saved!");
        res.json({'tid': obj_info['objID'], 'fid':'entity-xyz.ttl'})
      })
    })
    /*writeJsonFile(cpath, req.body).then(() => {
      console.log('done')
      res.json({'tid': obj_info['objID'], 'fid':'entity-'+ pid[0] +'.json'})
    })*/
  })

  app.get('/acquisitions/forms/:id', function(req,res){
    console.log('loading Terms file')
    loadJsonFile('uploads/termforms/'+req.params.id).then(ob => {
      console.log("ob:==>",ob)
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
          tstring = tstring + "nidm:entity_4dd12419-1bb0-4c3d-8a1e-34c306083613 rdf:type nidm:DemographicsAcquisitionObject ;\n "

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
