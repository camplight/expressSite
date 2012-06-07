var Page = require("expressSite/Page");

module.exports = Page.extend({
  
  defaults: {
    root: __dirname+"/client",
    url: "/about",
    body: "./pages/about.jade"
  },

  initialize: function(){
    this.attributes.javascripts = [];
    this.attributes.javascripts.push("./controllers/index.js");
  },

  handleMyRequest: function(req, res, next){
    res.locals.myCustomData = this.attributes.javascripts;
    this.render(req, res, next);
  },

  render: function(req, res, next){
    res.locals.myCustomData = this.attributes.javascripts;
    var start = new Date();
    res.locals.time = function(){
      return (new Date()).getTime()-start.getTime();
    };
    Page.prototype.render.call(this, req, res, next);
  }

});