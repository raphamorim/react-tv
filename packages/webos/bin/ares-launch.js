#! /usr/bin/env node
var fs = require("fs"),
  path = require("path"),
  async = require("async"),
  log = require("npmlog"),
  nopt = require("nopt"),
  launchLib = require("./../lib/launch"),
  commonTools = require("./../lib/common-tools"),
  version = commonTools.version,
  cliControl = commonTools.cliControl,
  help = commonTools.help,
  setupDevice = commonTools.setupDevice,
  appdata = commonTools.appdata,
  processName = path.basename(process.argv[1]).replace(/.js/, "");
process.on("uncaughtException", function(a) {
  log.error("uncaughtException", a.toString());
  cliControl.end(-1)
});
2 === process.argv.length && process.argv.splice(2, 0, "--help");
var knownOpts = {
    device: [String, null],
    inspect: Boolean,
    open: Boolean,
    "device-list": Boolean,
    close: Boolean,
    hosted: Boolean,
    running: Boolean,
    params: [String, Array],
    "host-port": [String, null],
    version: Boolean,
    help: Boolean,
    "hidden-help": Boolean,
    level: "silly verbose info http warn error".split(" ")
  },
  shortHands = {
    d: ["--device"],
    i: ["--inspect"],
    o: ["--open"],
    D: ["--device-list"],
    c: ["--close"],
    r: ["--running"],
    p: ["--params"],
    P: ["--host-port"],
    V: ["--version"],
    h: ["--help"],
    hh: ["--hidden-help"],
    H: ["--hosted"],
    v: ["--level",
      "verbose"
    ]
  },
  argv = nopt(knownOpts, shortHands, process.argv, 2);
log.heading = processName;
log.level = argv.level || "warn";
launchLib.log.level = log.level;
if (argv.help || argv["hidden-help"]) showUsage(argv["hidden-help"]), cliControl.end();
log.verbose("argv", argv);
var installMode = "Installed",
  hostedurl = "",
  params = {};
argv.hosted && (installMode = "Hosted");
var op;
argv.close ? op = close : argv.running ? op = running : argv["device-list"] ? setupDevice.showDeviceListAndExit() : argv.version ? version.showVersionAndExit() : op = argv.hosted ? launchHostedApp : launch;
var options = {
  device: argv.device,
  inspect: argv.open || argv.inspect,
  open: argv.open,
  installMode: installMode,
  hostPort: argv["host-port"]
};
if (1 < argv.argv.remain.length) return finish("Please check arguments");
var appId = argv.argv.remain[0];
op && version.checkNodeVersion(function(a) {
  async.series([op.bind(this)], finish)
});

function showUsage(a) {
  a ? help.display(processName, appdata.getConfig(!0).profile, a) : help.display(processName, appdata.getConfig(!0).profile)
}

function launch() {
  var a = appId;
  params = getParams();
  log.info("launch():", "pkgId:", a);
  a || (showUsage(), cliControl.end(-1));
  launchLib.launch(options, a, params, finish)
}

function launchHostedApp() {
  var a = fs.realpathSync(appId);
  options.hostedurl = a;
  params = getParams();
  log.info("launch():", "pkgId:", "com.sdk.ares.hostedapp");
  launchLib.launch(options, "com.sdk.ares.hostedapp", params, finish)
}

function getParams() {
  var a = {};
  argv.params && argv.params.forEach(function(b) {
    var c;
    c = refineJsonString(b);
    isJson(c) ? a = JSON.parse(c) : insertParams(a, b)
  });
  return a
}

function refineJsonString(a) {
  var b = a,
    c = /^['|"](.)*['|"]$/;
  c.test(b) && (b = b.substring(1, a.length - 1));
  c = /^{(.)*}$/;
  return c.test(b) ? -1 === b.indexOf('"') ? b.replace(/\s*"/g, "").replace(/\s*'/g, "").replace("{", '{"').replace("}", '"}').replace(/\s*,\s*/g, '","').replace(/\s*:\s*/g, '":"') : b.replace(/\s*'/g, '"') : a
}

function isJson(a) {
  try {
    JSON.parse(a)
  } catch (b) {
    return !1
  }
  return !0
}

function close() {
  var a = appId;
  log.info("close():", "pkgId:", a);
  a || (showUsage(), cliControl.end(-1));
  launchLib.close(options, a, params, finish)
}

function running() {
  launchLib.listRunningApp(options, null, function(a, b) {
    var c = "",
      d = 0;
    b instanceof Array && b.forEach(function(a) {
      0 !== d++ && (c = c.concat("\n"));
      c = c.concat(a.id)
    });
    console.log(c);
    finish(a)
  })
}

function finish(a, b) {
  log.info("finish():", "err:", a);
  a ? (log.error(processName + ": " + a.toString()), log.verbose(a.stack), cliControl.end(-1)) : (b && b.msg && console.log(b.msg), cliControl.end())
}

function insertParams(a, b) {
  var c = b.split("=");
  2 == c.length && (a[c[0]] = c[1], log.info("Inserting params " + c[0] + " = " + c[1]))
}
process.on("uncaughtException", function(a) {
  console.log("Caught exception: " + a)
});
