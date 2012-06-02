var _ = require("underscore");
var Backbone = require("backbone");
var path = require("path");

var Page = function(attributes, options) {
  attributes = attributes || {};
  if(this.defaults)
    attributes = _.extend({}, this.defaults, attributes);

  this.attributes = attributes;

  this.cid = _.uniqueId('page');
  this.initialize.apply(this, arguments);

  this.packageme = require("packageme");
  this.mu = require('mu2');

  var root = this.attributes.root;
  if(!root)
    root = this.attributes.root = path.dirname(body);

  this.mu.root = this.attributes.root;

  var body = this.attributes.body;
  if(!body)
    throw new Error("'body' is missing.\n"+JSON.stringify(this.attributes));

  if(this.attributes.body.indexOf(".") == 0)
    body = this.attributes.body = path.normalize(root+"/"+this.attributes.body);
  
  if(this.attributes.layout && 
      this.attributes.layout.indexOf(".") == 0 && 
      this.attributes.layout.indexOf("/") != 0)
    this.attributes.layout = path.normalize(root+"/"+this.attributes.layout);
  else
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

  compileAndRender : function(template, data, callback) {
    var buffer = '';
    this.mu.compileAndRender(template, data)
      .on("error", function(e){ console.log(e, template); })
      .on('data', function (c) { buffer += c.toString(); })
      .on('end', function () { callback(buffer); });

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

        // compiling the final html, which is send to the browser
        page.compileAndRender(page.attributes.body, renderData, function(pageBodyData){
          if(page.attributes.layout) {
            renderData.body = pageBodyData;
            page.compileAndRender(page.attributes.layout, renderData, function(pageHtmlData) {
              res.send(pageHtmlData);
            });  
          } else {
            res.send(pageBodyData);
          }
        });

      });

      return this;
    }
  }
});

Page.extend = Backbone.View.extend;
module.exports = Page;