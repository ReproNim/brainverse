const path = require('path')
const writeJsonFile = require('write-json-file')
const uuid = require('uuid-random')
const loadJsonFile = require('load-json-file')
const fs = require('fs')
const rdfstore = require('rdfstore')
const moment = require('moment')

let namespaces = {}

var _rdfStoreSetup = function(){
  let rstore = rdfstore.create(function(err, store) {
    if(err){
      console.log("not able to create store")
    }
    return store
  })
  rstore.rdf.setPrefix("nidm", "http://purl.org/nidash/nidm#")
  rstore.rdf.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
  rstore.rdf.setPrefix("nda","https://ndar.nih.gov/api/datadictionary/v2/dataelement/")
  rstore.rdf.setPrefix("prov","http://www.w3.org/ns/prov#")
  rstore.setPrefix("xsd", "http://www.w3.org/2001/XMLSchema#")
  rstore.setPrefix("dc", "http://purl.org/dc/terms/")
  _addToStoreNamespace("nidm", "http://purl.org/nidash/nidm#")
  _addToStoreNamespace("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
  _addToStoreNamespace("nda","https://ndar.nih.gov/api/datadictionary/v2/dataelement/")
  _addToStoreNamespace("prov","http://www.w3.org/ns/prov#")
  _addToStoreNamespace("xsd","http://www.w3.org/2001/XMLSchema#")
  _addToStoreNamespace("dc","http://purl.org/dc/terms/")
  console.log("Namespaces:---->", namespaces)
  let cpath = path.join(__dirname, '/../../uploads/acquisition/')
  loadFilesToRDFStore(cpath+"plans/")
  loadFilesToRDFStore(cpath+"experiments/")
  return {store:rstore}
}

function loadFilesToRDFStore(path){
  var listOfFiles = new Promise(function(resolve){
    fs.readdir(path, function(err,list){
      if(err) throw err;
      console.log("lists: ", list)
      resolve(list)
    })
  })
  listOfFiles.then(function(list){
    var arrayOfPromises = list.map(function(f){
      let data = fs.createReadStream(path+f)
      if(f != '.DS_Store'){
        let name = f.split(".")
        return new Promise(function(resolve){
          store.load('text/turtle',data,"nidm:"+name[0], function(err,results){
            resolve(name[0])
          })
        })
      }
    }) //array of promises
    //console.log("array: ", arrayOfPromises)
    return Promise.all(arrayOfPromises)
  }).then(function(g){
    console.log("app set up: All Promises resolved: ", g)
  })
}

var _addToStoreNamespace = function(prefix, uri){
  namespaces[uri] = prefix
}

function getPrefix(uri){
  return namespaces[uri]
}

var _getRegisteredGraphsList = function(){
  store.registeredGraphs(function (results, graphs) {
          var values = []
          for (var i = 0; i < graphs.length; i++) {
            values.push(graphs[i].valueOf())
          }
    console.log("values", values)
    return values
  })
}

/**
** NIDM Graph Class
**/
var NIDMGraph = class NIDMGraph {
  /*
  * create a RDF graph
  */
  constructor(){
    this.pnodes = {}
    this.rgraph = store.rdf.createGraph()
  }
  /*
  * Add Instrument Node to the Graph
  */
  addInstrument(instObj){
    let instId = "nidm:instrument_" + uuid()
    let n = store.rdf.createNamedNode(store.rdf.resolve(instId))
    this.rgraph.add(store.rdf.createTriple(n,
    store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
    store.rdf.createNamedNode(store.rdf.resolve("nidm:Instrument"))))
    for(var key1 in instObj){
      let key = key1.replace(/\s+/g, '')
      if(key == "Assignee"){
        this.rgraph.add(store.rdf.createTriple(n,
        store.rdf.createNamedNode(store.rdf.resolve("nidm:assignee")),
          this.pnodes[instObj[key1]]))
      }else{
        this.rgraph.add(store.rdf.createTriple(n,
          store.rdf.createNamedNode(store.rdf.resolve("nidm:"+key)),
          store.rdf.createLiteral(instObj[key1])))
      }
    }
    return n;
  }

  /*
  * Add Session Node to the Graph
  */
  addSession(sessionObj){
    let instNodes = []
    let sessionId = "nidm:session_"+ uuid()
    let sn = store.rdf.createNamedNode(store.rdf.resolve(sessionId))
    this.rgraph.add(store.rdf.createTriple(sn,
    store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
    store.rdf.createNamedNode(store.rdf.resolve("prov:Entity"))))

    for(var key1 in sessionObj){
      let key = key1.replace(/\s+/g, '')

      if(key == "Instruments"){
        let instArray = sessionObj["Instruments"]
        for(let i = 0; i< instArray.length; i++){
          let instNode = this.addInstrument(instArray[i])
          instNodes.push(instNode)
        }
      }else{
        this.rgraph.add(store.rdf.createTriple(sn,
          store.rdf.createNamedNode(store.rdf.resolve("nidm:" + key)),
          store.rdf.createLiteral(sessionObj[key1])))
      }
    }
    let instColNode = this.addCollection("instrumentCollection", instNodes)
    this.rgraph.add(store.rdf.createTriple(sn,
    store.rdf.createNamedNode(store.rdf.resolve("nidm:instruments")),
    instColNode))
    return sn;
  }
  /*
  * Add Plan Node to the Graph
  */
  addPlan(jsonObj){
    let planId = "nidm:plan_"+ jsonObj["ProjectPlanID"]
    let n = store.rdf.createNamedNode(store.rdf.resolve(planId))
    this.rgraph.add(store.rdf.createTriple(n,
    store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
    store.rdf.createNamedNode(store.rdf.resolve("prov:Plan"))))

    let sarray = []
    let snodes = []

    for(var key1 in jsonObj){
      let key = key1.replace(/\s+/g, '')
      console.log("key1: ", key1, "   key: ", key)
      if(key == "Sessions"){
        sarray = jsonObj["Sessions"]
        for(let k = 0;k<sarray.length;k++){
          let sn = this.addSession(sarray[k])
          snodes.push(sn)
        }
      }else if(key == "Personnel"){
        let parr = jsonObj["Personnel"]
        for(let p = 0; p < parr.length; p++){
          let pnode = store.rdf.createNamedNode(store.rdf.resolve("nidm:" + parr[p].user))
          this.pnodes[parr[p].user] = pnode
          this.addPerson(pnode,parr[p].uid)
        }
      }else if(key == "created") {
        this.rgraph.add(store.rdf.createTriple(n,
        store.rdf.createNamedNode(store.rdf.resolve("dc:created")),
        store.rdf.createLiteral(jsonObj["created"],null,store.rdf.resolve("xsd:dateTime"))))
      }else if(key == "wasDerivedFrom"){
        this.rgraph.add(store.rdf.createTriple(n,
        store.rdf.createNamedNode(store.rdf.resolve("prov:wasDerivedFrom")),
        store.rdf.createNamedNode(store.rdf.resolve("nidm:plan_"+jsonObj['wasDerivedFrom']))))
      }else{
        this.rgraph.add(store.rdf.createTriple(n,
        store.rdf.createNamedNode(store.rdf.resolve("nidm:"+key)),
        store.rdf.createLiteral(jsonObj[key1])))
      }
    }
    let sessionCol = this.addCollection("sessionCollection", snodes)
    this.rgraph.add(store.rdf.createTriple(n,
    store.rdf.createNamedNode(store.rdf.resolve("nidm:sessionPlans")),
    sessionCol))
    return n
  }

  /*
  * Add Person Node to the Graph
  */
  addPerson(pnode,uid){
    this.rgraph.add(store.rdf.createTriple(pnode,
    store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
    store.rdf.createNamedNode(store.rdf.resolve("prov:Agent"))))

    this.rgraph.add(store.rdf.createTriple(pnode,
    store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
    store.rdf.createNamedNode(store.rdf.resolve("prov:Person"))))

    this.rgraph.add(store.rdf.createTriple(pnode,
    store.rdf.createNamedNode(store.rdf.resolve("nidm:uid")),
    store.rdf.createLiteral(uid)))
  }

  /*
  * Add Collection Node the the Graph
  */
  addCollection(name,cArray){
    let collectionId = "nidm:"+ name + "_"+ uuid()
    let entColNode = store.rdf.createNamedNode(store.rdf.resolve(collectionId))
    this.rgraph.add(store.rdf.createTriple(entColNode,
    store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
    store.rdf.createNamedNode(store.rdf.resolve("prov:Collection"))))
    for(let j=0;j<cArray.length;j++){
      this.rgraph.add(store.rdf.createTriple(entColNode,
        store.rdf.createNamedNode(store.rdf.resolve("prov:hadMember")),
        cArray[j]))
    }
    return entColNode
  }

  /*
  * Add NDA Experiment node to the graph
  */
  addNDAExperiment(jsonObj){
    let ndaId = "nidm:entity_" + jsonObj['objID']
    let ndaNode = store.rdf.createNamedNode(store.rdf.resolve(ndaId))
    this.rgraph.add(store.rdf.createTriple(ndaNode,
    store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
    store.rdf.createNamedNode(store.rdf.resolve("prov:Entity"))))
    for(var key1 in jsonObj){
      let key = key1.replace(/\s+/g, '')
      this.rgraph.add(store.rdf.createTriple(ndaNode,
        store.rdf.createNamedNode(store.rdf.resolve("nda:"+key)),
        store.rdf.createLiteral(jsonObj[key1])))
    }
    return ndaNode
  }
} // End of Class definition

/**
** Add/Insert the NIDM graph created to the store with sepecifc URI
**/
function _addToStore(nidmGraph,graphId,addCallback){
  store.insert(nidmGraph.rgraph, graphId, function(err) {
    if(err){
      console.log("Not able to insert subgraph to nidm:graph")
    }
    addCallback(graphId)
  })//insert
}

/**
** Serialize To Turtle
**/
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
    console.log("~~node name:~~~ ", node_name)
    s = s + node_name + " "

    let node_length = sObj[key].length
    let pObj = sObj[key]
    for(let i = 0; i<node_length-1; i++){
      //console.log("key'predicate and object's value: ", pObj[i])
      let pf_key = getPrefixKeyForm(pObj[i])
      s = s + pf_key + " ;\n"
      s = s + "  "
    }
    let pf_key = getPrefixKeyForm(pObj[node_length-1])
    s = s + pf_key + " .\n"
  }//for
  return s
}

