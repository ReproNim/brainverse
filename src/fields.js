"use strict";
// keep track of how many fields are added
let $newfields = 0;
// max number of text fields
const MAX_TEXT = 5;
// spawn more text fields
function addField(data, datatype) {
	let somediv = document.getElementById(data);
	let numid = data+$newfields;
	let textbox = document.createElement("input");
	textbox.type = "text";
  textbox.name = datatype;
	textbox.placeholder = "Additional data..."
	let newbut = document.createElement("input")
	newbut.type = "button";
	newbut.style = "float: right;";
	newbut.class = "btn btn-warning";
	newbut.onclick = function() {removeField(data, numid)};
	newbut.value = "-";
	let newdiv = document.createElement("div");
	newdiv.setAttribute('id', numid)
	// to limit boxes
	if($newfields<MAX_TEXT){
		newdiv.appendChild(document.createElement("br"));
		newdiv.appendChild(textbox);
		newdiv.appendChild(newbut);
		$newfields++;
		somediv.appendChild(newdiv)
	}
}
// allow removal
function removeField(data, divID) {
	let somediv = document.getElementById(data);
	somediv.removeChild(document.getElementById(divID));
	$newfields--;
}
