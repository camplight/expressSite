require('shelljs/global');

var p = require("../package.json");
var newVersion = p.version.split(".");
newVersion[2] = (parseInt(newVersion[2])+1).toString();
newVersion = newVersion.join(".");

cd(__dirname+"/../");
if(exec("git flow release start "+newVersion).code != 0){
  echo("Error: failed to start release");
  exit(1);
}

// TODO find out how to trap errors from sed bellow
sed('-i', '"version": "'+p.version+'"', '"version": "'+newVersion+'"', "package.json");

if(exec("git commit -am '"+newVersion+" release'").code != 0){
  echo("Error: failed to commit version bump");
  exit(1);
}
if(exec("npm publish").code != 0){
  echo("Error: failed to publish package in NPM");
  exit(1);
}
if(exec("git flow release finish -m "+newVersion+" "+newVersion).code != 0){
  echo("Error: failed to finsih release");
  exit(1);
}
if(exec("git push --tags").code != 0) {
  echo("Error: failed to push targs");
  exit(1);
}
if(exec("git push").code != 0) {
  echo("Error: failed to push");
  exit(1);
}