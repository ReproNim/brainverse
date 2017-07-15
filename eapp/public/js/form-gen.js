var formName = '';

function alpacaForm(el) {
  //BASE ALPACA CONSTRUCTOR
  this.baseForm =
    $(el).alpaca({
      "schema": {
        "title": formName,
        "type": "object",
        "properties": {
        }
      },
      "options": {
        "fields": {
        },
        "form":{
          "buttons":{
           "submit":{
             "title": "Submit",
             "click": function(){
               /* COMMENT: console.log(this) here points to proto.constructor.
               However, when any of the functions below are called, the "this" in the
               functions do not point to the proto.constructor*/
                console.log(this)
             }
           }
          }
        }
      }

    });
    console.log(this)

  //METHOD FOR INPUT FORMS
  var inputForm = function(name, placehold) {
    console.log(this)
    let itemId = name;
    let itemSchema = {
      "type": "string"
    };
    let itemOptions = {
      "label": itemId,
      "placeholder": placehold
    };
    this.topControl.addItem(itemId, itemSchema, itemOptions);
  }

  //METHOD FOR RADIO FORMS
  var radioForm = function(name, op1, op2) {
    let itemId = name;
    let itemSchema = {
      "enum": [op1, op2]
    };
    let itemOptions = {
      "type": "radio",
      "label": itemId,
      "removeDefaultNone": true
    };
    this.topControl.addItem(itemId, itemSchema, itemOptions);
  }

  //METHOD FOR SELECT FORMS
  var selectForm = function(name) {
    let itemId = name;
    let itemSchema = {
      "enum": [/*many options*/]
    };
    let itemOptions = {
      "label": itemId,
    };
    this.topControl.addItem(itemId, itemSchema, itemOptions);
  }
}

/*HELPER METHODS*/
