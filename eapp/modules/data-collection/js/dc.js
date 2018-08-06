$.fn.select2.defaults.set("theme", "bootstrap")
$("#div-planListMenu").select2()

collectionObj = JSON.parse(localStorage.getItem("collectionObj"))
console.log("[dc.js]collectionObj: ", collectionObj)

var backButton = ' <a href="/data-collection/html/dc-list.html"><span class="glyphicon glyphicon-backward"' +
    ' style="float:right;"></span></a>'
/*
/*saveObj = JSON.parse(localStorage.getItem("saveObj"))
console.log("[dc.js] saveObj:", saveObj)*/

$('#collectionInfo').append('<h4 id="collectionName">' + collectionObj['Name'] + backButton + ' <a data-toggle="modal"' +
    ' href="#updateCollectionInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a></h4><hr>')
$('#collectionInfo').append(createModal('updateCollectionInfoModal', 'Update Collection Information', 'Update'))
let collectionInfoForm = new AlpacaForm('#body-updateCollectionInfoModal')
createCollectionInfoForm(collectionInfoForm, "updateCollectionInfoModal", collectionObj["Name"], collectionObj["Description"])

/*
* Update Collection Info - Name and Description
*/
$(document).on('hidden.bs.modal', '#updateCollectionInfoModal', function (e) {
    console.log("[dc] collection name", $("#updateCollectionInfoModal-name").val())
    console.log("[dc] desc: ", $("#collectionDescription").val())
    let name = $("#updateCollectionInfoModal-name").val()
    let desc = $("#collectionDescription").val()
    if (name != "") {
        collectionObj["Name"] = $("#updateCollectionInfoModal-name").val()
    }
    if (desc != "") {
        collectionObj["Description"] = $("#collectionDescription").val()
    }
    localStorage.setItem("collectionObj", JSON.stringify(collectionObj))
    $('#collectionName').html(collectionObj['Name'] + backButton + ' <a data-toggle="modal"' +
        ' href="#updateCollectionInfoModal"><span' +
        ' class="fa fa-pencil" style="float:right;"></span></a>')
    updateCollectionInfo()
})

addPlan()

/**
 ** Updating and Saving the updated collection info into the format for rdf serialization
 **/
function updateCollectionInfo() {
    localStorage.setItem("collectionObj", JSON.stringify(collectionObj))
    console.log("[dc] update collection obj info: ", collectionObj)
}

function displayPlanList() {
    return new Promise(function (resolve) {
        $.ajax({
            type: "GET",
            url: serverURL + "/project-plans",
            accept: "application/json",
            success: function (data) {
                console.log('acquistions forms:success', data)
                let pforms = data.list
                if (pforms.length == 0) {
                    console.log("no forms to display")
                    resolve([])
                } else {
                    resolve(pforms)
                }
            }
        })
    })
}

function addPlan() {
    displayPlanList().then(function (planList) {
        var values = planList.map(function (planName) {
            return new Promise(function (resolve) {
                let url = serverURL + "/project-plans/" + planName
                $.ajax({
                    type: "GET",
                    url: url,
                    accept: "application/json",
                    success: function (data) {
                        console.log('acquisitions term forms:success', data)
                        resolve(data)
                    }//data
                })
            })
        })
        return Promise.all(values)
    }).then(function (planObjs) {
        console.log("all plan obj: ", planObjs)
        if (planObjs.length !== 0) {
            for (let i = 0; i < planObjs.length; i++) {
                $("#div-planListMenu").append('<option id="' + planObjs[i]["Project Name"].trim() + '" value="' + planObjs[i]["Project Name"] + '">' + planObjs[i]["Project Name"] + '</option>')
                planListObjs[planObjs[i]["Project Name"].trim()] = planObjs[i]
            }
        }
    })
}


$("#div-planListMenu").change(function () {
    let planSelected = $("#div-planListMenu").val()
    planObjSelected = planListObjs[planSelected.trim()]
    localStorage.setItem('planObjSelected', JSON.stringify(planObjSelected))
    dataTableSource = []
    sessionNumbers = []
    sessionNames = []
    instrumentNames = []
    taskNames = []
    statuses = []
    sessionIds = []
    taskIds = []
    subjectIds = []
    loadPlan(planObjSelected)

    //let test = JSON.parse(localStorage.getItem('planObjSelected'))
    //console.log("test: ", test)
})


