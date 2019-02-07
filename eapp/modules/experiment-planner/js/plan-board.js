let serverURL = "http://127.0.0.1:3000";

projPlanObj = JSON.parse(localStorage.getItem("projectPlanObj"));
console.log("project plan Obj:", projPlanObj);

projPlanObj2KanbanObj();
newPlanObj = JSON.parse(localStorage.getItem("newPlanObj"));

var sessionColumnTitle = '';

console.log("[plan-board.js] newPlanObj:--- ", newPlanObj);
var backButton = ' <a href="/experiment-planner/html/plan-mgm.html"><span class="glyphicon glyphicon-backward"' +
    ' style="float:right;"></span></a>';
/*
* Setting up the UI for experiment plan information - Name and description
* and update Modal for the plan
*/
$('#planInfo').append('<h4 id="pname">' + newPlanObj['Name'] + backButton + ' <a data-toggle="modal" href="#updatePlanInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a></h4><hr>');
$('#planInfo').append(createModal('updatePlanInfoModal', 'Update Plan Info', 'Update'));
let expInfoForm = new AlpacaForm('#body-updatePlanInfoModal');
createPlanInfoForm(expInfoForm, "updatePlanInfoModal", newPlanObj["Name"], newPlanObj["Description"]);

if (projPlanObj["Number Of Sessions"] !== 0) {
    console.log("--- displaying Kanban ---");
    let sessions = projPlanObj["Sessions"];
    if (sessions[0]["Instruments"].length === 0) {
        addToSourcelocalData(sessions[0]["Session Name"], "task0", "", "", "", "");
        console.log("PlansArray Adding 0th task::: ", plansArray);
    }
    $('#div-kanban').jqxKanban('destroy');
    $('#div-addColumn').empty();
    $('#div-addColumn').remove();
    $('#div-planBoard').append('<div class="col-md-4" id="div-addColumn"></div>');
    $('#div-planBoard').append('<div class="col-md-7" id="div-kanban"></div>');
    createKanbanBoard(sessions[0]["Session Name"], sessions[0]["Session Name"]);
}

/*
* Update Plan Info - Name and Description
*/
$('#btn-close-updatePlanInfoModal').on("click", function () {
    console.log("plan name", $("#updatePlanInfoModal-name").val());
    console.log("desc: ", $("#planDescription").val());
    let name = $("#updatePlanInfoModal-name").val();
    let desc = $("#planDescription").val();
    if (name !== "") {
        newPlanObj["Name"] = $("#updatePlanInfoModal-name").val();
    }
    if (desc !== "") {
        newPlanObj["Description"] = $("#planDescription").val();
    }
    localStorage.setItem("newPlanObj", JSON.stringify(newPlanObj));
    $('#pname').html(newPlanObj['Name'] + backButton + ' <a data-toggle="modal" href="#updatePlanInfoModal"><span class="fa fa-pencil" style="float:right;"></span></a>');
    updatePlanInfo();
    submitPlan().then(function () {
        console.log("[update info - name, desc] Plan Submitted and Saved!");
    })
});

$('#div-addColumn').append(addSessionColumn());

/**
 ** Check for unique session/column name
 **/
