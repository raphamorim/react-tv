var path = require('path'),
    installLib = require('../../lib/install'),
    launchLib = require('../../lib/launch'),
    inspectLib = require('../../lib/inspect');

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
   // opkg: argv['opkg'] || false,
   // opkg_param:  argv['opkg-param'],
   // storage: argv.storage
};


describe('>> Installer', function() {

  describe('> Install', function() {
    it('should install a pakcage file...', function(done) {
        var installRes;
          installLib.install(options, pkgPath, function(err, value) {
          installRes = value;
          });

        setTimeout(function() {
          expect(installRes.msg).toBe('Success');
          done();
        }, 10000);
      },10000);

    it('should not install a unkown pakcage file...', function(done) {
      installLib.install(options, "/dev/unkown/ipk", function(err, value) {
        expect(value.msg).not.toBe('Success');
      });
      done();

    });

  });

  describe('> List', function() {

    it('should List the installed app IDs...', function() {
      installLib.list(options, function(err, listInstalledApp) {
        expect(listInstalledApp).not.toBeUndefined();
        expect(pkgs).toBe(undefined);
        var found = pkgs.filter(function(packid) {
          return (packid.id === pkgId);
        });
        expect(found.id).toBe(pkgId);

      });

    });

  });

  describe('> ListFull', function() {
    it('should List the installed app detailed infomatins', function() {
      installLib.list(options, function(err, listInstalledAppInfo) {
        expect(listInstalledAppInfo).not.toBeUndefined();
      });

    });

  });

  describe('> List storage', function() {
    it('should List the STORAGEs in DEVICE', function() {
      installLib.listStorage(options, function(err, listStorage) {
        expect(listStorage).not.toBeUndefined();
      });

    });

  });

  describe('> Remove', function() {
    it('should remove the installed app', function() {
      installLib.remove(options, pkgId,function(err,remove){
        expect(remove).not.toBeUndefined();

      });

    });

  });

});

describe('>> Launcher', function() {
    var params = {};
  describe('> Launch', function() {
    var params = {};
    beforeEach(function(done){
      installLib.install(options, pkgPath, function(err, install) {
      });

      setTimeout(function(){
        done();
      },3000);
    });
    it('should Launch specified application', function() {
      launchLib.launch(options, pkgId, params, function(err, launchApp) {
        expect(launchApp).not.toBeUndefined();
      });
    });

  });
  describe('> List Running Apps', function() {
    it('should list running application', function() {
      launchLib.listRunningApp(options, null, function(err, runningApps) {
        expect(runningApps).not.toBeUndefined();
      });
    });
  });

  describe('> list Hosted App', function() {
    it('should run Hosted application', function() {
      options.installMode = "Hosted";
      launchLib.launch(options, appDir, params, function(err,hostedApp){
        expect(hostedApp).not.toBeUndefined();
      });

    });

  });

  describe('> close app', function() {
    it('should close launched application', function() {
      launchLib.close(options, pkgId, params, function(err,closeApp){
        expect(hostedApp).not.toBeUndefined();
      });

    });

  });

});

describe('>> Inspect', function() {
  describe('> web app debugging', function() {
    beforeEach(function(done){
    var params = {};
      launchLib.launch(options, pkgId, params, function(err,launchApp) {
      });
      setTimeout(function(){
        done();
      },3000);
    });

    it('should debug web application', function(done) {
        setTimeout(function() {
            inspectLib.inspect(options, null, function(err,inspectApp){
              expect(inspectApp).not.toBeUndefined();
              done();
            });
          }, 5 * 1000);

    });

  });

});