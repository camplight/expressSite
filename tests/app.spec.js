describe('Page Module', function(){
  
  var Page = require("../Page");
  var app = require("../index");
  var emptyPagePath = __dirname+"/emptyPage.html";

  it("app and page should be defined", function(){
    expect(app).toBeDefined();
    expect(Page).toBeDefined();
    
    describe("should be able to create Page instance with body => "+emptyPagePath, function(){
      var page = new Page({body: emptyPagePath});
      expect(page).toBeDefined();
      describe("should be able to retrieve express route handler", function(){
        var handler = page.render();
        expect(handler).toBeDefined();
        describe("should recieve default layout with empty values for data placeholders", function(done){
          var cons = require("consolidate");
          var mockupRequest = require("./mockupRequest");
          var mockupResponse = require("./mockupResponse");
          var emptyTemplate;
          cons.hogan(__dirname+"/../layoyt.html", function(err, html){
            emptyTemplate = html;
            page.render()(mockupRequest,mockupResponse(function(res){
              expect(res.body).toBe(emptyTemplate);
            }));
          });
        });
      })
    });

    describe("should be able to set app reasonable defaults", function(){

    });

  });

});