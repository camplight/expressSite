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

  if(!this.attributes.body && !this.attributes.content)
    throw new Error("'body' or 'content' is missing.\n"+JSON.stringify(this.attributes));

  var root = this.attributes.root;
  var content = this.attributes.content || this.attributes.body; // for backwards compatability
  var layout = this.attributes.layout;
  var style = this.attributes.style || this.attributes.stylesheets; // for backwards compatability
  var code = this.attributes.code || this.attributes.javascripts; // for backwards compatability
  var views = this.attributes.views;

  if(!root)
    root = this.attributes.root = path.dirname(content);

  if(content.indexOf(".") == 0 || content.indexOf("/") != 0)
    this.attributes.content = content = path.normalize(root+"/"+content);
  
  
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

  if(style)
    this.attributes.style = style = _.map(style, prependRoot);
  if(code)
    this.attributes.code = code = _.map(code, prependRoot);
  if(views)
    this.attributes.views = views = _.map(views, prependRoot);
}

_.extend(Page.prototype, Backbone.Events, {

  initialize: function() {},

  renderStyle : function(req, res, next){
    // in case only one argument is given, assume it is app and register handler
    if(arguments.length == 1) {
      var page = this;
      req.get("/" + this.cid + ".css", function(req, res, next){
        page.renderStyle(req, res, next);
      });
      return;
    }

    res.header("content-type","text/css");
    this.packageme({source: this.attributes.style, format: "css"}).pipe(res);
  },

  renderCode: function(req, res, next) {
    // in case only one argument is given, assume it is app and register handler
    if(arguments.length == 1) {
      var page = this;
      req.get("/"+ this.cid + ".js", function(req, res, next){
        page.renderCode(req, res, next);
      });
      return;
    }

    res.header("content-type","text/javascript");
    this.packageme({source: this.attributes.code, format: "js"}).pipe(res);
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

    // provide style and code to templates
    if(this.attributes.style)
      renderData.stylesheets = '<link rel="stylesheet" href="/'+ this.cid + '.css">';
    else
      renderData.stylesheets = undefined;
    if(this.attributes.code)
      renderData.javascripts = '<script type="text/javascript" src="/'+ this.cid + '.js"></script>';
    else
      renderData.javascripts = undefined;

    // compile the this and render the output
    var page = this;
    this.compileViews(function(viewsData) {
      renderData.views = viewsData;
      
      res.render(page.attributes.content, renderData, function(err, bodyData){
        
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

// backward compatability
Page.prototype.registerStylesheetHandler = Page.prototype.renderStyle;
Page.prototype.registerJavascriptHandler = Page.prototype.renderCode;

Page.extend = Backbone.View.extend;
module.exports = Page;