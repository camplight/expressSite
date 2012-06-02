var express = require('express');
var app = express();

var _ = require("underscore");
var Page = require("./Page");

// Configuration
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

var defaultPageAttributes = {};

app.defaultPageAttributes = function(defaults){
  defaultPageAttributes = _.extend(defaults, defaultPageAttributes);
}

app.addPage = function(input, options) {
  var page;
  if(typeof input == "function") {
    page = new input(defaultPageAttributes, options);
  } else {
    input = _.extend(input, defaultPageAttributes);
    page = new Page(input, options);
  }

  page.registerStylesheetHandler(app);
  page.registerJavascriptHandler(app);

  if(page.attributes.url)
    app.get(page.attributes.url, page.render());
  
  return page;
}

module.exports = app;