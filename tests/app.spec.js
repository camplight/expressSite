var httpMocks = require("node-mocks-http");
var mockupResponse = require("./helpers/mockupResponse");

var fs = require("fs");

var Page = require("../Page");
var app = require("../index");

var emptyPagePath = __dirname+"/testData/emptyPage.html";
var page;

describe('App and Page Module critical', function(){

  it("app and page should be defined", function(){
    expect(app).toBeDefined();
    expect(app.addPage).toBeDefined();
    expect(Page).toBeDefined();
  });

  it("should be able to create Page instance with body => "+emptyPagePath, function(){
    page = new Page({body: emptyPagePath});
    expect(page).toBeDefined();
  });

  it("should be able to retrieve express route handler", function(){
    var handler = page.render;
    expect(handler).toBeDefined();
  });

  it("should recieve default layout with empty values for data placeholders", function(done){
    fs.readFile(emptyPagePath, function(err, html){
      var request  = httpMocks.createRequest({
          method: 'GET',
          url: '/user/42',
          params: { id: 42 }
      });
      var response = mockupResponse(function(){
        expect(response._getData(), html.toString());
        done();
      });
      page.render(request,response);
    });
  });

});