function loadPlan(plan) {
    convert2jqxTableSource(plan)

    console.log("datatable source inside load plan -------", dataTableSource)
    var source = {
        localData: dataTableSource,
        dataType: "array",
        dataFields: [{
                name: 'sessionId',
                type: 'string'
            },
            {
                name: 'sessionNumber',
                type: 'string'
            }, {
                name: 'sessionName',
                type: 'string'
            }, {
                name: 'taskId',
                type: 'string'

            }, {
                name: 'taskName',
                type: 'string'
            }, {
                name: 'instrumentName',
                type: 'string'
            }, {
                name: 'status',
                type: 'string'
            }]
    }

    var dataAdapter = new $.jqx.dataAdapter(source)
    $("#activityTable").jqxDataTable({
        width: '100%',
        theme: 'energyblue',
        //pageable: true,
        //pagerMode: 'advanced',
        filterable: true,
        source: dataAdapter,
        columns: [{
            text: 'Session Number',
            dataField: 'sessionNumber',
            width: '10%'
        }, {
            text: 'Session Name',
            dataField: 'sessionName',
            width: '20%'
        }, {
            text: 'Task Name',
            editable: false,
            dataField: 'taskName',
            width: '20%'
        }, {
            text: 'Instrument Name',
            dataField: 'instrumentName',
            width: '40%'
            //cellsAlign: 'right',
            //align: 'right'
        }, {
            text: 'Status',
            dataField: 'status',
            width: '10%'
        }]
    })
    $('#activityTable').on('rowClick', function (event) {
        var args = event.args
        var row = args.row
        var index = args.index;
        // row key
        var rowKey = args.key;

        console.log("args: ", args)
        console.log("row clicked:", row)
        console.log("index: ", index)
        console.log("rowKey: ", rowKey)
        event.stopPropagation()
        row['subjectId'] = $("#subjectId").val()
        //row['version'] = dataAdapter
        localStorage.setItem("action", JSON.stringify(row))
        window.location.href = serverURL + "/data-collection/html/dc-form.html"

        /*$("#activityTable").jqxDataTable('updateRow', index, {
            sessionNumber: row.sessionNumber,
            sessionName: row.sessionName,
            taskName: row.taskName,
            instrumentName:row.instrumentName,
            status: "completed"
        });*/
    })
}

function convert2jqxTableSource(plan) {

    let numSessions = plan["Sessions"].length
    let sessions = plan["Sessions"]
    let m = 0
    for (let i = 0; i < numSessions; i++) {
        let numInst = sessions[i]["Instruments"].length
        let inst = sessions[i]["Instruments"]
        let sessionId = ''

        for (let j = 0; j < numInst; j++) {
            let taskId = uuid()
            m++
            if (j === 0) {
                sessionId = uuid()
            }
            sessionIds.push(sessionId)
            sessionNumbers.push(i + 1)
            sessionNames.push(sessions[i]["Session Name"])
            taskIds.push(taskId)
            taskNames.push(inst[j]["Task Name"])
            instrumentNames.push(inst[j]["InstrumentName"])
            if (inst[j].hasOwnProperty('status')) {
                console.log("if: [dc:] status already set: ", inst[j]["status"])
                statuses.push(inst[j]["status"])
            } else {
                console.log("else: status is being added to planObj and statuses")
                inst[j]["status"] = "Not completed"
                statuses.push(inst[j]["status"])
            }
        }
    }
    console.log("[dc:convert2jqxTableSource]:planObjSelected", planObjSelected)

    for (let k = 0; k < sessionNames.length; k++) {
        let row = {}
        row['sessionNumber'] = sessionNumbers[k]
        row['sessionName'] = sessionNames[k]
        row['taskName'] = taskNames[k]
        row['instrumentName'] = instrumentNames[k]
        row['status'] = statuses[k]
        row['sessionId'] = sessionIds[k]
        row['taskId'] = taskIds[k]
        dataTableSource[k] = row
    }
    console.log("---dataTableSource:--- ", dataTableSource)
    localStorage.setItem('dataTableSource', JSON.stringify(dataTableSource))
}
