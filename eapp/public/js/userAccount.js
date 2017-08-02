var serverUrl = "http://127.0.0.1:3000"
/*
* Data Dictionaries
*/
var username = ""
//var source = $("#main-template").html();
//var template = Handlebars.compile(source);

$.ajax({
    type: "GET",
    url: serverUrl + "/account",
    accept: "application/json",
    success: function(data){
      console.log('get forms:success:', data.user.username)
      username = data.user.username
      //$('#nav').append(template({username:username}))
      $('#nav').append(Handlebars.templates.navigation({username:username}))
    }
})
