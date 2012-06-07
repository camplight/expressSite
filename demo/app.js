// get express app instance with pages support
var app = require("expressSite");

// register per extension template engines
var cons = require("consolidate");
app.engine('html', cons.hogan);
app.engine('jade', cons.jade);

// set default express view/page extension
app.set('view engine', 'jade');

app.configure(function(){
  app.useExpressSiteMiddleware();
});

// set default Page attributes to be passed on every page created by the app
app.defaultPageAttributes({
  root: __dirname+"/client",
  layout: "./pages/layout.jade",
  variables: {
    version: require(__dirname+"/../package.json").version
  }
});

// add a page at given url with body, javascripts & some mustache variables
app.addPage({
  url: "/",
  body: "./pages/index",
  javascripts: ["./libs", "./controllers/index.js"],
  variables: {
    title: "Index Page"
  }
});

// get Page class
var AboutPage = require("./about");

// create custom Page instance
var aboutPageClone = new AboutPage({
  variables: {
    title: "Other About"
  }
});

// register stylesheets and javascript assets handlers
aboutPageClone.registerStylesheetHandler(app);
aboutPageClone.registerJavascriptHandler(app);

// render the page on url different from the page's attributes
app.get("/other", function(req, res, next){
  aboutPageClone.render(req, res, next);
});
app.get("/myCustomData", function(req, res, next){
  aboutPageClone.handleMyRequest(req, res, next);
});

// add the page's Class , addPage will create instance of it using default page attributes.
app.addPage(AboutPage);

// launch the app :)
app.listen(8000, function(){
  console.log("listening on 8000");
});