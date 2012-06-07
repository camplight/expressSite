var _ = require("underscore");
var Backbone = require("backbone");
var path = require("path");

var Page = function(attributes, options) {
  attributes = attributes || {};
  if(this.defaults)
    attributes = _.extend({}, attributes, this.defaults);

  this.attributes = attributes;

  this.cid = _.uniqueId('page');
  this.initialize.apply(this, arguments);

  this.packageme = require("packageme");

  if(!this.attributes.body)
    throw new Error("'body' is missing.\n"+JSON.stringify(this.attributes));

  var root = this.attributes.root;
  var body = this.attributes.body;
  var layout = this.attributes.layout;
  var stylesheets = this.attributes.stylesheets;
  var javascripts = this.attributes.javascripts;
  var views = this.attributes.views;

  if(!root)
    root = this.attributes.root = path.dirname(body);

  if(body.indexOf(".") == 0 || body.indexOf("/") != 0)
    this.attributes.body = body = path.normalize(root+"/"+body);
  
  
  if(typeof layout == "string" && 
      layout.indexOf(".") == 0 && 
      layout.indexOf("/") != 0)
    this.attributes.layout = layout = path.normalize(root+"/"+layout);

  var prependRoot = function(v){ 
    if(v.indexOf(".") == 0 || v.indexOf("/") != 0)
      return path.normalize(root+"/"+v); 
    else
      return v;
  };

  if(stylesheets)
    this.attributes.stylesheets = stylesheets = _.map(stylesheets, prependRoot);
  if(javascripts)
    this.attributes.javascripts = javascripts = _.map(javascripts, prependRoot);
  if(views)
    this.attributes.views = views = _.map(views, prependRoot);
}

_.extend(Page.prototype, Backbone.Events, {

  initialize: function() {},

  registerStylesheetHandler : function(req, res, next){
    // in case only one argument is given, assume it is app and register handler
    if(arguments.length == 1) {
      var page = this;
      req.get("/" + this.cid + ".css", function(req, res, next){
        page.registerJavascriptHandler(req, res, next);
      });
      return;
    }

    res.header("content-type","text/css");
    this.packageme({source: this.attributes.stylesheets, format: "css"}).pipe(res);
  },

  registerJavascriptHandler : function(req, res, next) {
    // in case only one argument is given, assume it is app and register handler
    if(arguments.length == 1) {
      var page = this;
      req.get("/"+ this.cid + ".js", function(req, res, next){
        page.registerJavascriptHandler(req, res, next);
      });
      return;
    }

    res.header("content-type","text/javascript");
    this.packageme({source: this.attributes.javascripts, format: "js"}).pipe(res);
  },

  compileViews : function(callback) {
    if(this.attributes.views)
      this.packageme({ sourceFolder: this.attributes.views, format: "html" }).toString(callback);
    else
      callback();
    
    return this;
  },

  render : function(req, res, next){
    var renderData = {};

    if(this.attributes.variables)
      renderData = _.extend(renderData, this.attributes.variables);

    // provide params and query to templates
    renderData.params = JSON.stringify(req.params ? req.params : {});
    renderData.query = JSON.stringify(req.query ? req.query : {});

    // provide stylesheets and javascripts to templates
    if(this.attributes.stylesheets)
      renderData.stylesheets = '<link rel="stylesheet" href="/'+ this.cid + '.css">';
    if(this.attributes.javascripts)
      renderData.javascripts = '<script type="text/javascript" src="/'+ this.cid + '.js"></script>';

    // compile the this and render the output
    var page = this;
    this.compileViews(function(viewsData) {
      renderData.views = viewsData;
      
      res.render(page.attributes.body, renderData, function(err, bodyData){
        
        if(page.attributes.layout) {
          renderData.content = bodyData;
          res.render(page.attributes.layout, renderData);
        }
        else
          res.send(bodyData);
      });
    });

    return this;
  }

});

Page.extend = Backbone.View.extend;
module.exports = Page;