// get express app instance with pages support
var app = require("expressSite");

// set default Page attributes to be passed on every page created by the app
app.defaultPageAttributes({
  root: __dirname+"/client",
  layout: "./pages/layout.html"
});

// add a page at given url with body, javascripts & some mustache variables
app.addPage({
  url: "/",
  body: "./pages/index.html",
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
 console.log(aboutPageClone.attributes);
// render the page on url different from the page's attributes
app.get("/other", aboutPageClone.render());

// add the page's Class , addPage will create instance of it using default page attributes.
app.addPage(AboutPage);

// launch the app :)
app.listen(8000, function(){
  console.log("listening on 8000");
});