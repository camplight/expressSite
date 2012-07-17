var Page = require("../Page");

module.exports = Page.extend({
  
  defaults: {
    root: __dirname+"/client",
    url: "/about",
    content: "./pages/about.jade"
  },

  initialize: function(){
    this.attributes.code = [];
    this.attributes.code.push("./controllers/index.js");
  },

  handleMyRequest: function(req, res, next){
    res.locals.myCustomData = this.attributes.code;
    this.render(req, res, next);
  },

  render: function(req, res, next){
    res.locals.myCustomData = this.attributes.code;
    var start = new Date();
    res.locals.time = function(){
      return (new Date()).getTime()-start.getTime();
    };
    Page.prototype.render.call(this, req, res, next);
  }

});