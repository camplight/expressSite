var express = require('express');
var app = express();

var _ = require("underscore");
var Page = require("./Page");

// provide reasonable defaults for setup of express app
app.useExpressSiteMiddleware = function(options){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
};

var defaultPageAttributes = {};

app.defaultPageAttributes = function(defaults){
  defaultPageAttributes = _.extend(defaults, defaultPageAttributes);
}

app.addPage = function(input) {
  var page;
  if(typeof input == "function") {
    // in case input is object, create instance of it
    page = new input(defaultPageAttributes);
  } else {
    // mix input with defaultPageAttributes
    for(var key in defaultPageAttributes)
      if(typeof input[key] == "undefined")
        input[key] = defaultPageAttributes[key];
      else
      if(Array.isArray(input[key]))
        for(var i = 0; i<defaultPageAttributes[key].length; i++)
          input.push(defaultPageAttributes[key][i]);
      else
      if(typeof input[key] == "object")
        input[key]  = _.extend(defaultPageAttributes[key], input[key]);
    // pass resulting input as Page attributes
    page = new Page(input);
  }

  page.registerStylesheetHandler(app);
  page.registerJavascriptHandler(app);

  if(page.attributes.url)
    app.get(page.attributes.url, function(req, res, next){ page.render(req, res, next); });
  
  return page;
}

module.exports = app;