const path = require('path');
const writeJsonFile = require('write-json-file');
const uuid = require('uuid-random');
const loadJsonFile = require('load-json-file');
const fs = require('fs');
const rdfstore = require('rdfstore');
const moment = require('moment');

let namespaces = {};

let _rdfStoreSetup = function () {
    let rstore = rdfstore.create(function (err, store) {
        if (err) {
            console.log("not able to create store");
        }
        return store;
    });
    rstore.rdf.setPrefix("nidm", "http://purl.org/nidash/nidm#");
    rstore.rdf.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    rstore.rdf.setPrefix("nda", "https://ndar.nih.gov/api/datadictionary/v2/dataelement/");
    rstore.rdf.setPrefix("prov", "http://www.w3.org/ns/prov#");
    rstore.rdf.setPrefix("xsd", "http://www.w3.org/2001/XMLSchema#");
    rstore.rdf.setPrefix("dc", "http://purl.org/dc/terms/");
    rstore.rdf.setPrefix("provone", "http://purl.org/provone#");

    _addToStoreNamespace("nidm", "http://purl.org/nidash/nidm#");
    _addToStoreNamespace("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    _addToStoreNamespace("nda", "https://ndar.nih.gov/api/datadictionary/v2/dataelement/");
    _addToStoreNamespace("prov", "http://www.w3.org/ns/prov#");
    _addToStoreNamespace("xsd", "http://www.w3.org/2001/XMLSchema#");
    _addToStoreNamespace("dc", "http://purl.org/dc/terms/");
    _addToStoreNamespace("provone", "http://purl.org/provone#");

    let cpath = path.join(userData, '/uploads/acquisition/');
    loadFilesToRDFStore(cpath + "plans/");
    loadFilesToRDFStore(cpath + "experiments/");
    return {store: rstore};
};

function loadFilesToRDFStore(path) {
    var listOfFiles = new Promise(function (resolve) {
        fs.readdir(path, function (err, list) {
            if (err) throw err;
            let filesList = [];
            for (let i = 0; i < list.length; i++) {
                if (list[i] !== ".DS_Store") {
                    filesList.push(list[i]);
                }
            }
            console.log("loadFilesToRDFStore :lists: ", filesList);
            resolve(filesList);
        })
    });
    listOfFiles.then(function (list) {
        var arrayOfPromises = list.map(function (f) {
            let data = fs.createReadStream(path + f);
            if (f !== '.DS_Store') {
                let name = f.split(".");
                return new Promise(function (resolve) {
                    store.load('text/turtle', data, "nidm:" + name[0], function (err, results) {
                        console.log("name[0]: ", name[0], "   err:", err);
                        resolve(name[0]);
                    })
                })
            }
        }); //array of promises
        return Promise.all(arrayOfPromises);
    }).then(function (g) {
        console.log("app set up: All Promises resolved: ", g);
    })
}

let _addToStoreNamespace = function (prefix, uri) {
    namespaces[uri] = prefix;
};

function getPrefix(uri) {
    return namespaces[uri];
}

let _getRegisteredGraphsList = function () {
    store.registeredGraphs(function (results, graphs) {
        var values = [];
        for (var i = 0; i < graphs.length; i++) {
            values.push(graphs[i].valueOf());
        }
        return values;
    })
};

/**
 ** NIDM Graph Class
 **/
var NIDMGraph = class NIDMGraph {
    /*
    * create a RDF graph
    */
    constructor() {
        this.pnodes = {};
        this.rgraph = store.rdf.createGraph();
    }

    /*
    * Add Instrument Node to the Graph
    */
    addInstrument(instObj) {
        let instId = "nidm:instrument_" + uuid();
        let n = store.rdf.createNamedNode(store.rdf.resolve(instId));
        this.rgraph.add(store.rdf.createTriple(n,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("nidm:Instrument"))));
        for (let key1 in instObj) {
            let key = key1.replace(/\s+/g, '');
            if (key === "Assignee") {
                this.rgraph.add(store.rdf.createTriple(n,
                    store.rdf.createNamedNode(store.rdf.resolve("nidm:assignee")),
                    this.pnodes[instObj[key1]]));
            } else {
                this.rgraph.add(store.rdf.createTriple(n,
                    store.rdf.createNamedNode(store.rdf.resolve("nidm:" + key)),
                    store.rdf.createLiteral(instObj[key1])));
            }
        }
        return n;
    }

    /*
    * Add Session Node to the Graph
    */
    addSession(sessionObj) {
        let instNodes = [];
        let sessionId = "nidm:session_" + uuid();
        let sn = store.rdf.createNamedNode(store.rdf.resolve(sessionId));
        this.rgraph.add(store.rdf.createTriple(sn,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Entity"))));

        for (var key1 in sessionObj) {
            let key = key1.replace(/\s+/g, '');

            if (key === "Instruments") {
                let instArray = sessionObj["Instruments"];
                for (let i = 0; i < instArray.length; i++) {
                    let instNode = this.addInstrument(instArray[i]);
                    instNodes.push(instNode);
                }
            } else {
                this.rgraph.add(store.rdf.createTriple(sn,
                    store.rdf.createNamedNode(store.rdf.resolve("nidm:" + key)),
                    store.rdf.createLiteral(sessionObj[key1])));
            }
        }
        let instColNode = this.addCollection("instrumentCollection", instNodes);
        this.rgraph.add(store.rdf.createTriple(sn,
            store.rdf.createNamedNode(store.rdf.resolve("nidm:instruments")),
            instColNode));
        return sn;
    }

    /*
    * Add Plan Node to the Graph
    */
    addPlan(jsonObj) {
        let planId = "nidm:plan_" + jsonObj["ProjectPlanID"];
        let n = store.rdf.createNamedNode(store.rdf.resolve(planId));
        this.rgraph.add(store.rdf.createTriple(n,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Plan"))));

        let sarray = [];
        let snodes = [];

        for (let key1 in jsonObj) {
            let key = key1.replace(/\s+/g, '');
            console.log("key1: ", key1, "   key: ", key);
            if (key === "Sessions") {
                sarray = jsonObj["Sessions"];
                for (let k = 0; k < sarray.length; k++) {
                    let sn = this.addSession(sarray[k]);
                    snodes.push(sn);
                }
            } else if (key === "Personnel") {
                let parr = jsonObj["Personnel"];
                for (let p = 0; p < parr.length; p++) {
                    let pnode = store.rdf.createNamedNode(store.rdf.resolve("nidm:" + parr[p].user))
                    this.pnodes[parr[p].user] = pnode;
                    this.addPerson(pnode, parr[p].uid);
                }
            } else if (key === "created") {
                this.rgraph.add(store.rdf.createTriple(n,
                    store.rdf.createNamedNode(store.rdf.resolve("dc:created")),
                    store.rdf.createLiteral(jsonObj["created"], null, store.rdf.resolve("xsd:dateTime"))));
            } else if (key === "wasDerivedFrom") {
                this.rgraph.add(store.rdf.createTriple(n,
                    store.rdf.createNamedNode(store.rdf.resolve("prov:wasDerivedFrom")),
                    store.rdf.createNamedNode(store.rdf.resolve("nidm:plan_" + jsonObj['wasDerivedFrom']))));
            } else {
                this.rgraph.add(store.rdf.createTriple(n,
                    store.rdf.createNamedNode(store.rdf.resolve("nidm:" + key)),
                    store.rdf.createLiteral(jsonObj[key1])));
            }
        }
        let sessionCol = this.addCollection("sessionCollection", snodes);
        this.rgraph.add(store.rdf.createTriple(n,
            store.rdf.createNamedNode(store.rdf.resolve("nidm:sessionPlans")),
            sessionCol));
        return n;
    }

    /*
    * Add Person Node to the Graph
    */
    addPerson(pnode, uid) {
        this.rgraph.add(store.rdf.createTriple(pnode,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Agent"))));

        this.rgraph.add(store.rdf.createTriple(pnode,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Person"))));

        this.rgraph.add(store.rdf.createTriple(pnode,
            store.rdf.createNamedNode(store.rdf.resolve("nidm:uid")),
            store.rdf.createLiteral(uid)));
    }

    /*
    * Add Collection Node the the Graph
    */
    addCollection(name, cArray) {
        let collectionId = "nidm:" + name + "_" + uuid();
        let entColNode = store.rdf.createNamedNode(store.rdf.resolve(collectionId));
        this.rgraph.add(store.rdf.createTriple(entColNode,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Collection"))));
        for (let j = 0; j < cArray.length; j++) {
            this.rgraph.add(store.rdf.createTriple(entColNode,
                store.rdf.createNamedNode(store.rdf.resolve("prov:hadMember")),
                cArray[j]));
        }
        return entColNode;
    }

    /*
    * Add NDA Experiment node to the graph
    */
    addNDAExperiment(jsonObj) {
        let ndaId = "nidm:entity_" + jsonObj['objID'];
        let ndaNode = store.rdf.createNamedNode(store.rdf.resolve(ndaId));
        this.rgraph.add(store.rdf.createTriple(ndaNode,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Entity"))));
        for (var key1 in jsonObj) {
            let key = key1.replace(/\s+/g, '');
            this.rgraph.add(store.rdf.createTriple(ndaNode,
                store.rdf.createNamedNode(store.rdf.resolve("nda:" + key)),
                store.rdf.createLiteral(jsonObj[key1])));
        }
        return ndaNode;
    }

    /**
     ** Add Project Activity Node to the graph
     **/
    addProjectActivity(jsonObj) {
        let projObj = jsonObj['Project'];
        let projectId = "nidm:activity_" + projObj['ID'];
        let projectNode = store.rdf.createNamedNode(store.rdf.resolve(projectId));
        this.rgraph.add(store.rdf.createTriple(projectNode,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Activity"))));
        for (var key1 in projObj) {
            let key = key1.replace(/\s+/g, '');
            if (key === 'created') {
                this.rgraph.add(store.rdf.createTriple(projectNode,
                    store.rdf.createNamedNode(store.rdf.resolve("dc:created")),
                    store.rdf.createLiteral(projObj["created"], null, store.rdf.resolve("xsd:dateTime"))));
            } else if (key === 'wasDerivedFrom') {
                this.rgraph.add(store.rdf.createTriple(projectNode,
                    store.rdf.createNamedNode(store.rdf.resolve("prov:wasDerivedFrom")),
                    store.rdf.createNamedNode(store.rdf.resolve("nidm:activity_" + projObj['wasDerivedFrom']))));
            } else {
                this.rgraph.add(store.rdf.createTriple(projectNode,
                    store.rdf.createNamedNode(store.rdf.resolve("nidm:" + key)),
                    store.rdf.createLiteral(projObj[key1])));
            }
        }
        if (jsonObj.hasOwnProperty('PlanID')) {
            this.rgraph.add(store.rdf.createTriple(projectNode,
                store.rdf.createNamedNode(store.rdf.resolve("prov:hadPlan")),
                store.rdf.createNamedNode(store.rdf.resolve("nidm:entity_" + jsonObj['PlanID']))));
        }
        return projectNode;
    }

    addSessionActivity(jsonObj, projectNode) {
        let sessionObj = jsonObj['Session'];
        let sessionId = "nidm:activity_" + sessionObj['SessionID'];
        let sessionNode = store.rdf.createNamedNode(store.rdf.resolve(sessionId));
        this.rgraph.add(store.rdf.createTriple(sessionNode,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Activity"))));
        for (var key1 in sessionObj) {
            let key = key1.replace(/\s+/g, '');
            this.rgraph.add(store.rdf.createTriple(sessionNode,
                store.rdf.createNamedNode(store.rdf.resolve("nidm:" + key)),
                store.rdf.createLiteral(sessionObj[key1])));
        }
        this.rgraph.add(store.rdf.createTriple(sessionNode,
            store.rdf.createNamedNode(store.rdf.resolve("provone:isPartOf")),
            projectNode));
        return sessionNode;
    }

    addAcquisitionActivity(jsonObj, sessionNode) {
        let acqActivityObj = jsonObj['AcquisitionActivity'];
        let taskId = "nidm:activity_" + acqActivityObj['AcquisitionActivityID'];
        let taskNode = store.rdf.createNamedNode(store.rdf.resolve(taskId));
        this.rgraph.add(store.rdf.createTriple(taskNode,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Activity"))));
        for (var key1 in acqActivityObj) {
            let key = key1.replace(/\s+/g, '');
            this.rgraph.add(store.rdf.createTriple(taskNode,
                store.rdf.createNamedNode(store.rdf.resolve("nidm:" + key)),
                store.rdf.createLiteral(acqActivityObj[key1])));
        }
        this.rgraph.add(store.rdf.createTriple(taskNode,
            store.rdf.createNamedNode(store.rdf.resolve("provone:isPartOf")),
            sessionNode));

        this.rgraph.add(store.rdf.createTriple(taskNode,
            store.rdf.createNamedNode(store.rdf.resolve("prov:used")),
            store.rdf.createNamedNode(store.rdf.resolve("nidm:" + jsonObj['InstrumentName']))));
        return taskNode;
    }

    //TODO: Add Role
    addAgent(jsonObj, taskNode, sessionNode) {
        let agentId = "nidm:agent_" + jsonObj['SubjectID'];
        let agentNode = store.rdf.createNamedNode(store.rdf.resolve(agentId));
        this.rgraph.add(store.rdf.createTriple(agentNode,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:a")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Agent"))));

        if (jsonObj.hasOwnProperty('DateOfBirth')) {
            this.rgraph.add(store.rdf.createTriple(agentNode,
                store.rdf.createNamedNode(store.rdf.resolve("nidm:dateOfBirth")),
                store.rdf.createLiteral(jsonObj['DateOfBirth'], null, store.rdf.resolve("xsd:dateTime"))));
        }

        this.rgraph.add(store.rdf.createTriple(agentNode,
            store.rdf.createNamedNode(store.rdf.resolve("prov:wasAssociatedWith")),
            taskNode));

        this.rgraph.add(store.rdf.createTriple(agentNode,
            store.rdf.createNamedNode(store.rdf.resolve("prov:wasAssociatedWith")),
            sessionNode));
        return agentNode;
    }

    addAcquisitionObject(jsonObj, taskNode, agentNode) {
        let acqId = "nidm:entity_" + jsonObj['objID'];
        let acqFieldObj = jsonObj['fields'];
        let acqNode = store.rdf.createNamedNode(store.rdf.resolve(acqId));
        this.rgraph.add(store.rdf.createTriple(acqNode,
            store.rdf.createNamedNode(store.rdf.resolve("rdf:type")),
            store.rdf.createNamedNode(store.rdf.resolve("prov:Entity"))));
        for (let key1 in acqFieldObj) {
            let key = key1.replace(/\s+/g, '');
            if (key === 'interview_date') {
                console.log("key: ", key, " acqFieldOb:", acqFieldObj[key]);
                this.rgraph.add(store.rdf.createTriple(acqNode,
                    store.rdf.createNamedNode(store.rdf.resolve("nidm:interview_date")),
                    store.rdf.createLiteral(acqFieldObj[key], null, store.rdf.resolve("xsd:dateTime"))));
            } else {
                this.rgraph.add(store.rdf.createTriple(acqNode,
                    store.rdf.createNamedNode(store.rdf.resolve("nidm:" + key)),
                    store.rdf.createLiteral(acqFieldObj[key1])));
            }
        }
        this.rgraph.add(store.rdf.createTriple(acqNode,
            store.rdf.createNamedNode(store.rdf.resolve("prov:wasGeneratedBy")),
            taskNode));

        this.rgraph.add(store.rdf.createTriple(acqNode,
            store.rdf.createNamedNode(store.rdf.resolve("prov:wasAttributedTo")),
            agentNode));
        return acqNode;
    }


} // End of Class definition

/**
 ** Add/Insert the NIDM graph created to the store with specifc URI
 **/
function _addToStore(nidmGraph, graphId, addCallback) {
    store.insert(nidmGraph.rgraph, graphId, function (err) {
        if (err) {
            console.log("Not able to insert subgraph to nidm:graph");
        }
        addCallback(graphId);
    })//insert
}

/**
 ** Serialize To Turtle
 **/
function serializeToTurtle(sObj) {
    let s = "";
    let num_nodes = Object.keys(sObj).length;
    let count = 0;

    for (var key in sObj) {
        let pfname = key.split("/");
        let iri = key.split("#");
        let kname = pfname[pfname.length - 1].split("#");
        let iri_complete = iri[0] + "#";
        let prefix_name = getPrefix(iri_complete);
        let node_name = prefix_name + ":" + kname[1];
        console.log("~~node name:~~~ ", node_name);
        s = s + node_name + " ";

        let node_length = sObj[key].length;
        let pObj = sObj[key];
        for (let i = 0; i < node_length - 1; i++) {
            let pf_key = getPrefixKeyForm(pObj[i]);
            s = s + pf_key + " ;\n";
            s = s + "  "
        }
        let pf_key = getPrefixKeyForm(pObj[node_length - 1]);
        s = s + pf_key + " .\n";
    }//for
    return s;
}

/**
 ** Convert to Prefix:Key Form from URI
 **/
function getPrefixKeyForm(sobj) {
    let key = Object.keys(sobj)[0];
    let pfname = key.split("/");
    let iri = key.split("#");
    let key_name = '';
    let iri_complete = '';

    let kname = pfname[pfname.length - 1].split("#");
    if (kname.length === 1) {
        key_name = kname[0];
        iri_complete = key.substring(0, key.indexOf(kname[0]));
    } else {
        key_name = kname[1].replace(/\s+/g, '');
        iri_complete = iri[0] + "#";
    }
    let prefix_name = getPrefix(iri_complete);
    let node_name = prefix_name + ":" + key_name + " ";
    let value = sobj[key];
    //dateTime
    if (value.indexOf('^^') === -1) {
        pfname = value.split("/");
        if (pfname.length > 1) {
            kname = pfname[pfname.length - 1].split("#");
            if (kname.length > 1) {
                key_name = kname[1].replace(/\s+/g, '');
            } else {
                key_name = kname[1];
            }
            prefix_name = kname[0];
            node_name = node_name + prefix_name + ":" + key_name + " ";
        } else {
            node_name = node_name + value;
        }
    } else {
        console.log("daTETIME TYPE");
        let xtype = value.split("^^");
        console.log("xtype: ", xtype);
        let parr = xtype[1].substring(1, xtype[1].length - 1).split("#");
        console.log("parr: ", parr);
        prefix_name = getPrefix(parr[0] + "#");
        node_name = node_name + xtype[0] + "^^" + prefix_name + ":" + parr[1];
    }
    return node_name;
}

/**
 ** Saves the RDF Graph to Store
 ** Serializes to Turtle file
 **/
var _saveToRDFstore = function (nidmGraph, graphId, fileName, callback_tstring) {
    let tstring = "";
    let cpath = path.join(userData, '/uploads/acquisition/');

    fs.stat(cpath + fileName, function (err, stat) {
        console.log(cpath + fileName);
        if (err == null) {
            console.log('File exists');
            tstring = tstring + "\n"
        } else if (err.code === 'ENOENT') {
            console.log("File does not exist");
            // TODO: Add a method to automatically identify the namespace, add prefix and object properties
            tstring = "@prefix nidm: <" + store.rdf.prefixes.get("nidm") + "> .\n";
            tstring = tstring + "@prefix rdf: <" + store.rdf.prefixes.get("rdf") + "> .\n";
            tstring = tstring + "@prefix prov: <" + store.rdf.prefixes.get("prov") + "> .\n";
            tstring = tstring + "@prefix dc: <" + store.rdf.prefixes.get("dc") + "> .\n";
            tstring = tstring + "@prefix xsd: <" + store.rdf.prefixes.get("xsd") + "> .\n";
            tstring = tstring + "@prefix provone: <" + store.rdf.prefixes.get("provone") + "> .\n";
        } else {
            console.log('Some other error: ', err.code);
        }
        /*
          Adding to Store
        */
        _addToStore(nidmGraph, graphId, function (graphId) {
            console.log("addToStore callback:", graphId);
            store.graph(graphId, function (err, graph) {
                let subject = {};
                let objS = {};
                graph.forEach(function (triple) {
                    if (!(triple.subject.nominalValue in subject)) {
                        subject[triple.subject.nominalValue] = [];
                    }
                    objS = {};
                    objS[triple.predicate.toString()] = triple.object.toString();
                    subject[triple.subject.nominalValue].push(objS);
                });
                console.log("----Serializing graph to turtle --->>>");
                let s = serializeToTurtle(subject);
                tstring = tstring + s;
                callback_tstring(graphId, tstring);
            })//graph
        })
    }) //fs.stat
};

module.exports = {
    addToStoreNamespace: _addToStoreNamespace,
    rdfStoreSetup: _rdfStoreSetup,
    getRegisteredGraphsList: _getRegisteredGraphsList,
    saveToRDFstore: _saveToRDFstore,
    addToStore: _addToStore,
    NIDMGraph: NIDMGraph
};
