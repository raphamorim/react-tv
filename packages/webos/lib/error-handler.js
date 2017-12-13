(function() {
  var c = {},
    d = {
      "com.webos.appInstallService": {
        0: "Sucess",
        "-1": "General error during app install request",
        "-2": "Bad parameter",
        "-3": "Not enough storage",
        "-4": "Error on downloading app",
        "-5": "Installation failure (the reason may be unsupported architecture)",
        "-6": "General error on removing app",
        "-7": "Error on removing app",
        "-9": "Error code -9",
        "-10": "Installation failure (USB is busy)",
        "-11": "Installation failure on USB. This app should be installed on internal memory",
        "-12": "Restore task failure from power off",
        "-13": "Same app exists on another storage. Please install app on the same storage or remove the previous app",
        "-14": "Requested target storage does not exist",
        "-15": "Please change the app id (app id should not start with 'com.lge', 'com.webos', 'com.palm')",
        "-16": "User authentication error",
        "-17": "Error code -17"
      }
    },
    e = {
      EACCES: "No permission to write, please check the directory permission.",
      ECONNREFUSED: "Please check the device IP address or port.",
      ECONNRESET: "Unable to connect to device, please check the device.",
      "Authentication failure": "Ssh authentication failure, please check ssh connection info such as password, privatekey and username again.",
      "Time out": "Connection time out. please check the device IP address or port.",
      "connect Unknown system": "Please check the device IP address or port.",
      "Unable to parse private key": "Wrong passphrase for ssh key, please check passphrase again.",
      "insufficient free space": "Installation failure, please check if there is sufficient free space in the disk.",
      "install failed": "Installation failure, please check the disk space.",
      "Unable to request a pseudo-terminal": "Unable to open terminal. (Target does not allow to open pty.)",
      INVALID_APPID: "lowercase letters(a-z), digits(0-9), plus(+) and minus(-) signs and periods(.) can be used for app id"
    };
  "undefined" !== typeof module && module.exports && (module.exports = c);
  c.getErrMsg = function(a, b) {
    if (d.hasOwnProperty(a)) return d[a][b]
  };
  c.changeErrMsg = function(a) {
    if (!a) return a;
    var b;
    for (key in e)
      if (a.toString().match(new RegExp(key, "i"))) {
        b = Error(e[key]);
        break
      }
    b || (b = a);
    return b
  }
})();