/**
** Convert to Prefix:Key Form from URI
**/
function getPrefixKeyForm(sobj){
  let key = Object.keys(sobj)[0]
  let pfname = key.split("/")
  let iri = key.split("#")
  let key_name = ''
  let iri_complete = ''

  let kname = pfname[pfname.length-1].split("#")
  //console.log("pfname, kname 1: ", pfname, " :", kname)
  if(kname.length==1){
    key_name = kname[0]
    iri_complete = key.substring(0,key.indexOf(kname[0]))
    }else{
      key_name = kname[1].replace(/\s+/g, '')
      iri_complete = iri[0] + "#"
    }
  let prefix_name = getPrefix(iri_complete)
  let node_name = prefix_name + ":" + key_name + " "
  let value = sobj[key]
  //dateTime
  if(value.indexOf('^^') === -1){
    pfname = value.split("/")
    if(pfname.length>1){
      kname = pfname[pfname.length-1].split("#")
      //console.log("kname 2: ", kname)
      if(kname.length>1){
        key_name = kname[1].replace(/\s+/g, '')
      }else{
        key_name = kname[1]
      }
      prefix_name = kname[0]
      node_name = node_name + prefix_name+":"+ key_name + " "
    }else{
      node_name = node_name + value
    }
  }else{
    console.log("daTETIME TYPE")
    let xtype = value.split("^^")
    console.log("xtype: ", xtype)
    let parr = xtype[1].substring(1, xtype[1].length-1).split("#")
    console.log("parr: ", parr)
    prefix_name = getPrefix(parr[0]+"#")
    node_name = node_name + xtype[0] + "^^"+ prefix_name+":"+parr[1]
  }
    return node_name
}

