#! /usr/bin/env node
var fs = require("fs"),
  path = require("path"),
  async = require("async"),
  log = require("npmlog"),
  nopt = require("nopt"),
  inspectLib = require("./../lib/inspect"),
  commonTools = require("./../lib/common-tools"),
  cliControl = commonTools.cliControl,
  version = commonTools.version,
  help = commonTools.help,
  setupDevice = commonTools.setupDevice,
  appdata = commonTools.appdata,
  processName = path.basename(process.argv[1]).replace(/.js/, "");
2 === process.argv.length && process.argv.splice(2, 0, "--help");
var knownOpts = {
    device: [String, null],
    app: [String, null],
    service: [String, Array],
    browser: Boolean,
    "device-list": Boolean,
    open: Boolean,
    "host-port": [String, null],
    version: Boolean,
    help: Boolean,
    "hidden-help": Boolean,
    level: "silly verbose info http warn error".split(" ")
  },
  shortHands = {
    d: ["--device"],
    a: ["--app"],
    s: ["--service"],
    b: ["--browser"],
    D: ["--device-list"],
    o: ["--open"],
    P: ["--host-port"],
    D: ["--device-list"],
    V: ["--version"],
    h: ["--help"],
    hh: ["--hidden-help"],
    v: ["--level", "verbose"]
  },
  argv = nopt(knownOpts, shortHands,
    process.argv, 2);
log.heading = processName;
log.level = argv.level || "warn";
process.on("uncaughtException", function(a) {
  log.error("uncaughtException", a.stack);
  cliControl.end(-1)
});
if (argv.help || argv["hidden-help"]) showUsage(argv["hidden-help"]), cliControl.end();
log.verbose("argv", argv);
var op;
argv.version ? version.showVersionAndExit() : argv["device-list"] ? setupDevice.showDeviceListAndExit() : op = inspect;
var options = {
  device: argv.device,
  appId: argv.app || argv.argv.remain[0],
  serviceId: argv.service,
  browser: argv.browser,
  open: argv.open,
  hostPort: argv["host-port"]
};
op && version.checkNodeVersion(function(a) {
  async.series([op.bind(this)], finish)
});

function showUsage(a) {
  a ? help.display(processName, appdata.getConfig(!0).profile, a) : help.display(processName, appdata.getConfig(!0).profile)
}

function inspect() {
  log.info("inspect():", "AppId:", options.appId, "ServiceId:", options.serviceId);
  options.appId || options.serviceId || (showUsage(), cliControl.end(-1));
  async.series([inspectLib.inspect.bind(inspectLib, options, null), function(a) {}], function(a) {
    finish(a)
  })
}

function finish(a, b) {
  a ? (log.error(processName + ": " + a.toString()), log.verbose(a.stack), cliControl.end(-1)) : (b && b.msg && console.log(b.msg), cliControl.end())
}
process.on("uncaughtException", function(a) {
  console.log("Caught exception: " + a)
});