$(document).on('mouseout', '#sessionName', function (e) {
    e.preventDefault();
    $('#alert-msg').empty();

    let sname = $('#sessionName').val();
    if (existInColumnArray(sname)) {
        $('#alert-msg').append('<div class="alert alert-danger alert-dismissible" role="alert">\
  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
  <strong>Warning!</strong> Session already exists! Choose another name</div>');

    } else if (sname === '') {
        $('#btn-add-session').prop('disabled', true);
    } else {
        $('#btn-add-session').prop('disabled', false);
        console.log("you can add the session");
    }
});

/**
 ** Add a new Session/Column
 **/
$(document).on('click', '#btn-add-session', function (e) {
    let sname = $('#sessionName').val();
    console.log("session name:", sname);
    if (sname !== '') {
        addToColumnArray(sname);
        console.log("newPlanObj:  ", newPlanObj);
        localStorage.setItem("newPlanObj", JSON.stringify(newPlanObj));
        $('#div-kanban').jqxKanban('destroy');
        $('#div-addColumn').empty();
        $('#div-addColumn').remove();
        $('#div-planBoard').append('<div class="col-md-4" id="div-addColumn"></div>');
        $('#div-addColumn').append(addSessionColumn());
        $('#div-planBoard').append('<div class="col-md-7" id="div-kanban"></div>');
        addToSourcelocalData(sname, "task0", "", "", "", "");
        console.log("PlansArray Adding 0th task::: ", plansArray);
        createKanbanBoard(sname, sname);
        addToLogsArray('Added Session Column');
        console.log("LogsArray: ", logsArray);
        submitPlan().then(function () {
            console.log("[Add New Session] Plan Submited and Saved!");
        })
    }
    $('#newSessionModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
});

$('[data-toggle="popover"]').popover();

/**
 ** Create Kanban board with new data
 **/
function createKanbanBoard(name, label) {

    console.log("[createKanbanBoard] columnArray:::", columnArray);
    let kCO = {};
    kCO["template"] = setTemplate();
    kCO["resources"] = new $.jqx.dataAdapter(setResources());
    kCO["source"] = new $.jqx.dataAdapter(setSources(name, label));
    kCO["itemRenderer"] = function (element, item, resource) {
        //console.log("element: ", element)
        console.log("item: ", item);
        console.log("resource", resource);
        $(element).find(".jqx-kanban-item-color-status").html("<span style='line-height: 23px; margin-left: 5px; color:white;'>" + resource.name + "</span>");
        $(element).find(".jqx-kanban-item-content").append('<div><a href="#" data-toggle="popover" title="' + item.text + '" data-placement="right" data-trigger="hover" data-content="' + item.content.desc + '">Description</a></div>\
      <br>\
      <div><p>Instrument: ' + item.content.instrumentName + '</p></div>\
      <div><p>Estimated Time:' + item.content.estimateTime + '</p></div>')
    };
    kCO["columns"] = columnArray;
    kCO["columnRenderer"] = function (element, collapsedElement, column) {
        var columnItems = $("#div-kanban").jqxKanban('getColumnItems', column.dataField).length;
        // update header's status.
        element.find(".jqx-kanban-column-header-status").html(" (" + columnItems + ")");
        element.find("div.jqx-window-collapse-button-background.jqx-kanban-column-header-custom-button").after('<div class="jqx-window-collapse-button-background jqx-kanban-column-header-custom-button"><a data-toggle="modal" href="#updateSessionModal"><div id = "test1" style="width: 100%; height: 100%; left:-30px; top:-15px" class="fa-edit-icon"></div></a></div>');
        $('div.jqx-icon-plus-alt').attr("data-toggle", "modal");
        $('div.jqx-icon-plus-alt').attr("data-target", "#itemModal");
    };
    kCO["width"] = '80%';
    kCO["headerHeight"] = 50;
    $('#div-kanban').jqxKanban(kCO);
    for (let i = 0; i < plansArray.length; i++) {
        if (plansArray[i].state === name && plansArray[i].id === "0") {
            $('#div-kanban').jqxKanban('removeItem', "0");
            plansArray.splice(i, 1);
            break;
        }
    }
    updatePlanInfo()
}

$(document).on('columnAttrClicked', '#div-kanban', function (event) {
    event.preventDefault();
    var args = event.args;
    console.log("Argument: ", args);
    if (args.attribute === "title") {
        console.log("edit column header button clicked");
        sessionColumnTitle = args.column.dataField;
        console.log("sessionColumnTitle", sessionColumnTitle);
        if ($("#updateSessionModal").length) {
            console.log("updating the session title placeholder");
            $("#updateSessionName").attr("placeholder", sessionColumnTitle);
        } else {
            console.log("No update session modal found..so adding one ...");
            $("#div-kanban").append(updateSessionColumnHeader(sessionColumnTitle));
            $('#div-kanban').append(createModal2('confirmDelete', 'Delete', 'Yes', 'No'));
            $('#body-confirmDelete').append('Do you want to delete ' + sessionColumnTitle + '?');
            $('#btn-delete-column').attr("data-toggle", "modal");
            $('#btn-delete-column').attr("data-target", "#confirmDelete");

        }
    } else {
        if (args.attribute == "button") {
            console.log("Add button clicked");
            console.log("showing add item modal");
            if ($("#updateSessionModal").length) {
                let itemForm = new AlpacaForm('#body-itemModal');
                createItemForm(itemForm, "itemModal");
            } else {
                $('#div-kanban').append(createModal('itemModal', 'Add Item', 'Add'));
                let itemForm = new AlpacaForm('#body-itemModal');
                createItemForm(itemForm, "itemModal");
            }
            console.log("Adding Item to Column: ", args.column.dataField);;
            localStorage.setItem("addItemToColumn", args.column.dataField)
            $('#itemModal').modal('show');
        }
    }
})
$(document).on('show.bs.modal', '#updateSessionModal', function (e) {
    //e.preventDefault()
    console.log('update Modal shown');
    $('#updateSessionName').focus();
})

//$(document).on('hidden.bs.modal','#updateSessionModal', function(e){
$(document).on('click', '#btn-update-column', function (e) {
    e.preventDefault();
    let sname = $('#updateSessionName').val();
    console.log("New Session Name Entered:", sname);
    if (sname !== '') {
        checkAndUpdateColumnArray(sessionColumnTitle, sname);
        if (plansArray.length > 0) {
            checkAndUpdatePlanArray(sessionColumnTitle, sname);
        }
        console.log("ColumnArray:-->  ", columnArray);
        console.log("newPlanObj:  ", newPlanObj);
        localStorage.setItem("newPlanObj", JSON.stringify(newPlanObj));
        $('#div-kanban').jqxKanban('destroy');
        $('#div-addColumn').empty();
        $('#div-addColumn').remove();
        $('#div-planBoard').append('<div class="col-md-4" id="div-addColumn"></div>');
        $('#div-addColumn').append(addSessionColumn());
        $('#div-planBoard').append('<div class="col-md-7" id="div-kanban"></div>');
        addToSourcelocalData(sname, "task0", "", "", "", "");
        console.log("PlansArray Adding 0th task::: ", plansArray);
        addToResourcelocalData("0", "", "");
        createKanbanBoard(sname, sname);
        addToLogsArray('Updated Session Name');
        console.log("LogsArray: ", logsArray);
        submitPlan().then(function () {
            console.log("Plan Submited and Saved!");
        })
    } else {
        console.log("removing update SessionModal---");
        $('#updateSessionModal').remove();
    }
    $('#updateSessionModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
})

$(document).on('click', '#btn-save-confirmDelete', function (e) {
    e.preventDefault();
    console.log("deleting session column title:::", sessionColumnTitle);
    updatePlansArray(sessionColumnTitle);
    updateColumnArray(sessionColumnTitle);
    console.log("[Delete-Column] plan Array after delete: ", plansArray);
    console.log("[Delete-Column] column Array after delete: ", columnArray);
    $('#div-kanban').jqxKanban('destroy');
    $('#div-addColumn').empty();
    $('#div-addColumn').remove();
    $('#div-planBoard').append('<div class="col-md-4" id="div-addColumn"></div>');
    $('#div-addColumn').append(addSessionColumn());
    $('#div-planBoard').append('<div class="col-md-7" id="div-kanban"></div>');
    let plength = plansArray.length;
    let clength = columnArray.length;
    if (plength === 0 && clength !== 0) {
        addToSourcelocalData(columnArray[0].dataField, "task0", "", "", "", "");
        createKanbanBoard(columnArray[0].dataField, columnArray[0].dataField);
        console.log("PlansArray Adding 0th task, delete Action::: ", plansArray);
        submitPlan().then(function () {
            console.log("Plan Submited and Saved!");
        })
    } else if (plength !== 0 && clength !== 0) {
        console.log("else if: creating kanban");
        createKanbanBoard(columnArray[0].dataField, columnArray[0].dataField);
        submitPlan().then(function () {
            console.log("Plan Submited and Saved!");
        })
    } else {
        console.log("do not create kanban");
        updatePlanInfo();
        submitPlan().then(function () {
            console.log("Plan Submited and Saved!");
        })
    }
    addToLogsArray('Deleted Session Column');
    console.log("LogsArray: ", logsArray);
    $('#updateSessionModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
})
$(document).on('click', '#btn-close-confirmDelete', function (e) {
    e.preventDefault();
    console.log("Not Deleted---");
    $('#updateSessionModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
})
$(document).on('hidden.bs.modal', '#itemModal', function (e) {
    e.preventDefault();
    let taskName = $('#itemModal-task').val();
    let desc = $('#itemModal-desc').val();
    let instrumentName = $('#itemModal-inst').val();
    let estimateTime = $('#itemModal-time').val();
    let userLogin = $('#itemModal-per').select2('data')[0];
    let user = '';
    console.log("itemselect2 data: ", $('#itemModal-per').select2('data').length);
    let len = $('#itemModal-per').select2('data').length;
    if (len !== 0) {
        console.log("len is zero: ", len);
        let personnelItem = {};
        personnelItem['user'] = userLogin.login;
        personnelItem['uid'] = userLogin.id;
        personnelItem['url'] = userLogin.url;
        personnelItem['avatar_url'] = userLogin.avatar_url;
        personnelArray.push(personnelItem);
        user = userLogin.login;
        addToResourcelocalData("id", userLogin.login, userLogin.avatar_url);
    } else {
        console.log("No User Selected");
        addToResourcelocalData(0, "No Name", "");
    }
    let columnName = localStorage.getItem("addItemToColumn");
    console.log("columnName To which Item needs to be added :  ", columnName);
    console.log("new item Value taskName: ", taskName, " instrumentName:", instrumentName, " estimateTime: ", estimateTime, "user: ", user);

    addToSourcelocalData(columnName, taskName, instrumentName, estimateTime, user, desc);
    $('#body-itemModal').alpaca("destroy");
    $('#div-kanban').jqxKanban('destroy');
    $('#div-addColumn').empty();
    $('#div-addColumn').remove();
    $('#div-planBoard').append('<div class="col-md-4" id="div-addColumn"></div>');
    $('#div-addColumn').append(addSessionColumn());
    $('#div-planBoard').append('<div class="col-md-7" id="div-kanban"></div>');
    createKanbanBoard(columnName, columnName);
    addToLogsArray('Added New Task');
    console.log("LogsArray: ", logsArray);
    $('[data-toggle="popover"]').popover();
    if (taskName === '' && desc === '' && instrumentName === '' && estimateTime === '' && len === 0) {

    } else {
        submitPlan().then(function () {
            console.log("Plan Submited and Saved!");
        })
    }
});

$(document).on('itemAttrClicked', '#div-kanban', function (event) {
    event.preventDefault();
    var args = event.args;
    $('#div-kanban').append(createModal2('itemDeleteModal', 'Delete', 'Yes', 'No'));
    $('#body-itemDeleteModal').empty();
    $('#body-itemDeleteModal').append('Do you want to delete ' + args.item.text + '?');
    if (args.attribute === "template") {
        $('#itemDeleteModal').modal('show');
        localStorage.setItem('itemDeleteId', args.item.id);
    } else if (args.attribute === "content") {
        console.log("content clicked: ", args);
        $('#div-kanban').append(createModal('itemEditModal', 'Edit Item', 'Update'));

        if ($('#body-itemEditModal').alpaca("exists")) {
            $('#body-itemEditModal').alpaca("destroy");
        }
        let itemEditForm = new AlpacaForm('#body-itemEditModal');

        editItemForm(itemEditForm, "itemEditModal", args.item.text, args.item.content, args.item.resourceId);

        localStorage.setItem('itemBeingUpdated', JSON.stringify(args.item));
    } else {
        console.log("other attribute:", args);
    }
})
$(document).on('click', '#btn-save-itemDeleteModal', function (e) {
    let itemId = localStorage.getItem('itemDeleteId');
    $('#div-kanban').jqxKanban('removeItem', itemId);
    deleteItemFromPlanArray(itemId);
    addToLogsArray('Deleted a task');
    console.log("LogsArray: ", logsArray);
    updatePlanInfo();
    submitPlan().then(function () {
        console.log("[itemDelete] Plan Submited and Saved!");
    })
});

$(document).on('show.bs.modal', '#itemEditModal', function (e) {
    console.log('Item Edit Modal shown');
    $('#itemEditModal-task').focus();
});

$(document).on('click', '#btn-close-itemEditModal', function (e) {
    //e.preventDefault()
    let item = JSON.parse(localStorage.getItem('itemBeingUpdated'));
    console.log("Update: Item:", item);
    let taskName = $('#itemEditModal-task').val();
    let desc = $('#itemEditModal-desc').val();
    let instrumentName = $('#itemEditModal-inst').val();
    let estimateTime = $('#itemEditModal-time').val();
    let userLogin = $('#itemEditModal-per').select2('data')[0];
    let user = ''
    console.log("itemselect2 data: ", $('#itemEditModal-per').select2('data'));
    console.log('userLogin: ', userLogin);
    if ($('#itemEditModal-per').select2('data').length !== 0) {
        let personnelItem = {};
        personnelItem['user'] = userLogin.login;
        personnelItem['uid'] = userLogin.id;
        personnelItem['url'] = userLogin.url;
        personnelItem['avatar_url'] = userLogin.avatar_url;
        personnelArray.push(personnelItem);
        console.log("updated PersonnelArray: ", personnelArray);
        addToResourcelocalData("id", userLogin.login, userLogin.avatar_url);
        user = userLogin.login;
    } else {
        user = inv_resources[item.resourceId];
    }
    // check if the item content values already existed
    if (taskName === '') {
        console.log("taskName did not change. keeping the original value");
        taskName = item.text;
    }
    if (desc === '') {
        console.log("desc did not change ");
        desc = item.content.desc;
    }
    if (estimateTime === '') {
        console.log("Time did not change");
        estimateTime = item.content.estimateTime;
    }
    console.log("updated item Value taskName: ", taskName, " instrumentName:", instrumentName, " estimateTime: ", estimateTime, "user: ", user);
    console.log("column to which the item belongs: ", item.status);
    let columnName = item.status;
    updateSourcelocalData(columnName, item.id, taskName, instrumentName, estimateTime, user, desc);
    let tobj = {"desc": desc, "instrumentName": instrumentName, "estimateTime": estimateTime};
    $('#body-itemEditModal').alpaca("destroy");
    $('#div-kanban').jqxKanban('destroy');
    $('#div-addColumn').empty();
    $('#div-addColumn').remove();
    $('#div-planBoard').append('<div class="col-md-4" id="div-addColumn"></div>');
    $('#div-addColumn').append(addSessionColumn());
    $('#div-planBoard').append('<div class="col-md-7" id="div-kanban"></div>');
    createKanbanBoard(columnName, columnName);
    addToLogsArray('Edited Task Information');
    console.log("LogsArray: ", logsArray);
    submitPlan().then(function () {
        console.log("Plan Submited and Saved!");
    });
    $('[data-toggle="popover"]').popover();
    $('#itemEditModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
});

$(document).on('itemMoved', '#div-kanban', function (event) {
    event.preventDefault();
    var args = event.args;
    var itemId = args.itemId;
    console.log("itemMoved is raised: ", args);
    let oldCid = args.oldColumn.headerElement[0].nextElementSibling.id;
    let newCid = args.newColumn.headerElement[0].nextElementSibling.id;
    console.log("oldCid, newCid:", oldCid, newCid);
    var oldColumnOrder = getListOrder(oldCid);
    var newColumnOrder = getListOrder(newCid);
    console.log("oldColumnOrder: ", oldColumnOrder);
    console.log("newColumnOrder: ", newColumnOrder);
    shufflePlanArray(oldColumnOrder, newColumnOrder, args.oldColumn.dataField, args.newColumn.dataField);
    addToLogsArray('Moved An Item');
    $('[data-toggle="popover"]').popover();
    updatePlanInfo();
    submitPlan().then(function () {
        console.log("[Item Moved] Plan Submited and Saved!");
    })
});

$('#btn-back-ep').click(function () {
    window.location.href = serverURL + "/experiment-planner/html/plan-mgm.html";
});

$('#btn-back-mn').click(function () {
    window.location.href = serverURL + "/main";
});
