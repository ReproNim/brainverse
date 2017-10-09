/*
* Setting Up form editor
* This code is adapted from http://www.alpacajs.org/demos/form-builder/form-builder.html
*/
var setup = function(){
  //Alpaca.logLevel = Alpaca.DEBUG;

  var MODAL_VIEW = "bootstrap-edit-horizontal";
  //var MODAL_VIEW = "bootstrap-edit";

  var MODAL_TEMPLATE = ' \
    <div class="modal fade"> \
      <div class="modal-dialog"> \
        <div class="modal-content"> \
          <div class="modal-header"> \
            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button> \
              <h4 class="modal-title"></h4> \
          </div> \
          <div class="modal-body"> \
          </div> \
          <div class="modal-footer"> \
          </div> \
        </div> \
      </div> \
    </div> \
  ';

  //var schema = JSON.parse(localStorage.getItem("alpacaDesignerSchema"))
  //var options = JSON.parse(localStorage.getItem("alpacaDesignerOptions"))
  var schema = {}
  var options = {}
  console.log("schema just during setup: ", schema)
  var data ={}

  console.log("--- Setting up Form Editor Space--- ")
  var mainViewField = null;
  var mainPreviewField = null;
  var mainDesignerField = null;

  var doRefresh = function(el, buildInteractionLayers, disableErrorHandling, cb){
    var config = {}
    schema = JSON.parse(localStorage.getItem("alpacaDesignerSchema"))
    options = JSON.parse(localStorage.getItem("alpacaDesignerOptions"))

    if(schema){
      config = {
        "schema": schema
      }
      if(options){
        config.options = options
      }
      if(data){
        config.data = data
      }
      if(!config.options) {
        config.options = {}
      }
      config.options.focus = false

      config.postRender = function(form) {

        if (buildInteractionLayers){
          // cover every control with an interaction layer
          form.getFieldEl().find(".alpaca-container-item").each(function(iCount) {
          var $el = $(this)
          var alpacaFieldId = $el.children().first().attr("data-alpaca-field-id")
          $el.attr("icount", iCount)
          var width = $el.outerWidth() - 22
          var height = $el.outerHeight() + 25

          // cover div
          var cover = $("<div></div>")
          $(cover).addClass("cover")
          $(cover).attr("alpaca-ref-id", alpacaFieldId)
          $(cover).css({
            "position": "absolute",
            "margin-top": "-" + height + "px",
            "margin-left": "-10px",
            "width": width,
            "height": height + 10,
            "opacity": 0,
            "background-color": "white",
            "z-index": 900
          });
          $(cover).attr("icount-ref", iCount)
          $el.append(cover)

          // interaction div
          var interaction = $("<div class='interaction'></div>")
          var buttonGroup = $("<div class='btn-group pull-right'></div>")
          var schemaButton = $('<button class="btn btn-default btn-xs button-schema" alpaca-ref-id="' + alpacaFieldId + '"><i class="glyphicon glyphicon-list"></i></button>')
          buttonGroup.append(schemaButton)
          var optionsButton = $('<button class="btn btn-default btn-xs button-options" alpaca-ref-id="' + alpacaFieldId + '"><i class="glyphicon glyphicon-wrench"></i></button>')
          buttonGroup.append(optionsButton);
          var removeButton = $('<button class="btn btn-danger btn-xs button-remove" alpaca-ref-id="' + alpacaFieldId + '"><i class="glyphicon glyphicon-remove"></i></button>');
          buttonGroup.append(removeButton);
          interaction.append(buttonGroup);
          interaction.append("<div style='clear:both'></div>");
          $(interaction).addClass("interaction");
          $(interaction).attr("alpaca-ref-id", alpacaFieldId);
          $(interaction).css({
            "position": "absolute",
            "margin-top": "-" + height + "px",
            "margin-left": "-10px",
            "width": width,
            "height": height + 10,
            "opacity": 1,
            "z-index": 901
          });
          $(interaction).attr("icount-ref", iCount)
          $el.append(interaction)
          $(buttonGroup).css({
            "margin-top": 5 + (($(interaction).height() / 2) - ($(buttonGroup).height() / 2)),
            "margin-right": "16px"
          });
          $(schemaButton).off().click(function(e) {
            e.preventDefault()
            e.stopPropagation()

            var alpacaId = $(this).attr("alpaca-ref-id");

            editSchema(alpacaId)
          });
          $(optionsButton).off().click(function(e) {
            e.preventDefault()
            e.stopPropagation()

            var alpacaId = $(this).attr("alpaca-ref-id")
            editOptions(alpacaId)
          });
          $(removeButton).off().click(function(e) {
            e.preventDefault()
            e.stopPropagation()
            var alpacaId = $(this).attr("alpaca-ref-id")
            removeField(alpacaId)
          });

          // when hover, highlight
          $(interaction).hover(function(e) {
            var iCount = $(interaction).attr("icount-ref")
            $(".cover[icount-ref='" + iCount + "']").addClass("ui-hover-state")
          }, function(e) {
              var iCount = $(interaction).attr("icount-ref");
              $(".cover[icount-ref='" + iCount + "']").removeClass("ui-hover-state")
            })
          })

          // add dashed
          form.getFieldEl().find(".alpaca-container").addClass("dashed")
          form.getFieldEl().find(".alpaca-container-item").addClass("dashed")

          // for every container, add a "first" drop zone element
          // this covers empty containers as well as 0th index insertions
          form.getFieldEl().find(".alpaca-container").each(function() {
            var containerEl = this

            // first insertion point
            $(this).prepend("<div class='dropzone'></div>")

            // all others
            $(containerEl).children(".alpaca-container-item").each(function() {
                $(this).after("<div class='dropzone'></div>")
            })
          })

          form.getFieldEl().find(".dropzone").droppable({
            "tolerance": "touch",
            "drop": function( event, ui ) {

              var draggable = $(ui.draggable)

              if (draggable.hasClass("form-element")){
                var dataType = draggable.attr("data-type")
                var fieldType = draggable.attr("data-field-type")

                // based on where the drop occurred, figure out the previous and next Alpaca fields surrounding
                // the drop target

                // previous
                var previousField = null
                var previousFieldKey = null
                var previousItemContainer = $(event.target).prev()
                if (previousItemContainer){
                  var previousAlpacaId = $(previousItemContainer).children().first().attr("data-alpaca-field-id")
                  previousField = Alpaca.fieldInstances[previousAlpacaId]
                  previousFieldKey = $(previousItemContainer).attr("data-alpaca-container-item-name")
                }

                // next
                var nextField = null
                var nextFieldKey = null
                var nextItemContainer = $(event.target).next()
                if (nextItemContainer){
                  var nextAlpacaId = $(nextItemContainer).children().first().attr("data-alpaca-field-id")
                  nextField = Alpaca.fieldInstances[nextAlpacaId]

                  nextFieldKey = $(nextItemContainer).attr("data-alpaca-container-item-name")
                }

                // parent field
                var parentFieldAlpacaId = $(event.target).parent().parent().attr("data-alpaca-field-id");
                var parentField = Alpaca.fieldInstances[parentFieldAlpacaId];

                // now do the insertion
                insertField(schema, options, data, dataType, fieldType, parentField, previousField, previousFieldKey, nextField, nextFieldKey);

              } else if (draggable.hasClass("interaction")){
                var draggedIndex = $(draggable).attr("icount-ref");

                // next
                var nextItemContainer = $(event.target).next();
                var nextItemContainerIndex = $(nextItemContainer).attr("data-alpaca-container-item-index");
                var nextItemAlpacaId = $(nextItemContainer).children().first().attr("data-alpaca-field-id");
                var nextField = Alpaca.fieldInstances[nextItemAlpacaId];

                form.moveItem(draggedIndex, nextItemContainerIndex, false, function() {
                  var top = findTop(nextField)
                  regenerate(top)
                })
              }
            },
            "over": function (event, ui ) {
                $(event.target).addClass("dropzone-hover")
            },
            "out": function (event, ui) {
                $(event.target).removeClass("dropzone-hover")
            }
          })

          // init any in-place draggables
          form.getFieldEl().find(".interaction").draggable({
            "appendTo": "body",
            "helper": function() {
                var iCount = $(this).attr("icount-ref");
                var clone = $(".alpaca-container-item[icount='" + iCount + "']").clone()
                return clone;
            },
            "cursorAt": {
                "top": 100
            },
            "zIndex": 300,
            "refreshPositions": true,
            "start": function(event, ui) {
                $(".dropzone").addClass("dropzone-highlight")
            },
            "stop": function(event, ui) {
                $(".dropzone").removeClass("dropzone-highlight")
            }
          })
        } //if buildInteractionLayers end
        cb(null, form)
      } //postRender function ends
      config.error = function(err){
          Alpaca.defaultErrorCallback(err)
          cb(err);
      }
      if (disableErrorHandling){
        Alpaca.defaultErrorCallback = function(error) {
            console.log("Alpaca encountered an error while previewing form -> " + error.message)
        }
      }else{
          Alpaca.defaultErrorCallback = Alpaca.DEFAULT_ERROR_CALLBACK
      }
      //Alpaca form generated
      $(el).alpaca(config)

    }//if schema ends
  } //doRefresh ends here

    var removeFunctionFields = function(schema, options)
    {
        if (schema)
        {
            if (schema.properties)
            {
                var badKeys = [];

                for (var k in schema.properties)
                {
                    if (schema.properties[k].type === "function")
                    {
                        badKeys.push(k);
                    }
                    else
                    {
                        removeFunctionFields(schema.properties[k], (options && options.fields ? options.fields[k] : null));
                    }
                }

                for (var i = 0; i < badKeys.length; i++)
                {
                    delete schema.properties[badKeys[i]];

                    if (options && options.fields) {
                        delete options.fields[badKeys[i]];
                    }
                }
            }
        }
    };

    var editSchema = function(alpacaFieldId, callback)
    {
        var field = Alpaca.fieldInstances[alpacaFieldId];

        var fieldSchemaSchema = field.getSchemaOfSchema();
        var fieldSchemaOptions = field.getOptionsForSchema();
        removeFunctionFields(fieldSchemaSchema, fieldSchemaOptions);
        var fieldData = field.schema;

        delete fieldSchemaSchema.title;
        delete fieldSchemaSchema.description;
        if (fieldSchemaSchema.properties)
        {
            delete fieldSchemaSchema.properties.title;
            delete fieldSchemaSchema.properties.description;
            delete fieldSchemaSchema.properties.dependencies;
        }
        var fieldConfig = {
            schema: fieldSchemaSchema
        };
        if (fieldSchemaOptions)
        {
            fieldConfig.options = fieldSchemaOptions;
        }
        if (fieldData)
        {
            fieldConfig.data = fieldData;
        }
        fieldConfig.view = {
            "parent": MODAL_VIEW,
            "displayReadonly": false
        };
        fieldConfig.postRender = function(control)
        {
            var modal = $(MODAL_TEMPLATE.trim());
            modal.find(".modal-title").append(field.getTitle());
            modal.find(".modal-body").append(control.getFieldEl());

            modal.find('.modal-footer').append("<button class='btn btn-primary pull-right okay' data-dismiss='modal' aria-hidden='true'>Okay</button>");
            modal.find('.modal-footer').append("<button class='btn btn-default pull-left' data-dismiss='modal' aria-hidden='true'>Cancel</button>");

            $(modal).modal({
                "keyboard": true
            });

            $(modal).find(".okay").click(function() {
                console.log("---editSchema modal: Okay clicked -----")
                field.schema = control.getValue();

                var top = findTop(field);
                regenerate(top);

                if (callback)
                {
                    callback();
                }
            });

            control.getFieldEl().find("p.help-block").css({
                "display": "none"
            });
        };

        var x = $("<div><div class='fieldForm'></div></div>");
        $(x).find(".fieldForm").alpaca(fieldConfig);
    };

    var editOptions = function(alpacaFieldId, callback)
    {

        var field = Alpaca.fieldInstances[alpacaFieldId];

        var fieldOptionsSchema = field.getSchemaOfOptions();
        var fieldOptionsOptions = field.getOptionsForOptions();
        removeFunctionFields(fieldOptionsSchema, fieldOptionsOptions);
        var fieldOptionsData = field.options;

        delete fieldOptionsSchema.title;
        delete fieldOptionsSchema.description;
        if (fieldOptionsSchema.properties)
        {
            delete fieldOptionsSchema.properties.title;
            delete fieldOptionsSchema.properties.description;
            delete fieldOptionsSchema.properties.dependencies;
            delete fieldOptionsSchema.properties.readonly;
        }
        if (fieldOptionsOptions.fields)
        {
            delete fieldOptionsOptions.fields.title;
            delete fieldOptionsOptions.fields.description;
            delete fieldOptionsOptions.fields.dependencies;
            delete fieldOptionsOptions.fields.readonly;
        }

        var fieldConfig = {
            schema: fieldOptionsSchema
        };
        if (fieldOptionsOptions)
        {
            fieldConfig.options = fieldOptionsOptions;
        }
        if (fieldOptionsData)
        {
            fieldConfig.data = fieldOptionsData;
        }
        fieldConfig.view = {
            "parent": MODAL_VIEW,
            "displayReadonly": false
        };
        fieldConfig.postRender = function(control)
        {
            var modal = $(MODAL_TEMPLATE.trim());
            modal.find(".modal-title").append(field.getTitle());
            modal.find(".modal-body").append(control.getFieldEl());

            modal.find('.modal-footer').append("<button class='btn btn-primary pull-right okay' data-dismiss='modal' aria-hidden='true'>Okay</button>");
            modal.find('.modal-footer').append("<button class='btn btn-default pull-left' data-dismiss='modal' aria-hidden='true'>Cancel</button>");

            $(modal).modal({
                "keyboard": true
            });

            $(modal).find(".okay").click(function() {
                console.log("--editOptions Modal: Okay clicked---")
                field.options = control.getValue();

                var top = findTop(field);
                regenerate(top);

                if (callback)
                {
                    callback();
                }
            });

            control.getFieldEl().find("p.help-block").css({
                "display": "none"
            });
        };

        var x = $("<div><div class='fieldForm'></div></div>");
        $(x).find(".fieldForm").alpaca(fieldConfig);
    };

    var refreshView = function(callback)
    {
        if (mainViewField)
        {
            mainViewField.getFieldEl().replaceWith("<div id='viewDiv'></div>");
            mainViewField.destroy();
            mainViewField = null;
        }

        doRefresh($("#viewDiv"), false, false, function(err, form) {
            console.log("doRefresh viewDiv ")
            if (!err)
            {
                mainViewField = form;
            }

            if (callback)
            {
                callback();
            }

        });
    };

    /*var refreshPreview = function(callback)
    {
        if (mainPreviewField)
        {
            mainPreviewField.getFieldEl().replaceWith("<div id='previewDiv'></div>");
            mainPreviewField.destroy();
            mainPreviewField = null;
        }

        doRefresh($("#previewDiv"), false, false, function(err, form) {

            if (!err)
            {
                mainPreviewField = form;
            }

            if (callback)
            {
                callback();
            }

        });
    };*/

    var refreshDesigner = function(callback)
    {
        $(".dropzone").remove();
        $(".interaction").remove();
        $(".cover").remove();
        console.log("refreshDesigner called")
        if (mainDesignerField)
        {
            mainDesignerField.getFieldEl().replaceWith("<div id='designerDiv'></div>");
            mainDesignerField.destroy();
            mainDesignerField = null;
        }

        doRefresh($("#designerDiv"), true, false, function(err, form) {

            if (!err)
            {
                mainDesignerField = form;
            }

            if (callback)
            {
                callback();
            }

        });
    };

    /*var refreshCode = function(callback)
    {
        var json = {
            "schema": schema
        };
        if (options) {
            json.options = options;
        }
        if (data) {
            json.data = data;
        }
        var code = "$('#div').alpaca(" + JSON.stringify(json, null, "    ") + ");";

        editor4.setValue(code);
        editor4.clearSelection();
        editor4.gotoLine(0,0);

        if (callback)
        {
            callback();
        }
    };*/

    var refresh = function(callback)
    {
        var current = $("UL.nav.nav-tabs LI.active A.tab-item");
        $(current).click();
    };

    /*var rtChange = false;

    // background "thread" to detect changes and update the preview div
    var rtProcessing = false;
    var rtFunction = function() {

        if (rtChange && !rtProcessing)
        {
            rtProcessing = true;
            console.log("rt Function():rtProcessing set to true")
            if (mainPreviewField)
            {
                mainPreviewField.getFieldEl().replaceWith("<div id='previewDiv'></div>");
                mainPreviewField.destroy();
                mainPreviewField = null;
            }
            doRefresh($("#previewDiv"), false, true, function(err, form) {

                if (!err)
                {
                    mainPreviewField = form;
                }

                rtChange = false;
                rtProcessing = false;
            });
        }

        setTimeout(rtFunction, 1000);

    };
    rtFunction();*/

    var isCoreField = function(type)
    {
        var cores = ["any", "array", "checkbox", "file", "hidden", "number", "object", "radio", "select", "text", "textarea"];

        var isCore = false;
        for (var i = 0; i < cores.length; i++)
        {
            if (cores[i] == type)
            {
                isCore = true;
            }
        }

        return isCore;
    };

    // types
    var types = [{
        "type": "string",
        "title": "String",
        "description": "A textual property"
    }, {
        "type": "number",
        "title": "Number",
        "description": "A numerical property"
    }, {
        "type": "boolean",
        "title": "Boolean",
        "description": "A true/false property"
    }, {
        "type": "object",
        "title": "Object",
        "description": "A collection of keyed sub-properties"
    }, {
        "type": "array",
        "title": "Array",
        "description": "An array of sub-properties"
    }];
    function appendTypes(){
      for (var i = 0; i < types.length; i++)
      {
          var title = types[i].title;
          var type = types[i].type;
          var description = types[i].description;

          var div = $("<div class='form-element draggable ui-widget-content' data-type='" + type + "'></div>");
          $(div).append("<div><span class='form-element-title'>" + title + "</span> (<span class='form-element-type'>" + type + "</span>)</div>");
          $(div).append("<div class='form-element-field-description'>" + description + "</div>");

          $("#types").append(div);
      }
    }
    appendTypes()
    var afterAlpacaInit = function()
    {
        // show all fields
        for (var type in Alpaca.fieldClassRegistry)
        {
            var instance = new Alpaca.fieldClassRegistry[type]();
            //console.log("instance::: ",instance)
            var schemaSchema = instance.getSchemaOfSchema();
            var schemaOptions = instance.getOptionsForSchema();
            var optionsSchema = instance.getSchemaOfOptions();
            var optionsOptions = instance.getOptionsForOptions();
            var title = instance.getTitle();
            var description = instance.getDescription();
            var type = instance.getType();
            var fieldType = instance.getFieldType();

            var div = $("<div id='tfield' class='form-element draggable ui-widget-content' data-type='" + type + "' data-field-type='" + fieldType + "'></div>");
            $(div).append("<div><span class='form-element-title'>" + title + "</span> (<span class='form-element-type'>" + fieldType + "</span>)</div>");
            $(div).append("<div class='form-element-field-description'>" + description + "</div>");

            var isCore = isCoreField(fieldType);
            if (isCore)
            {
                $("#basic").append(div);
            }
            else
            {
                $("#advanced").append(div);
            }

            // init all of the draggable form elements
            $(".form-element").draggable({
                "appendTo": "body",
                "helper": "clone",
                "zIndex": 300,
                "refreshPositions": true,
                "start": function(event, ui) {
                    $(".dropzone").addClass("dropzone-highlight");
                },
                "stop": function(event, ui) {
                    $(".dropzone").removeClass("dropzone-highlight");
                }
            });
        }
    };

    // lil hack to force compile
    $("<div></div>").alpaca({
        "data": "test",
        "postRender": function(control)
        {
            afterAlpacaInit();
        }
    });


    $(".tab-item-source").click(function() {

        // we have to monkey around a bit with ACE Editor to get it to refresh

        console.log(".tab item source: click: all editors getValue and Clear Selection")

        setTimeout(function() {
            refreshPreview();
        }, 50);
    });

    $(".tab-item-view").click(function() {
      console.log("tab-item-view: clicked")
      refreshView();
    });

    $(".tab-item-designer").click(function() {
        console.log(".tab item designer clicked")
        if(document.getElementById('tfield') == null){
          appendTypes()
          $("<div></div>").alpaca({
              "data": "test",
              "postRender": function(control)
              {
                  afterAlpacaInit();
              }
          });

        }
        refreshDesigner();
    });
    /*$(".tab-item-code").click(function() {
        setTimeout(function() {
            refreshCode();
        }, 50);
    });*/

    var insertField = function(schema, options, data, dataType, fieldType, parentField, previousField, previousFieldKey, nextField, nextFieldKey)
    {
        var itemSchema = {
            "type": dataType
        };
        var itemOptions = {};
        if (fieldType)
        {
            itemOptions.type = fieldType;
        }
        itemOptions.label = "New ";
        if (fieldType)
        {
            itemOptions.label += fieldType;
        }
        else if (dataType)
        {
            itemOptions.label += dataType;
        }
        var itemData = null;

        var itemKey = null;
        if (parentField.getType() === "array")
        {
            itemKey = 0;
            if (previousFieldKey)
            {
                itemKey = previousFieldKey + 1;
            }
        }
        else if (parentField.getType() === "object")
        {
            itemKey = "new" + new Date().getTime();
        }

        var insertAfterId = null;
        if (previousField)
        {
            insertAfterId = previousField.id;
        }

        parentField.addItem(itemKey, itemSchema, itemOptions, itemData, insertAfterId, function() {

            var top = findTop(parentField);

            regenerate(top);
        });

    };

    var assembleSchema = function(field, schema)
    {
        // copy any properties from this field's schema into our schema object
        for (var k in field.schema)
        {
            if (field.schema.hasOwnProperty(k) && typeof(field.schema[k]) !== "function")
            {
                schema[k] = field.schema[k];
            }
        }
        // a few that we handle by hand
        schema.type = field.getType();
        // reset properties, we handle that one at a time
        delete schema.properties;
        schema.properties = {};
        if (field.children)
        {
            for (var i = 0; i < field.children.length; i++)
            {
                var childField = field.children[i];
                var propertyId = childField.propertyId;

                schema.properties[propertyId] = {};
                assembleSchema(childField, schema.properties[propertyId]);
            }
        }
    };

    var assembleOptions = function(field, options)
    {
        // copy any properties from this field's options into our options object
        for (var k in field.options)
        {
            if (field.options.hasOwnProperty(k) && typeof(field.options[k]) !== "function")
            {
                options[k] = field.options[k];
            }
        }
        // a few that we handle by hand
        options.type = field.getFieldType();
        // reset fields, we handle that one at a time
        delete options.fields;
        options.fields = {};
        if (field.children)
        {
            for (var i = 0; i < field.children.length; i++)
            {
                var childField = field.children[i];
                var propertyId = childField.propertyId;

                options.fields[propertyId] = {};
                assembleOptions(childField, options.fields[propertyId]);
            }
        }
    };

    var findTop = function(field)
    {
        // now get the top control
        var top = field;
        while (top.parent)
        {
            top = top.parent;
        }

        return top;
    };

    var regenerate = function(top)
    {
        // walk the control tree and re-assemble the schema, options + data
        console.log("---Regenerating -----")
        var _schema = {};
        assembleSchema(top, _schema);
        console.log("[regenerate]_schema: ", _schema)
        var _options = {};
        assembleOptions(top, _options);
        console.log("[regenerate]_options: ", _options)
        // data is easy
        var _data = top.getValue();
        if (!_data) {
            _data = {};
        }
        console.log("Setting Editors 1, 2, 3")
        schema = _schema
        options = _options
        data = _data
        localStorage.setItem("alpacaDesignerSchema", JSON.stringify(schema))
        localStorage.setItem("alpacaDesignerOptions", JSON.stringify(options))
        //setTimeout(function() {
            refresh();
        //}, 100);
    };

    var removeField = function(alpacaId)
    {
        var field = Alpaca.fieldInstances[alpacaId];

        var parentField = field.parent;
        parentField.removeItem(field.propertyId, function() {
            var top = findTop(field);
            regenerate(top);
        });
    };

    //$(".tab-item-source").click();


    // load button
    /*$(".load-button").off().click(function() {

        if (!localStorage)
        {
            alert("Your browser must support HTML5 local storage in order to use this feature");
            return;
        }

        var configString = localStorage.getItem("alpacaDesignerConfig");
        if (!configString)
        {
            return;
        }

        try
        {
            var config = JSON.parse(configString);
            if (!config.schema) {
                config.schema = {};
            }
            if (!config.options) {
                config.options = {};
            }
            if (!config.data) {
                config.data = {};
            }
            console.log("load button clicked")
            //alert("Your form was loaded from HTML5 local storage");
        }
        catch (e)
        {
            // bad value
        }

    });*/

    // save button
    $(".save-button").off().click(function(e) {
        e.preventDefault()
        if (!localStorage)
        {
            alert("Your browser must support HTML5 local storage in order to use this feature")
            return;
        }
        var config = {}
        if (schema)
        {
            config.schema = schema
        }
        if (options)
        {
            config.options = options
        }
        if (data)
        {
            config.data = data;
        }
        var configString = JSON.stringify(config)
        console.log("alpacaDesignerConfig: ", config)
        localStorage.setItem("alpacaDesignerConfig", configString)
        convertAlpacaToNDA(schema,options)
        //alert("Your form was saved in HTML5 local storage")
    })
    $(".git-push-button").off().click(function(e) {
        e.preventDefault()
        if (!localStorage)
        {
            alert("Your browser must support HTML5 local storage in order to use this feature")
            return;
        }

        var config = {}
        if (schema)
        {
            config.schema = schema
        }
        if (options)
        {
            config.options = options
        }
        if (data)
        {
            config.data = data;
        }
        var configString = JSON.stringify(config)
        console.log("alpacaDesignerConfig: ", config)
        localStorage.setItem("alpacaDesignerConfig", configString)
        pushToGitHub(schema,options)
        alert("Your form was saved in HTML5 local storage")
    })

}
