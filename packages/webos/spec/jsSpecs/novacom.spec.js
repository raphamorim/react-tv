var novacom = require('../../lib/novacom');

var options = {
  name : process.argv[process.argv.length - 1]
}

describe('>> Novacom', function() {
  describe('> run', function() {
    it('should execute shell commands ', function(done) {
      var session = new novacom.Session(options, function(err, runRet) {
        session.run("pwd", process.stdin, process.stdout, process.stderr, function(err,cmdRet){
        expect(err).toBe(null);
        setTimeout(function(){
          done();
        },3000);
      });
    });
  });
    it('should port forward between a Host PC and the target', function(done) {
      options.session = new novacom.Session(options, function(){});
      var devicePort = 9998, localPort = 4321;
      options.session.forward(devicePort, localPort, function(err,forwardRet){
        console.log("err... ",err , "forwardRet... ",forwardRet);
        setTimeout(function () {
         done();
         process.exit(0);
        },3000);
      });
    });
    });


});