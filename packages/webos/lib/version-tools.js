var semver = require("semver"),
  path = require("path"),
  fs = require("fs");
(function() {
  function g(c) {
    a ? c(null, a && a.engines && a.engines.node || "") : f(function(b) {
      c(b, a && a.engines && a.engines.node || "")
    })
  }

  function f(c) {
    var b = path.resolve(__dirname, "..", "package.json");
    fs.readFile(b, function(b, e) {
      b && c(b);
      try {
        a = JSON.parse(e), c()
      } catch (d) {
        c(d)
      }
    })
  }

  function h(c) {
    a ? c(null, a.version) : f(function(b) {
      c(b, a && a.version || "unknown")
    })
  }
  var d = {};
  "undefined" !== typeof module && module.exports && (module.exports = d);
  var a = null;
  d.showVersionAndExit = function() {
    h(function(a, b) {
      console.log("Version: " + b);
      process.exit(0)
    })
  };
  d.checkNodeVersion = function(a) {
    g(function(b, d) {
      var e = semver.validRange(d);
      e ? semver.satisfies(process.version, e) ? a() : (console.error("This command only works on Node.js version: " + e), process.exit(1)) : (console.error("Invalid Node.js version range: " + d), process.exit(1))
    })
  }
})();
