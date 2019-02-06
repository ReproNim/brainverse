/** Global Variables **/
let planListObjs = {};
let sessionNumbers = [];
let sessionNames = [];
let instrumentNames = [];
let taskNames = [];
let statuses = [];
let sessionIds = [];
let taskIds = [];
let subjectIds = [];
let dataTableSource = new Array();
let serverURL = "http://127.0.0.1:3000";
/** Global Variables **/

/*
* A generic modal where Modal body is an new alpaca form
*/
function createModal(modalID, title, modalFooter) {
    let htmlStr = '\
        <div id="' + modalID + '" class="modal fade" role="dialog">\
        <div class="modal-dialog">\
        <!-- Modal content-->\
          <div class="modal-content">\
          <div class="modal-header">\
            <button type="button" class="close" data-dismiss="modal">&times;</button>\
            <h4 class="modal-title" style="text-align-last: center">' + title + '</h4>\
          </div>\
          <div class="modal-body"><div id=body-' + modalID + '></div></div>\
          <div class="modal-footer" style="text-align:center">\
            <button type="button" class="btn btn-default" data-dismiss="modal" id="btn-close-' + modalID + '">' + modalFooter + '</button>\
          </div>\
        </div>\
      </div>\
    </div>';
    return htmlStr;
}

/*
* Alpaca form for Instrument Information
*/
function createCollectionInfoForm(form, modalID, name, desc) {
    form.inputForm('Collection Name', 'Collection Name', modalID + '-name', 'string', false, name, false);
    form.textAreaForm('Description', 'Description', 'collectionDescription', 'string', undefined, desc, false);
    form.alpacaGen();
}
