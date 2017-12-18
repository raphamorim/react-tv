var rootLib = require('../../lib/root');

var options = {
  name : process.argv[process.argv.length - 1]
}

describe('>>Root', function() {
  describe('> Enable root', function() {
    it('should root the device', function(done) {
      rootLib.enableRoot(options, function(rootRet){
        expect(rootRet).toBe(null);
        done();
      });

    });

  });

  describe('> Disable root', function() {
    it('should root the device', function(done) {
        rootLib.enableRoot(options, function(unrootRet){
        console.log("unrootRet ",unrootRet);
        expect(unrootRet).toBe(null);
        done();
      });
    });
  });

});