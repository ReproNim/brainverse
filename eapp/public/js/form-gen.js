//For more info on parameters and documentation, visit:
//http://www.alpacajs.org/documentation.html

class AlpacaForm {
  /*An instance is a newly generated Alpaca Form

  ATTRIBUTES:
    element: HTML element to contain form [selector]
    properties: list of fields in form [alpaca/JSON object]
    fields: additional field options [alpaca/JSON object]
    baseform: boilerplate alpaca Form */

  constructor(element) {
    /*Constructor: creates a new alpaca Form

      Has containing HTML element, field properties, and field options

      Precondition: element is a valid HTML element, properties and fields are
      in valid alpaca format. */
    this.element = element
    this.properties = {}
    this.fields = {}
    this.form = {}
    this.x = {}
    this.data = {}
    //this.validator = {}
    this.postRender = function(){}
    this.baseForm = {
      "data": this.data,
      "schema": {
        "type": "object",
        "properties": this.properties
      },
      "options": {
        "fields": this.fields,
        "form": this.form,
        //"validator": this.validator
      },
      /*"postRender": function(control){
        console.log("inside control: ", control)
      }*/
    }
  }
  render(fn){
    this.postRender = fn()
  }

  inputForm(title, label, id, type='string', renderType='text', date=false, placehold='null', require=false,disable=false) {
    /*Input Form Method

      Creates a text input field

      Parameters:
        title: short description of the property
        type: 'string' or 'number' for now
        label: Field label
        name: Field Name
    */
    if (date == true) {
      this.properties[title.toLowerCase()] = {
        "title": title,
        "type": type,
        "format":"date",
        "required": require
      }

      this.fields[title.toLowerCase()] = {
        "type": "date",
        "dateFormat": "MM/DD/YYYY",
        "label": label,
        "id": id,
        //"placeholder": placehold,
        "disabled": disable,
        "manualEntry": true
      }
    }
    else {
      this.properties[title.toLowerCase()] = {
        "title": title,
        "type": type,
        "required": require
      }
      this.fields[title.toLowerCase()] = {
        "type": renderType,
        "label": label,
        "id": id,
        "placeholder": placehold,
        "disabled": disable,
        "hideInitValidationError": true,
        "validator": function(callback) {
              var value = this.getValue();
              if(type ==="number" && isNaN(value)){
                callback({
                  "status": false,
                  "message": "Enter a number"
                  });
              } else {
                  callback({
                      "status": true
                  })
              }
          }
      }
    }
  }

  textAreaForm(title, label, id, type='string', date=false, placehold='null', disable=false){
     this.properties[title.toLowerCase()] = {
       "title": title,
       "type": type,
       "required": true
     }
    this.fields[title.toLowerCase()] = {
      "type": "textarea",
      "label": label,
      "id": id,
      "placeholder": placehold,
      "disabled": disable
    }
    this.data[title.toLowerCase()] = placehold
  }

   radioForm(title, label, id, op, require=false, disable=false) {
     /*Radio Form Method

       Creates a radio input field */
     this.properties[title.toLowerCase()] = {
       "title": title,
       "enum": op,
       "required": require
     }
     this.fields[title.toLowerCase()] = {
       "type": "radio",
       "label": label,
       "id": id,
       "removeDefaultNone": true,
       "sort": false,
       "disabled": false
     }
   }

  selectForm(title, label, list, id, require, disable=false) {
    /*Select Form Method

      Creates a selection form field */
    this.properties[title.toLowerCase()] = {
      "title": title,
      "enum": list,
      "required": require
    }
    this.fields[title.toLowerCase()] = {
      "label": label,
      "type": "select",
      "id": id,
      "noneLabel": "-- Select --",
      "removeDefaultNone": false,
      "sort": false,
      "disabled": disable
    }
  }

  selectFormGeneral(title, label, enumlist, optionsLabelList, id, require, disable=false) {
    /*Select Form Method

      Creates a selection form field */
    this.properties[title.toLowerCase()] = {
      "title": title,
      "enum": enumlist,
      "required": require
    }
    this.fields[title.toLowerCase()] = {
      "label": label,
      "type": "select",
      "id": id,
      "noneLabel": "-- Select --",
      "optionLabels": optionsLabelList,
      "removeDefaultNone": false,
      "sort": false,
      "showMessages": false,
      "hideInitValidationError":true,
      "disabled": disable

    }
  }

  inputFormTypeAhead(title, label, id, type='string', date=false, placehold='null', disable=false) {
    /*Input Form Method

      Creates a text input field

      Parameters:
        type: 'string' or 'number' for now */
    this.properties[title.toLowerCase()] = {
      "title": title,
      "type": type,
      "required": false
    }
    if (date == true) {
      this.fields[title.toLowerCase()] = {
        "type": "date",
        "picker": {
            "format": "MM/DD/YYYY"
        },
        "label": label,
        "id": id,
        "placeholder": placehold,
        "disabled": disable
      }
    }
    else {
      this.fields[title.toLowerCase()] = {
        "label": label,
        "id": id,
        "placeholder": placehold,
        "disabled": disable,
        "typeahead": {
          "config": {
              "autoselect": true,
              "highlight": true,
              "hint":true,
              "minLength": 1
          },
          "datasets":{
            "type":"remote",
            "source":"http://www.alpacajs.org/endpoints/typeahead-sample.php?q=%QUERY",
            //"source":["red", "green", "blue","black","brown"]
            "templates": {
              "empty": "username not found ...",
              "header": "<h5>github usernames</h5><br>",
              "footer": "",
              "suggestion": "<p style='color:blue'>{{value}}</p>"
            }
          }
        }//typeahead
      }
    }
  }


  arrayForm(title, label, items, id) {
    /*Array Form Method

      Creates an accordion style form field */
    this.properties[title.toLowerCase()] = {
      "title": title,
      "type": "array",
      "items": items
    }
    this.fields[title.toLowerCase()] = {
      "label": label,
      "id": id,
      "collapsible": true,
      "toolbarSticky": false,
      "hideToolbarWithChildren": false
    }
  }

  submitBtnForm(title, sActionFunc){
    this.form["buttons"] = {
      "submit": {
        'title': title,
        'click': sActionFunc
      }
    }
  }
  alpacaGen() {
    //Generates the alpaca form
    $(this.element).alpaca(this.baseForm);
  }


  alpacaDestroy() {
    //Destroys the alpaca form
    $(this.element).alpaca("destroy");
  }
}
