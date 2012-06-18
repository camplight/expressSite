var _ = require("underscore");
var Backbone = require("backbone");
var path = require("path");
var async = require("async");

var Page = function(attributes, options) {

  attributes = attributes || {};

  if(this.defaults)
    attributes = _.extend({}, attributes, this.defaults);
  
  if(this.extendDefaults)
    attributes = this.extendDefaultAttributes(attributes, this.extendDefaults)

  this.attributes = attributes;

  this.cid = _.uniqueId('page');
  this.initialize.apply(this, arguments);

  this.packageme = require("packageme");

  if(!this.attributes.body && !this.attributes.content)
    throw new Error("'body' or 'content' is missing.\n"+JSON.stringify(this.attributes));

  // prepend root to any of given paths as well as calculate the root if it is missing.
  this.rootPaths();

  // convert  code, views, style attributes to packageme options
  this.packagemeOptions();
}

_.extend(Page.prototype, Backbone.Events, {

  initialize: function() {},

  extendDefaultAttributes: function(input, attrs){
    // mix input with attrs
    for(var key in attrs)
      if(typeof input[key] == "undefined")
        input[key] = attrs[key];
      else
      if(Array.isArray(input[key]))
        for(var i = 0; i<attrs[key].length; i++)
          input[key].push(attrs[key][i]);
      else
      if(typeof input[key] == "object")
        _.extend(input[key], attrs[key]);
    return input;
  },

  rootPaths : function(){
    var root = this.attributes.root;
    var content = this.attributes.content;
    var layout = this.attributes.layout;
    var style = this.attributes.style;
    var code = this.attributes.code;
    var views = this.attributes.views;

    if(!root)
      root = this.attributes.root = path.dirname(content);

    if(content.indexOf(".") == 0 || content.indexOf("/") != 0)
      this.attributes.content = content = path.normalize(root+"/"+content);
    
    if(typeof layout == "string" && layout.indexOf(".") == 0 && layout.indexOf("/") != 0)
      this.attributes.layout = path.normalize(root+"/"+layout);

    var prependRoot = function(v){ 
      // packageme driven paths can be objects of packageme/lib/File structure,
      // threfore respecting that usage
      if(typeof v == "object") {
        if(v.fullPath.indexOf(".") == 0 || v.fullPath.indexOf("/") != 0)
          v.fullPath = path.normalize(root+"/"+v.fullPath); 
        return v;
      }

      // just prepend root if given path is relative or it is missing start /
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
  },

  packagemeOptions : function(){
    if(typeof this.attributes.packageme == "undefined")
      this.attributes.packageme = {};

    if(this.attributes.code)
      this.attributes.code = _.extend({
        source: this.attributes.code, 
        format: "js", 
        prefix: "/"+this.cid+"/",
        compile: this.attributes.compile
      }, this.attributes.packageme);

    if(this.attributes.style)
      this.attributes.style = _.extend({
        source: this.attributes.style, 
        format: "css", 
        prefix: "/"+this.cid+"/"
      }, this.attributes.packageme);

    if(this.attributes.views)
      this.attributes.views = _.extend({ 
        sourceFolder: this.attributes.views, 
        format: "html" 
      }, this.attributes.packageme);
  },

  get: function(name){
    return this.attributes[name];
  },

  set: function(name, value) {
    return this.attributes[name] = value;
  },

  registerStyleHandlers : function(app){
    if(this.attributes.style)
      this.packageme(this.attributes.style).serveFilesToExpress(app);

    return this;
  },

  registerCodeHandlers: function(app) {
    if(this.attributes.code)
      this.packageme(this.attributes.code).serveFilesToExpress(app);

    return this;
  },

  compileViews : function(callback) {
    if(this.attributes.views)
      this.packageme(this.attributes.views).toString(function(data){
        callback(null, data);
      });
    else
      callback(null, undefined);
    
    return this;
  },

  compileCode : function(callback){
    if(this.attributes.code) {
      this.packageme(this.attributes.code).toScriptTags(function(data){
        callback(null, data);
      });
    } else
      callback(null, []);

    return this;
  },

  compileStyle : function(callback){
    if(this.attributes.style) {
      this.packageme(this.attributes.style).toStyleTags(function(data){
        callback(null, data);
      });
    } else
      callback(null, []);

    return this;
  },

  render : function(req, res, next){
    var renderData = {};

    if(this.attributes.variables)
      renderData = _.extend(renderData, this.attributes.variables);

    // provide params and query to templates
    renderData.params = JSON.stringify(req.params ? req.params : {});
    renderData.query = JSON.stringify(req.query ? req.query : {});

    // compile the this and render the output
    var page = this;
    async.parallel([
      function(done){ page.compileCode(done) },
      function(done){ page.compileStyle(done) },
      function(done){ page.compileViews(done) }
    ], function(err, results){
      
      renderData.javascripts = results[0].join("\n");
      renderData.stylesheets = results[1].join("\n");
      renderData.views = results[2];

      res.render(page.attributes.content, renderData, function(err, bodyData){
        if(err) 
          throw err;

        if(page.attributes.layout) {
          renderData.content = bodyData;
          res.render(page.attributes.layout, renderData);
        }
        else
          res.send(bodyData);
      });  
    })
    
    return this;
  }

});

Page.extend = Backbone.View.extend;
module.exports = Page;