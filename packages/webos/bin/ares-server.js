#! /usr/bin/env node
var fs = require("fs"),
  path = require("path"),
  log = require("npmlog"),
  nopt = require("nopt"),
  async = require("async"),
  serverLib = require("./../lib/server"),
  commonTools = require("./../lib/common-tools"),
  version = commonTools.version,
  cliControl = commonTools.cliControl,
  help = commonTools.help;
sdkenv = commonTools.sdkenv;
appdata = commonTools.appdata;
var processName = path.basename(process.argv[1]).replace(/.js/, "");
process.on("uncaughtException", function(a) {
  log.error("uncaughtException", a.toString());
  cliControl.end(-1)
});
2 === process.argv.length && process.argv.splice(2, 0, "--help");
var knownOpts = {
    version: Boolean,
    help: Boolean,
    open: Boolean,
    level: "silly verbose info http warn error".split(" ")
  },
  shortHands = {
    V: ["--version"],
    h: ["--help"],
    o: ["--open"],
    v: ["--level", "verbose"]
  },
  argv = nopt(knownOpts, shortHands, process.argv, 2);
log.heading = processName;
log.level = argv.level || "warn";
argv.help && (showUsage(), cliControl.end());
log.verbose("argv", argv);
var op;
argv.version ? version.showVersionAndExit() : op = runServer;
op && version.checkNodeVersion(function(a) {
  async.series([op.bind(this)], finish)
});

function showUsage() {
  help.display(processName, appdata.getConfig(!0).profile)
}

function runServer() {
  var a = argv.argv.remain.splice(0, 1).join("");
  if (!a) return finish("Please check the app directory path for web server");
  var a = fs.realpathSync(a),
    b, c = "";
  async.waterfall([serverLib.runServer.bind(serverLib, a, 0, function(a, d) {
    "@@ARES_CLOSE@@" === a ? (d.status(200).send(), b = setTimeout(function() {
      cliControl.end()
    }, 2E3)) : "@@GET_URL@@" === a && (clearTimeout(b), d.status(200).send(c))
  }), function(a, b) {
    if (a && a.port) {
      c = "http://localhost:" + a.port;
      var e = c + "/ares_cli/ares.html";
      console.log("Local server running on " +
        c)
    }
    argv.open && a.port && async.series([sdkenv.getEnvValue.bind(sdkenv, "BROWSER")], function(a, c) {
      if (a) return b(a);
      serverLib.openBrowser(e, c[0])
    });
    b()
  }, function(a) {}], finish)
}

function finish(a, b) {
  a ? (log.error(a), log.verbose(a.stack), cliControl.end(-1)) : (b && b.msg && console.log(b.msg), cliControl.end())
}
process.on("uncaughtException", function(a) {
  console.log("Caught exception: " + a)
});
