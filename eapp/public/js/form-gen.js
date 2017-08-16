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
    this.element = element;
    this.properties = {};
    this.fields = {};
    this.baseForm = {
      "schema": {
        "type": "object",
        "properties": this.properties

      },
      "options": {
        "fields": this.fields
      }
    };
  }

  inputForm(title, label, id, type='string', date=false, placehold='null', disable=false) {
    /*Input Form Method

      Creates a text input field

      Parameters:
        type: 'string' or 'number' for now */
    this.properties[title.toLowerCase()] = {
      "title": title,
      "type": type,
      "required": true
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
        "disabled": disable
      }
    }
    console.log('i do something')
  }

  radioForm(title, label, id, op1, op2, disable=false) {
    /*Radio Form Method

      Creates a radio input field */
    this.properties[title.toLowerCase()] = {
      "title": title,
      "type": "radio",
      "enum": [op1, op2],
      "required": true
    }
    this.fields[title.toLowerCase()] = {
      "label": label,
      "id": id,
      "removeDefaultNone": true,
      "sort": false,
      "disabled": disable
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
      "id": id,
      "noneLabel": "-- Select --",
      "removeDefaultNone": false,
      "sort": false,
      "disabled": disable
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


  alpacaGen() {
    //Generates the alpaca form
    $(this.element).alpaca(this.baseForm);
  }


  alpacaDestroy() {
    //Destroys the alpaca form
    $(this.element).alpaca("destroy");
  }
}
