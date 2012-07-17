
var Page = require("../Page");
var MyPage;

describe('App and Page Module critical', function(){

  it("page should be defined", function(){
    expect(Page).toBeDefined();
  });

  it("should be able to extend Page", function(){
    MyPage = Page.extend({
      defaults : {
        variable: "A",
        list: [1, 2]
      },
      extendDefaults : {
        variable: "B",
        list: [3]
      }
    });
  });

  it("new instance should have extended attributes set properly", function(){
    var p = new MyPage();
    expect(p.attributes.variable).toBe("B");
    expect(p.attributes.list.join(" ")).toBe([1,2,3].join(" "));
  });

});