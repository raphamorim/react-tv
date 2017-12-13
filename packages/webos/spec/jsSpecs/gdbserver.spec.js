var path = require('path'),
    installLib = require('../../lib/install'),
    gdbserverLib = require('../../lib/gdbserver');

var tempFiles = path.join(path.resolve(__dirname),"../tempFiles"),
    nativeApp = "com.test.nativetest",
    nativeAppPath = path.resolve(tempFiles, "com.test.native.ipk");

var options = {
    device: process.argv[process.argv.length - 1],
    appId: nativeApp
    //serviceId: argv.service,
   // port: argv.port
};

describe('>> Gdbserver', function() {
  describe('> Native app', function() {
    beforeEach(function(done){
      installLib.install(options, nativeAppPath,function(err, result){
      });
      setTimeout(function(){
        done();
      },4000);
    });

    it('should be able to debug', function(done) {
      gdbserverLib.run(options, null, function(err,gdbserRet) {
        expect(err).toBe(null);
        done();
        setTimeout(function(){
          process.exit(0);
        },2000);
      });
    });
  });

});