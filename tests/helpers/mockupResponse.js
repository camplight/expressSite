module.exports = function(done) {
  var cons = require("consolidate");
  var response = require("node-mocks-http").createResponse();
  
  response.render = function(template, options, callback) {
    if(typeof callback == "function")
      cons.jade(template, options, callback);
    else
      cons.jade(template, options, function(err, data){
        response.send(data);
        done();
      });
  }

  var _send = response.send;
  response.send = function(data){
    _send(data);
    done();
  };
  return response;
}