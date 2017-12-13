var path = require('path'),
    installLib = require('../../lib/install'),
    launchLib = require('../../lib/launch');

var pkgId = "com.jasmine.app",
    pkg = "com.jasmine.app_0.0.1_all.ipk",
    appDir = "jasmine",
    path_pwd = path.resolve(__dirname),
    tempFiles = path.join(path_pwd,"../tempFiles"),
    pkgPath = path.resolve(tempFiles, pkg),
    appDir = path.resolve(tempFiles, appDir);

var options = {
    appId: pkgId,
    device: process.argv[process.argv.length - 1]
};



describe('>> Launcher', function() {
    var params = {};
  describe('> Launch', function() {
    var params = {};
    beforeEach(function(done){
      installLib.install(options, pkgPath, function(err, install) {
       // done();
      });

      setTimeout(function(){
        done();
      },3000);
    });

    it('should Launch specified application', function(done) {
      launchLib.launch(options, pkgId, params, function(err, launchApp) {
        console.log("err... ",err);
        expect(launchApp).not.toBeUndefined();
        done();
      });
    });

  });

  describe('> List Running Apps', function() {
    it('should list running application', function(done) {
      launchLib.listRunningApp(options, null, function(err, runningApps) {
        expect(runningApps).not.toBeUndefined();
        done();
      });
    });
  });

  describe('> list Hosted App', function() {
    it('should run Hosted application', function(done) {
      options.installMode = "Hosted";
      launchLib.launch(options, appDir, params, function(err,hostedApp){
        expect(hostedApp).not.toBeUndefined();
        done();
      });

    });

  });

  describe('> close app', function() {
    it('should close launched application', function(done) {
      launchLib.close(options, pkgId, params, function(err,closeApp){
        expect(hostedApp).not.toBeUndefined();
        done();
      });

    });

  });

});