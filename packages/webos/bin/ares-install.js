#! /usr/bin/env node
var fs = require("fs"),
  path = require("path"),
  async = require("async"),
  log = require("npmlog"),
  nopt = require("nopt"),
  Table = require("easy-table"),
  sprintf = require("sprintf-js").sprintf,
  installLib = require("./../lib/install"),
  commonTools = require("./../lib/common-tools"),
  processName = path.basename(process.argv[1]).replace(/.js/, ""),
  version = commonTools.version,
  cliControl = commonTools.cliControl,
  help = commonTools.help,
  setupDevice = commonTools.setupDevice,
  appdata = commonTools.appdata;
process.on("uncaughtException", function(a) {
  log.error("uncaughtException", a.toString());
  log.info("uncaughtException", a.stack);
  cliControl.end(-1)
});
2 === process.argv.length && process.argv.splice(2, 0, "--help");
var knownOpts = {
    device: [String, null],
    "device-list": Boolean,
    list: Boolean,
    listfull: Boolean,
    type: [String, null],
    install: path,
    remove: String,
    opkg: Boolean,
    "opkg-param": [String, null],
    storage: [String, null],
    "storage-list": Boolean,
    version: Boolean,
    help: Boolean,
    "hidden-help": Boolean,
    level: "silly verbose info http warn error".split(" ")
  },
  shortHands = {
    d: ["--device"],
    i: ["--install"],
    r: ["--remove"],
    o: ["--opkg"],
    op: ["--opkg-param"],
    l: ["--list"],
    F: ["--listfull"],
    t: ["--type"],
    s: ["--storage"],
    S: ["--storage-list"],
    D: ["--device-list"],
    V: ["--version"],
    h: ["--help"],
    hh: ["--hidden-help"],
    v: ["--level", "verbose"]
  },
  argv = nopt(knownOpts, shortHands, process.argv, 2);
log.heading = processName;
log.level = argv.level || "warn";
installLib.log.level = log.level;
if (argv.help || argv["hidden-help"]) showUsage(argv["hidden-help"]), cliControl.end();
log.verbose("argv", argv);
var op;
argv.list ? op = list : argv.listfull ? op = listFull : argv.install ? op = install : argv.remove ? op = remove : argv["storage-list"] ? op = listStorage : argv["device-list"] ? setupDevice.showDeviceListAndExit() : argv.version ? version.showVersionAndExit() : op = install;
var options = {
  appId: "com.ares.defaultName",
  device: argv.device,
  opkg: argv.opkg || !1,
  opkg_param: argv["opkg-param"],
  storage: argv.storage
};
op && version.checkNodeVersion(function(a) {
  async.series([op.bind(this)], finish)
});

function showUsage(a) {
  a ? help.display(processName, appdata.getConfig(!0).profile, a) : help.display(processName, appdata.getConfig(!0).profile)
}

function install() {
  var a = argv.install || argv.argv.remain[0];
  log.info("install():", "pkgPath:", a);
  if (!a) showUsage(), cliControl.end(-1);
  else if (!fs.existsSync(path.normalize(a))) return finish(Error(a + " does not exist."));
  installLib.install(options, a, finish)
}

function list() {
  installLib.list(options, function(a, c) {
    var b = "",
      d = 0;
    c instanceof Array && c.forEach(function(a) {
      argv.type && argv.type !== a.type || (0 !== d++ && (b = b.concat("\n")), b = b.concat(a.id))
    });
    console.log(b);
    finish(a)
  })
}

function listFull() {
  installLib.list(options, function(a, c) {
    var b = "";
    c instanceof Array && c.forEach(function(a) {
      if (!argv.type || argv.type === a.type) {
        b = b.concat("----------------\n");
        b = b.concat("id:" + a.id + ", ");
        for (key in a) "id" != key && (b = b.concat(key + ":").concat(a[key]).concat(", "));
        b = b.concat("\n")
      }
    });
    process.stdout.write(b);
    finish(a)
  })
}

function listStorage() {
  var a = new Table;
  installLib.listStorage(options, function(c, b) {
    Array.isArray(b) && (log.verbose(JSON.stringify(b, null, "\t")), b.forEach(function(b) {
      a.cell("name", b.name);
      a.cell("type", b.type);
      a.cell("uri", b.uri);
      a.newRow()
    }), console.log(a.toString()));
    finish(c)
  })
}

function remove() {
  var a = "true" === argv.remove ? argv.argv.remain[0] : argv.remove;
  log.info("remove():", "pkgId:", a);
  if (!a) return finish(Error("APP_ID must be specified"));
  installLib.remove(options, a, finish)
}

function finish(a, c) {
  log.info("finish():", "err:", a);
  a ? (log.error(processName + ": " + a.toString()), log.verbose(a.stack), cliControl.end(-1)) : (log.info("finish():", c), c && c.msg && console.log(c.msg), cliControl.end())
};
