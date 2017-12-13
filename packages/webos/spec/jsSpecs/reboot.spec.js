var rebootLib = require('../../lib/reboot'),
    async = require('async');

var options = {
  name : process.argv[process.argv.length - 1]
}

describe('>> Reboot', function() {

  it('should reboot the device', function() {
      rebootLib.reboot(options, function(err,reboot){
        expect(err).not.toBe(null);
        setTimeout(function(){
          done();
        },3000);
    });
  });

});