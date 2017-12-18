var path = require('path'),
    installLib = require('../../lib/install');

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


describe('>> Installer', function() {

  describe('> Install', function() {
    it('should install a pakcage file...', function(done) {
        var installRes;
          installLib.install(options, pkgPath, function(err, value) {
          installRes = value;
          console.log("err..1. ",err);
          expect(installRes.msg).toBe('Success');
          done();
          });
      });
  });

  describe('> List', function() {

    it('should List the installed app IDs...', function(done) {
      installLib.list(options, function(err, listInstalledApp) {
        expect(listInstalledApp).not.toBeUndefined();
          console.log("err..3. ",err);
          done();
        /*expect(pkgs).toBe(undefined);
        var found = pkgs.filter(function(packid) {
          return (packid.id === pkgId);
        });
        expect(found.id).toBe(pkgId);*/

      });

    });

  });

  describe('> ListFull', function() {
    it('should List the installed app detailed infomatins', function(done) {
      installLib.list(options, function(err, listInstalledAppInfo) {
        expect(listInstalledAppInfo).not.toBeUndefined();
          console.log("err..4. ",err);
          done();
      });

    });

  });

  describe('> List storage', function() {
    it('should List the STORAGEs in DEVICE', function(done) {
      installLib.listStorage(options, function(err, listStorage) {
        expect(listStorage).not.toBeUndefined();
          console.log("err..5. ",err);
          done();
      });
    });
  });

  describe('> Remove', function() {
    it('should remove the installed app', function(done) {
      installLib.remove(options, pkgId,function(err,remove){
        expect(remove).not.toBeUndefined();
          console.log("remove..6. ",remove);
          done();

      });
    });
  });

});