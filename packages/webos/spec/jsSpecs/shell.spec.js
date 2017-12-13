var shellLib = require('../../lib/shell');

var options = {
  name : process.argv[process.argv.length - 1]
}

//still need to handle for shell exit condition (need to add call back in the shell library).
describe('>> Shell', function() {
  describe('> shell', function() {
    var shellRet;
    beforeEach(function(done){
      shellLib.shell(options, function(err,shell){
        shellRet = err;
      });

      setTimeout(function(){
        done();
      },3000);

    })
    it('should enter shell of the device', function(done) {
        expect(shellRet).toBe(null);
      setTimeout(function(){
        done();
      },3000);

    });

  });

 describe('> Run', function() {
  it('should run shell commands', function(done) {
    shellLib.remoteRun(options, "pwd", function(err,runRet){
      expect(err).toBe(null);
      done();
      process.exit(0);
    });
  });

 });

});