/** Global Variables **/
let instObj = {}
let serverURL = "http://127.0.0.1:3000"

/*
* A generic modal where Modal body is an new alpaca form
*/
function createModal(modalID, title,modalFooter){
  let htmlStr = '\
        <div id="'+modalID+'" class="modal fade" role="dialog">\
        <div class="modal-dialog">\
        <!-- Modal content-->\
          <div class="modal-content">\
          <div class="modal-header">\
            <button type="button" class="close" data-dismiss="modal">&times;</button>\
            <h4 class="modal-title" style="text-align-last: center">'+title+'</h4>\
          </div>\
          <div class="modal-body"><div id=body-'+modalID+'></div></div>\
          <div class="modal-footer" style="text-align:center">\
            <button type="button" class="btn btn-default" data-dismiss="modal" id="btn-close-'+ modalID+'">'+modalFooter+'</button>\
          </div>\
        </div>\
      </div>\
    </div>'
  return htmlStr
}
/*
* Alpaca form for Instrument Information
*/
function createInstrumentInfoForm(form, modalID, name, desc){
  form.inputForm('Instrument Name', 'Instrument Name', modalID+'-name', 'string', false, name, false)
  form.textAreaForm('Description', 'Description', 'instDescription','string', undefined, desc, false)
  //form.submitBtnForm('Update Plan',sAction)
  form.alpacaGen()
}
