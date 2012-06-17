var httpMocks = require("node-mocks-http");
var mockupResponse = require("./helpers/mockupResponse");

var cons = require("consolidate");

var Page = require("../Page");
var partialsPagePath = __dirname+"/testData/partialsPage.jade";
var page;

describe('Page with Partials', function(){

  it("app and page should be defined", function(){
    expect(Page).toBeDefined();
  });

  it("should be able to create Page instance with body => "+partialsPagePath, function(){
    page = new Page({content: partialsPagePath, layout: false});
    expect(page).toBeDefined();
  });

  it("should receive page without default layout and with partial content", function(done){
    cons.jade(partialsPagePath, {}, function(err, html){
      if(err)console.log(err);
      var request  = httpMocks.createRequest({
          method: 'GET',
          url: '/user/42',
          params: { id: 42 }
      });
      var response = mockupResponse(function(){
        expect(response._getData(), html);
        done();
      });
      page.render(request,response);
    });
  });

});