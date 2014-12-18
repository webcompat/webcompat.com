
//Config
var configPath = "./screenshot.json",
    destPath = "../../screenshots",
//var
    config, configFile;

//Includes components
var casper = require("casper").create(),
    fs = require('fs');

//Engine
var engine = casper.cli.get(0) || 'default';
//Try config file
try {
  configFile = fs.read(configPath);
  config     = JSON.parse(configFile);
} catch(err) {
  casper.echo(err);
}
//Test config file
if('object' !== typeof(config)) {
  casper.echo('Configuration file "'+configPath+'" not found');
  casper.exit(1);
} else if(!config.urls) {
  casper.echo('Configuration file is malformed : "urls" not found');
  casper.exit(1);
} else if(!config.viewports) {
  casper.echo('Configuration file is malformed : "viewports" not found');
  casper.exit(1);
}

casper.start().each(config.urls, function(self, url){
  self.each(config.viewports, function(casper, viewport) {
    this.then(function() {
      this.viewport(viewport.viewport.width, viewport.viewport.height);
    });
    this.thenOpen(url.url, function() {
      this.wait(1000);
    });
    this.then(function(){
      this.echo('Screenshot for ' + engine + ' : ' + url.name + ' : ' + viewport.name + ' (' + viewport.viewport.width + 'x' + viewport.viewport.height + ')', 'info');
      this.capture(destPath + '/' + engine + '-' + url.name + '-' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png', {
          top: 0,
          left: 0,
          width: viewport.viewport.width,
          height: viewport.viewport.height
      });
    });
  });
});
casper.run();
