var help = require("./help-format"),
  version = require("./version-tools"),
  errMsg = require("./error-handler"),
  cliControl = require("./cli-control"),
  setupDevice = require("./setup-device"),
  appdata = require("./cli-appdata"),
  sdkenv = require("./sdkenv");
(function() {
  var a = {};
  "undefined" !== typeof module && module.exports && (module.exports = a);
  a.help = help;
  a.version = version;
  a.errMsg = errMsg;
  a.cliControl = cliControl;
  a.setupDevice = setupDevice;
  a.appdata = new appdata;
  a.sdkenv = new sdkenv.Env
})();
