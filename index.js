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

app.addPage = function(input) {
  var page;
  if(typeof input == "function") {
    // in case input is object, create instance of it
    page = new input({});
  } else {
    // pass resulting input as Page attributes
    page = new Page(input);
  }

  page.registerCodeHandlers(app);
  page.registerStyleHandlers(app);

  if(page.attributes.url)
    app.get(page.attributes.url, function(req, res, next){ page.render(req, res, next); });
  
  return page;
}

module.exports = app;