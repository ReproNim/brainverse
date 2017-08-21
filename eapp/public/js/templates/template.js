(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['navigation'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<nav class=\"navbar navbar-inverse\">\n  <div class=\"container-fluid\">\n    <div class=\"navbar-header\">\n      <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n        <span class=\"sr-only\">Toggle navigation</span>\n        <span class=\"icon-bar\"></span>\n        <span class=\"icon-bar\"></span>\n        <span class=\"icon-bar\"></span>\n      </button>\n      <a class=\"navbar-brand\" href=\"/main\">Brainverse</a>\n    </div>\n    <div id=\"navbar\" class=\"navbar-collapse collapse\">\n      <!--ul class=\"nav navbar-nav\">\n        <li><a href=\"#\">Settings</a></li>\n        <li><a href=\"#\">Profile</a></li>\n        <li><a href=\"#\">Help</a></li>\n      </ul-->\n      <ul class=\"nav navbar-nav navbar-right\">\n        <li>   <a href=\"/userAccount.html\"> Welcome "
    + container.escapeExpression(((helper = (helper = helpers.username || (depth0 != null ? depth0.username : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"username","hash":{},"data":data}) : helper)))
    + "!</a>\n        <li>\n            <p class=\"navbar-btn\">\n            <a href=\"/logout\" class=\"btn btn-success\">Log Out</a>\n          </p>\n        </li>\n      </ul>\n    </div>\n  </div>\n</nav>\n";
},"useData":true});
})();