/**
** Saves the RDF Graph to Store
** Serializes to Turtle file
**/
var _saveToRDFstore = function(nidmGraph, graphId, fileName,callback_tstring){
  let tstring = ""
  let cpath = path.join(__dirname,'/../../uploads/acquisition/')

  fs.stat(cpath+fileName, function(err, stat) {
    console.log(cpath+fileName)
    if(err == null){
      console.log('File exists')
      tstring = tstring + "\n"
    } else if(err.code == 'ENOENT') {
      console.log("File does not exist")
      // TODO: Add a method to automatically identify the namespace, add prefix and object properties
      tstring = "@prefix nidm: <"+ store.rdf.prefixes.get("nidm")+"> .\n"
      tstring = tstring + "@prefix rdf: <"+ store.rdf.prefixes.get("rdf")+"> .\n"
      tstring = tstring + "@prefix prov: <"+ store.rdf.prefixes.get("prov")+"> .\n"
      tstring = tstring + "@prefix dc: <"+ store.rdf.prefixes.get("dc")+"> .\n"
      tstring = tstring + "@prefix xsd: <"+ store.rdf.prefixes.get("xsd")+"> .\n"
    } else{
      console.log('Some other error: ', err.code);
    }
    /*
      Adding to Store
    */
    _addToStore(nidmGraph,graphId,function(graphId){
      console.log("addToStore callback:", graphId)
      store.graph(graphId,function(err, graph){
        console.log("---inside graph ------", graphId)
        let subject={}
        let objS = {}
        graph.forEach(function(triple){
          //console.log("triple:", triple)
          if(!(triple.subject.nominalValue in subject)){
            subject[triple.subject.nominalValue] = []
          }
          objS = {}
          objS[triple.predicate.toString()] = triple.object.toString()
          subject[triple.subject.nominalValue].push(objS)
        })
        //console.log("graphToNT: ---->\n", graph.toNT())
        //console.log("subject list: ", subject)
        console.log("----Serializing graph to turtle --->>>")
        let s = serializeToTurtle(subject)
        tstring = tstring + s
        //console.log(tstring)
        callback_tstring(graphId,tstring)
      })//graph
    })
  }) //fs.stat
}

module.exports = {
  addToStoreNamespace : _addToStoreNamespace,
  rdfStoreSetup : _rdfStoreSetup,
  getRegisteredGraphsList: _getRegisteredGraphsList,
  saveToRDFstore: _saveToRDFstore,
  addToStore: _addToStore,
  NIDMGraph : NIDMGraph
}
