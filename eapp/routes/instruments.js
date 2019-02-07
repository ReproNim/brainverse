module.exports = () => {

    const path = require('path');
    const bodyParser = require('body-parser');
    const writeJsonFile = require('write-json-file');
    const uuid = require('uuid-random');
    const loadJsonFile = require('load-json-file');
    const fs = require('fs');
    const moment = require('moment');
    const request = require('request');
    const jsonParser = bodyParser.json();
    const rdfHelper = require('./../util/nidme-graph.js');

    global.store = app.locals.store;

    app.get('/instruments/local/list', ensureAuthenticated, jsonParser, function (req, res) {
        let termDirPath = path.join(userData, '/uploads/termforms/');
        let listOfFiles = new Promise(function (resolve) {
            fs.readdir(termDirPath, function (err, list) {
                if (err) throw err;
                let instList = [];
                for (let i = 0; i < list.length; i++) {
                    if (list[i] !== ".DS_Store") {
                        instList.push(list[i]);
                    }
                }
                console.log("[1-/instruments/local/list]instruments lists:---> ", instList);
                resolve(instList)
            })
        });
        listOfFiles.then(function (list) {
            console.log("[/instruments/local/list] lists::: then---> ", list);
            let namesArr = list.map(function (fname) {
                return loadJsonFile(path.join(userData, '/uploads/termforms/' + fname))
            });
            return Promise.all(namesArr)
        }).then(function (obs) {
            let nameList = [];
            let recentObjs = {};
            let deleteList = [];
            // Getting the chain of derivation and getting the recent version
            for (let i = 0; i < obs.length; i++) {
                recentObjs[obs[i].shortName] = obs[i]
            }
            for (let j = 0; j < obs.length; j++) {
                let k = 0;
                let sname = obs[j].shortName;
                console.log("[/instruments/local/list]shortName: ", sname);
                while (recentObjs.hasOwnProperty(sname)) {
                    k++;
                    if (k !== 1) {
                        deleteList.push(sname);
                        console.log("[/instruments/local/list] - Delete shortName: ", sname)
                    }
                    sname = recentObjs[sname].DerivedFrom
                }
                console.log("[/instruments/local/list] deletList: -->", deleteList);
                for (l = 0; l < deleteList.length; l++) {
                    delete recentObjs[deleteList[l]]
                }
            }
            // -----------------------------
            let hashObj = {};
            let m = 0;
            for (let key in recentObjs) {
                let ob = recentObjs[key];
                let title = ob.Name.split(' ')[0];
                let psname = ob.shortName.split(' ');
                let shortName = psname[0];
                if (psname.length > 1) {
                    shortName = shortName + psname[psname.length - 1];
                }

                let fileName = 'terms-' + shortName + '-' + title + ".json";
                console.log("[/instruments/local/list] filename: -->", fileName);

                if (!hashObj.hasOwnProperty(ob.DerivedFrom)) {
                    hashObj[ob.DerivedFrom] = ob;
                    console.log("----Case 1:---- DerivedFrom")
                } else {
                    if (ob.DerivedFrom === "") {
                        m++;
                        hashObj[ob.DerivedFrom + "_" + m] = ob;
                        console.log("----Case 2:----DerivedFrom:-- ")
                    }
                }
            } //end of for loop
            for (var key in hashObj) {
                let ob = hashObj[key];
                let title = ob.Name.split(' ')[0];
                let psname = ob.shortName.split(' ');
                let shortName = psname[0];
                if (psname.length > 1) {
                    shortName = shortName + psname[psname.length - 1];
                }
                //let fileName = 'terms-'+ob.shortName+'-'+title+".json"
                let fileName = 'terms-' + shortName + '-' + title + ".json";
                nameList.push({"shortName": ob.shortName, "title": ob.Name, "author": ob.author, "filename": fileName})
            }
            console.log("[2-/instruments/local/list/] nameList:--> ", nameList);
            res.json({"list": nameList})
        })
    });

    app.get('/instruments/local/:shortName', ensureAuthenticated, jsonParser, function (req, res) {
        console.log("[/instruments/local/:shortName]: ", req.params.shortName);
        let termDirPath = path.join(userData, '/uploads/termforms/');
        var listOfFiles = new Promise(function (resolve) {
            fs.readdir(termDirPath, function (err, list) {
                if (err) throw err;
                let instList = [];
                for (let i = 0; i < list.length; i++) {
                    if (list[i] !== ".DS_Store") {
                        instList.push(list[i]);
                    }
                }

                resolve(instList);
            })
        });
        listOfFiles.then(function (list) {
            console.log("then 1 - [/instruments/local/:shortName]file list:---> ", list);
            let namesArr = list.map(function (fname) {
                return loadJsonFile(path.join(userData, '/uploads/termforms/' + fname))
            });
            return Promise.all(namesArr)
        }).then(function (obs) {
            let ob = {};
            for (let i = 0; i < obs.length; i++) {

                if (obs[i].shortName === req.params.shortName) {
                    console.log("shortName from list:", obs[i].shortName);
                    ob = obs[i];
                    break;
                }
            }
            res.send(ob)
        })
    });

    app.post('/instruments/local/new', ensureAuthenticated, jsonParser, function (req, res) {
        if (!req.body) return res.sendStatus(400);
        console.log('[instruments/dictionaries/] Received at server side');
        let term_info = req.body;
        term_info['DictionaryID'] = uuid();
        term_info['author'] = req.user.username;
        console.log(term_info);
        pid = term_info['DictionaryID'].split('-');
        psname = term_info['shortName'].split(' ');
        pname = term_info['Name'].split(' ');
        let shortName = psname[0];
        if (psname.length > 1) {
            shortName = shortName + psname[psname.length - 1];
        }
        let fileName = 'terms-' + shortName + '-' + pname[0] + '.json';
        console.log("New Instrument Name:::: ", fileName);
        let cpath = path.join(userData, '/uploads/termforms/' + fileName);
        writeJsonFile(cpath, req.body).then(() => {
            console.log('done');
            res.json({'tid': term_info['DictionaryID'], 'fid': fileName});
        })
    });

    // saving instruments locally and pushing to GitHub
    app.post('/instruments/github/new', ensureAuthenticated, jsonParser, function (req, res) {
        let user = req.user;
        if (!req.body) return res.sendStatus(400);
        console.log('[instruments/github/new] Received at server side');
        let term_info = req.body;
        term_info['DictionaryID'] = uuid();
        term_info['author'] = req.user.username;
        console.log(term_info);
        pid = term_info['DictionaryID'].split('-');
        psname = term_info['shortName'].split(' ');
        pname = term_info['Name'].split(' ');
        let shortName = psname[0];
        if (psname.length > 1) {
            shortName = shortName + psname[psname.length - 1];
        }

        let fileName = 'terms-' + shortName + '-' + pname[0] + '.json';
        console.log("New Instrument Name:::: ", fileName);
        //Local save
        let cpath = path.join(userData, '/uploads/termforms/' + fileName);
        writeJsonFile(cpath, term_info).then(() => {
            console.log('done');
        });

        //Saving to GitHub
        // create instruments repository in GitHub in user's account
        let url = 'https://api.github.com/';
        request.get({
            url: url + 'repos/' + req.user.username + '/instruments',
            headers: {'User-Agent': 'brainverse', 'accept': 'application/json'}
        }, function (err, resn, body) {
            //console.log(JSON.parse(body))
            //res.send(body)
            let jbody = JSON.parse(body);
            if ("message" in jbody) {
                console.log("has message: ");
                if (jbody.message === "Not Found") {
                    console.log("--Message not found--");
                    console.log("access_token", github_token);
                    // create the repo
                    let options = {
                        method: 'POST',
                        url: url + 'user/repos',
                        headers: {
                            'Authorization': 'token ' + github_token,
                            'User-Agent': 'brainverse',
                            'Content-Type': 'application/json'
                            //'Content-Type': 'multipart/form-data'
                        },
                        body: {
                            "name": "instruments",
                            "description": "Repository created by BrainVerse to save and share forms being using during experimental studies"
                        },
                        json: true
                    };
                    request(options, function (err1, resn1, body1) {
                        console.log("resn1.statusCode", resn1.statusCode);
                        if (!err1 && resn1.statusCode === 200 || resn1.statusCode === 201) {
                            console.log("resn1.statusCode", resn1.statusCode);
                            createFileInRepo(url, term_info, fileName, user)
                        } else if (resn1.statusCode === 202) {
                            setTimeout(createFileInRepo, 3000, url, term_info, fileName, user);
                        }
                    })
                } //ends - If block - NotFound
            } else {
                console.log("It already exist----");
                //create File in the repo
                createFileInRepo(url, term_info, fileName, user);
            }

            res.json({'tid': term_info['DictionaryID'], 'fid': 'terms-' + fileName});
        })// end of request GET end
    });

    function createFileInRepo(url, jsonTermObj, pathToFile, user) {
        let content = Buffer.from(JSON.stringify(jsonTermObj, undefined, 2)).toString('base64');
        let options = {
            method: 'PUT',
            url: url + 'repos/' + user.username + '/instruments/contents/' + pathToFile,
            headers: {
                'Authorization': 'token ' + github_token,
                'User-Agent': 'brainverse',
                'Content-Type': 'application/json'
            },
            body: {
                message: pathToFile + ' added',
                content: content
            },
            json: true
        };
        request(options, function (err, response, body) {
            console.log("statusCode for createFile: ", response.statusCode);
        })
    }

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/')
    }
};
