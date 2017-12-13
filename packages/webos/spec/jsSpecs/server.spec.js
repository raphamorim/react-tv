var path = require('path'),
    serverLib = require('../../lib/server'),
    commonTools = require('../../lib/common-tools');

var tempFiles = path.join(path.resolve(__dirname),"../tempFiles"),
    appPath = path.resolve(tempFiles, "jasmine"),
    disPath = "/media/internal/";

describe('>> Server', function() {
  var openUrl;
  describe('> run', function() {
    it('should Display local web server url', function(done) {
      serverLib.runServer(appPath, 0, function(err,responseRet){
        expect(err).toBe(null);
        if(err === null){
          openUrl = responseRet.url;
        }
        setTimeout(function(){
          done();
        },2000);
      });
    });

  });

  describe('> Open ', function() {
    it('should run web app on local server', function(done) {
      openUrl = openUrl + '/ares_cli/ares.html';
      serverLib.openBrowser(openUrl, function(err,openRet){
        expect(err).toBe(null);
        done();
      });
    });

  });

});