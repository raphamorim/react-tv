var path = require('path'),
    inspectLib = require('../../lib/inspect'),
    launchLib = require('../../lib/launch');

var pkgId = "com.jasmine.app";

var options = {
    appId: pkgId,
    device: process.argv[process.argv.length - 1]
};


describe('>> Inspect', function() {
  describe('> web app debugging', function() {
    beforeEach(function(done){
    var params = {};
      launchLib.launch(options, pkgId, params, function(err,launchApp) {
        done();
      });
    });

    it('should debug web application', function(done) {
            inspectLib.inspect(options, null, function(err,inspectApp){
              console.log("Inspect err...",err, "inspectApp... ",inspectApp);
              expect(err).toBe(null);
                done();
            });

    });

  });

  describe('> web app debugging', function() {
    it('should open in default browser', function(done) {
            options.open = true;
            inspectLib.inspect(options, null, function(err,inspectApp){
              console.log("Inspect err...",err, "inspectApp... ",inspectApp);
              expect(err).toBe(null);
                done();
              setTimeout(function(){
                console.log("exiting the process");
                process.exit(0);
              },4000);
            });

    });

    });

});