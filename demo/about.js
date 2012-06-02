var Page = require("expressSite/Page");

module.exports = Page.extend({
  
  defaults: {
    root: __dirname+"/client",
    url: "/about",
    body: "./pages/about.html"
  },

  initialize: function(){

    this.attributes.javascripts = [];
    this.attributes.javascripts.push(
      "./controllers/index.js"
      //...
    );
  }

});