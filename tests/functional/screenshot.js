// ------
// CONFIGURATION BEGIN
// ------
var configPath 	= "./screenshot.json",
	destPath	= "../../screenshots",
// ------
// CONFIGURATION END
// ------
	config, configFile;

// Inclue les composants nécessaire
var casper 	= require("casper").create(),
	fs 		= require('fs');

//engine
var engine = casper.cli.get(0) || 'default';
// Lecture du fichier de configuration
try {
	configFile 	= fs.read(configPath);
	config 		= JSON.parse(configFile);
} catch(err) {
	casper.echo(err);
}
// Vérification du fichier de configuration
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
	        	top		: 0,
				left	: 0,
				width	: viewport.viewport.width,
				height	: viewport.viewport.height
			});
		});
	});
});
casper.run();
