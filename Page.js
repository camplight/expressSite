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

  var root = this.attributes.root;
  if(!root)
    root = this.attributes.root = path.dirname(body);

  var body = this.attributes.body;
  if(!body)
    throw new Error("'body' is missing.\n"+JSON.stringify(this.attributes));

  if(this.attributes.body.indexOf(".") == 0)
    body = this.attributes.body = path.normalize(root+"/"+this.attributes.body);
  
  if(typeof this.attributes.layout == "string" && 
      this.attributes.layout.indexOf(".") == 0 && 
      this.attributes.layout.indexOf("/") != 0)
    this.attributes.layout = path.normalize(root+"/"+this.attributes.layout);
  else
    if(this.attributes.layout !== false)
      this.attributes.layout = __dirname+"/layout.html";

  var prependRoot = function(v){ 
    if(v.indexOf(".") == 0 || v.indexOf("/") != 0)
      return path.normalize(root+"/"+v); 
    else
      return v;
  };
  if(this.attributes.stylesheets)
    this.attributes.stylesheets = _.map(this.attributes.stylesheets, prependRoot);
  if(this.attributes.javascripts)
    this.attributes.javascripts = _.map(this.attributes.javascripts, prependRoot);
  if(this.attributes.views)
    this.attributes.views = _.map(this.attributes.views, prependRoot);
}

_.extend(Page.prototype, Backbone.Events, {

  initialize: function() {},

  registerStylesheetHandler : function(app) {
    if(this.attributes.stylesheets) {
      var page = this;
      app.get("/" + this.cid + ".css", function(req, res, next){
        res.header("content-type","text/css");
        page.packageme({source: page.attributes.stylesheets, format: "css"}).pipe(res);
      });
    }

    return this;
  },

  registerJavascriptHandler : function(app) {
    if(this.attributes.javascripts) {
      var page = this;
      app.get("/"+ this.cid + ".js", function(req, res, next){
        res.header("content-type","text/javascript");
        page.packageme({source: page.attributes.javascripts, format: "js"}).pipe(res);
      });
    }

    return this;
  },

  compileViews : function(callback) {
    if(this.attributes.views)
      this.packageme({ sourceFolder: this.attributes.views, format: "html" }).toString(callback);
    else
      callback();
    
    return this;
  },

  render: function(){
    var page = this;

    return function(req, res, next){

      var renderData = {};

      if(page.attributes.variables)
        renderData = _.clone(page.attributes.variables);

      // provide params and query to templates
      renderData.params = JSON.stringify(req.params ? req.params : {});
      renderData.query = JSON.stringify(req.query ? req.query : {});

      // provide stylesheets and javascripts to templates
      if(page.attributes.stylesheets)
        renderData.stylesheets = '<link rel="stylesheet" href="/'+ page.cid + '.css">';
      if(page.attributes.javascripts)
        renderData.javascripts = '<script type="text/javascript" src="/'+ page.cid + '.js"></script>';

      // compile the page and render the output
      page.compileViews(function(viewsData) {
        renderData.views = viewsData;
        
        res.render(page.attributes.body, renderData, function(err, bodyData){
          
          if(page.attributes.layout) {
            renderData.body = bodyData;
            res.render(page.attributes.layout, renderData);
          }
          else
            res.send(bodyData);
        });
      });

      return this;
    }
  }
});

Page.extend = Backbone.View.extend;
module.exports = Page;