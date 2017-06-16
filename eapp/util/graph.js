const path = require('path')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const writeJsonFile = require('write-json-file')
const uuid = require('uuid-random')
const loadJsonFile = require('load-json-file')
const fs = require('fs')
const rdfstore = require('rdfstore')

let namespaces = {}
let pnodes = {}

/**
* RDF store creation and setup
*/
var _rdfStoreSetup = function(){
  let rstore = rdfstore.create(function(err, store) {
    if(err){
      console.log("not able to create store")
    }
    return store
  })
  let graph = rstore.rdf.createGraph()
  rstore.rdf.setPrefix("nidm", "http://purl.org/nidash/nidm#")
  rstore.rdf.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
  rstore.rdf.setPrefix("nda","https://ndar.nih.gov/api/datadictionary/v2/dataelement/")
  rstore.rdf.setPrefix("prov","http://www.w3.org/ns/prov#")
  _addToStoreNamespace("nidm", "http://purl.org/nidash/nidm#")
  _addToStoreNamespace("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
  _addToStoreNamespace("nda","https://ndar.nih.gov/api/datadictionary/v2/dataelement/")
  _addToStoreNamespace("prov","http://www.w3.org/ns/prov#")
  console.log("Namespaces:---->", namespaces)
  return {store:rstore, graph:graph}
}

var _addToStoreNamespace = function(prefix, uri){
  namespaces[uri] = prefix
}

var getPrefix = function(uri){
  return namespaces[uri]
}

var _saveToRDFstore = function(jsonObj, callback_tstring){
  let tstring = ""
  let cpath = path.join(__dirname,'/../../uploads/acquisition/')
  let fname = 'plan-graph-' + jsonObj['ProjectPlanID'] + '.ttl'

  fs.stat(cpath+fname, function(err, stat) {
    console.log(cpath+fname)
    if(err == null){
      console.log('File exists')
      tstring = tstring + "\n"
    } else if(err.code == 'ENOENT') {
      console.log("File does not exist")
      console.log("prefix:", store.rdf.prefixes.get("nidm"))

      // TODO: Add a method to automatically identify the namespace, add prefix and object properties
      tstring = "@prefix nidm: <"+ store.rdf.prefixes.get("nidm")+"> .\n"
      tstring = tstring + "@prefix rdf: <"+ store.rdf.prefixes.get("rdf")+"> .\n"
      tstring = tstring + "@prefix prov: <"+ store.rdf.prefixes.get("prov")+"> .\n"
    } else{
      console.log('Some other error: ', err.code);
    }

    addToGraph(jsonObj, function(){
      //console.log("-- addToGraph:callback---")
      store.graph("nidm:tgraph",function(err, graph){
        console.log("---inside nidm:tgraph ------")
        let subject={}
        let objS = {}
        graph.forEach(function(triple){
          console.log("triple:", triple)
          if(!(triple.subject.nominalValue in subject)){
            subject[triple.subject.nominalValue] = []
          }
          objS = {}
          objS[triple.predicate.toString()] = triple.object.toString()
          subject[triple.subject.nominalValue].push(objS)
        })
        console.log("----Serializing graph to turtle --->>>")
        let s = serializeToTurtle(subject)
        tstring = tstring + s
        console.log(tstring)
        callback_tstring(tstring)
      })//graph
   })
  }) //fs.stat
}
//Create node and add to RDF graph
function addToGraph(jsonObj, callback){
  let dgO = uuid()
  let n = store.rdf.createNamedNode(store.rdf.resolve("nidm:plan_"+ dgO))
  rgraph.add(store.rdf.createTriple(n,
  store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
  store.rdf.createNamedNode(store.rdf.resolve("prov:Plan"))))

  let sarray = []
  let snodes = []

  for(var key in jsonObj){
    if(key == "Sessions"){
      sarray = jsonObj["Sessions"]
      for(let k = 0;k<sarray.length;k++){
        let sn = addSessionToGraph(sarray[k])
        snodes.push(sn)
      }
    }else if(key == "Personnel"){
      let parr = jsonObj["Personnel"]
      for(let p = 0; p < parr.length; p++){
        let pnode = store.rdf.createNamedNode(store.rdf.resolve("nidm:" + parr[p]))
        pnodes[parr[p]] = pnode
        rgraph.add(store.rdf.createTriple(pnode,
        store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
        store.rdf.createNamedNode(store.rdf.resolve("prov:Agent"))))
        rgraph.add(store.rdf.createTriple(pnode,
        store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
        store.rdf.createNamedNode(store.rdf.resolve("prov:Person"))))
      }
    } else{
      rgraph.add(store.rdf.createTriple(n,
      store.rdf.createNamedNode(store.rdf.resolve("nidm:"+key)),
      store.rdf.createLiteral(jsonObj[key])))
    }
  }

  let sessionCol = store.rdf.createNamedNode(store.rdf.resolve("nidm:sessionCollection_"+ uuid()))
  rgraph.add(store.rdf.createTriple(n,
  store.rdf.createNamedNode(store.rdf.resolve("nidm:sessionPlans")),
  sessionCol))
  rgraph.add(store.rdf.createTriple(sessionCol,
  store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
  store.rdf.createNamedNode(store.rdf.resolve("prov:Collection"))))

  for(let j=0;j<snodes.length;j++){
    rgraph.add(store.rdf.createTriple(sessionCol,
      store.rdf.createNamedNode(store.rdf.resolve("prov:hadMember")),
      snodes[j]))
  }

  store.insert(rgraph, "nidm:tgraph", function(err) {
    if(err){
      console.log("Not able to insert subgraph to nidm:graph")
    }
    callback()
  })//insert
  return n
}
/*
Add Session Object
*/

function addSessionToGraph(sessionObj){
  let instNodes = []
  let sn = store.rdf.createNamedNode(store.rdf.resolve("nidm:session_"+ uuid()))
  rgraph.add(store.rdf.createTriple(sn,
  store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
  store.rdf.createNamedNode(store.rdf.resolve("prov:Entity"))))

  for(var key in sessionObj){
    if(key == "Instruments"){
      let instArray = sessionObj["Instruments"]
      for(let i = 0; i< instArray.length; i++){
        let instNode = addInstrumentToGraph(instArray[i])
        instNodes.push(instNode)
      }
    }else{
      rgraph.add(store.rdf.createTriple(sn,
        store.rdf.createNamedNode(store.rdf.resolve("nidm:" + key)),
        store.rdf.createLiteral(sessionObj[key])))
    }
  }

  let instCol = store.rdf.createNamedNode(store.rdf.resolve("nidm:instrumentCollection_"+ uuid()))
  rgraph.add(store.rdf.createTriple(sn,
  store.rdf.createNamedNode(store.rdf.resolve("nidm:instruments")),
  instCol))
  rgraph.add(store.rdf.createTriple(instCol,
  store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
  store.rdf.createNamedNode(store.rdf.resolve("prov:Collection"))))

  for(let j=0;j<instNodes.length;j++){
    rgraph.add(store.rdf.createTriple(instCol,
      store.rdf.createNamedNode(store.rdf.resolve("prov:hadMember")),
      instNodes[j]))
  }
  return sn;
}

/*
* Add Instrument Object *
*/

function addInstrumentToGraph(instObj){
  let n = store.rdf.createNamedNode(store.rdf.resolve("nidm:instrument_"+ uuid()))
  rgraph.add(store.rdf.createTriple(n,
  store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
  store.rdf.createNamedNode(store.rdf.resolve("nidm:Instrument"))))
  for(var key in instObj){
    if(key == "Assignee"){
      rgraph.add(store.rdf.createTriple(n,
      store.rdf.createNamedNode(store.rdf.resolve("nidm:assignee")),
        pnodes[instObj[key]]))
    }else{
      rgraph.add(store.rdf.createTriple(n,
        store.rdf.createNamedNode(store.rdf.resolve("nidm:"+key)),
        store.rdf.createLiteral(instObj[key])))
    }
  }
  return n;
}

//Serializing to Turtle syntax
function serializeToTurtle(sObj){
  let s = ""
  let num_nodes = Object.keys(sObj).length
  let count = 0
  for(var key in sObj){
    let pfname = key.split("/")
    let iri = key.split("#")
    let kname = pfname[pfname.length-1].split("#")
    let iri_complete = iri[0] + "#"
    let prefix_name = getPrefix(iri_complete)
    let node_name = prefix_name+":"+ kname[1]
    s = s + node_name + " "

    let node_length = sObj[key].length
    let pObj = sObj[key]
    for(let i = 0; i<node_length-1; i++){
      let pf_key = getPrefixKeyForm(pObj[i])
      s = s + pf_key + " ;\n"
      s = s + "  "
    }
    let pf_key = getPrefixKeyForm(pObj[node_length-1])
    s = s + pf_key + " .\n"
  }//for
  return s
}

function getPrefixKeyForm(sobj){
  let key = Object.keys(sobj)[0]
  let pfname = key.split("/")
  let iri = key.split("#")
  let kname = pfname[pfname.length-1].split("#")
  let key_name = kname[1]
  let iri_complete = iri[0] + "#"
  let prefix_name = getPrefix(iri_complete)
  let node_name = prefix_name+":"+ key_name + " "

  let value = sobj[key]
  pfname = value.split("/")
  if(pfname.length>1){
    kname = pfname[pfname.length-1].split("#")
    key_name = kname[1]
    prefix_name = kname[0]
    node_name = node_name + prefix_name+":"+ key_name + " "
  }else{
    node_name = node_name + value
  }
  return node_name
}

module.exports = {
  addToStoreNamespace : _addToStoreNamespace,
  rdfStoreSetup : _rdfStoreSetup,
  saveToRDFstore : _saveToRDFstore
}
