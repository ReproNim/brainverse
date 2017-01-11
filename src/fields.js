"use strict";
function add_fields(data, datatype) {
				var div = document.getElementById(data);
				var input = document.createElement("input");
				input.type = "text";
        input.name = datatype;
				div.appendChild(document.createElement("br"));
				div.appendChild(input);
			}
