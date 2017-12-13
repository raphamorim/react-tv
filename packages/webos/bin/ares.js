#! /usr/bin/env node
var nopt = require("nopt"),
  async = require("async"),
  path = require("path"),
  fs = require("fs"),
  log = require("npmlog"),
  commonTools = require("./../lib/common-tools"),
  cliControl = commonTools.cliControl,
  version = commonTools.version,
  help = commonTools.help,
  appdata = commonTools.appdata,
  processName = path.basename(process.argv[1]).replace(/.js/, "");
process.on("uncaughtException", function(a) {
  log.error("uncaughtException", a.toString());
  log.info("uncaughtException", a.stack);
  cliControl.end(-1)
});
2 === process.argv.length && process.argv.splice(2, 0, "--help");
var knownOpts = {
    help: Boolean,
    list: Boolean,
    version: Boolean,
    level: "silly verbose info http warn error".split(" ")
  },
  shortHands = {
    h: ["--help"],
    l: ["--list"],
    V: ["--version"],
    v: ["--level", "verbose"]
  },
  listString, knownOptsData = [],
  argv = nopt(knownOpts, shortHands, process.argv, 2);
log.heading = processName;
log.level = argv.level || "warn";
log.verbose("argv", argv);
var op;
argv.list ? op = commandList : argv.version ? version.showVersionAndExit() : argv.help ? (showUsage(), cliControl.end()) : op = display;
op && version.checkNodeVersion(function(a) {
  async.series([op.bind(this)], finish)
});

function commandList(a) {
  var b, c = appdata.getConfig(!0).profile;
  try {
    b = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "lib", "json", "ares.json"))), Object.keys(b).forEach(function(a) {
      b[a].profile && -1 == b[a].profile.indexOf(c) || fs.existsSync(path.join(__dirname, a + ".js")) && console.log(a + "\t\t" + b[a].description)
    }), a()
  } catch (d) {
    a(Error("JSON parsing error!"))
  }
}

function display(a) {
  var b;
  try {
    b = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "lib", "json", "ares.json")));
    for (arg in argv) b.hasOwnProperty("ares-" + arg) && fs.existsSync(path.join(__dirname, "ares-" + arg + ".js")) && help.display("ares-" + arg, appdata.getConfig(!0).profile);
    a()
  } catch (c) {
    a(Error("JSON parsing error!"))
  }
}

function showUsage() {
  help.display(processName, appdata.getConfig(!0).profile)
}

function finish(a, b) {
  log.info("finish():", "err:", a);
  a ? (log.error(processName + ": " + a.toString()), cliControl.end(-1)) : (b && b.msg && console.log(b.msg), cliControl.end())
};
