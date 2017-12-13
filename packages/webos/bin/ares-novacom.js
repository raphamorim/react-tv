#! /usr/bin/env node
var fs = require("fs"),
  path = require("path"),
  log = require("npmlog"),
  nopt = require("nopt"),
  async = require("async"),
  sprintf = require("sprintf-js").sprintf,
  novacom = require("./../lib/novacom"),
  commonTools = require("./../lib/common-tools"),
  version = commonTools.version,
  cliControl = commonTools.cliControl,
  help = commonTools.help,
  setupDevice = commonTools.setupDevice,
  appdata = commonTools.appdata,
  processName = path.basename(process.argv[1]).replace(/.js/, "");
process.on("uncaughtException", function(a) {
  log.info("exit", a);
  log.error("exit", a.toString());
  cliControl.end(-1)
});
2 === process.argv.length && process.argv.splice(2, 0, "--help");
var processName = path.basename(process.argv[1]).replace(/.js/, ""),
  knownOpts = {
    help: Boolean,
    "hidden-help": Boolean,
    level: "silly verbose info http warn error".split(" "),
    version: Boolean,
    list: Boolean,
    "device-list": Boolean,
    forward: Boolean,
    port: [String, Array],
    getkey: Boolean,
    passphrase: [String, null],
    device: [String, null],
    run: [String, null],
    put: [String, null],
    get: [String, null]
  },
  shortHands = {
    h: ["--help"],
    hh: ["--hidden-help"],
    v: ["--level", "verbose"],
    V: ["--version"],
    l: ["--list"],
    D: ["--device-list"],
    f: ["--forward"],
    p: ["--port"],
    k: ["--getkey"],
    pass: ["--passphrase"],
    d: ["--device"],
    r: ["--run"]
  },
  hiddenhelpString = ["", "EXTRA-OPTION", help.format(processName + " [OPTION...] -pass, --passphrase PASSPHRASE"), "EXAMPLES", "", "# Get ssh key and set passphrase value in the device info", processName + " <PACKAGE_FILE> -d <DEVICE> --getkey --passphrase ABCDEF", ""],
  argv = nopt(knownOpts, shortHands, process.argv, 2);
log.heading = processName;
log.level = argv.level || "warn";
log.verbose("argv", argv);
var op;
if (argv.list || argv["device-list"]) setupDevice.showDeviceListAndExit();
else if (argv.getkey) op = getkey;
else if (argv.put) op = put;
else if (argv.get) op = get;
else if (argv.run) op = run;
else if (argv.forward) op = forward;
else if (argv.version) version.showVersionAndExit();
else {
  if (argv.help || argv["hidden-help"]) argv["hidden-help"] ? help.display(processName, appdata.getConfig(!0).profile, !0) : help.display(processName, appdata.getConfig(!0).profile, !1);
  cliControl.end()
}
var options = {
  name: argv.device
};
op && version.checkNodeVersion(function(a) {
  async.series([op.bind(this)], finish)
});

function list(a) {
  var b = new novacom.Resolver;
  async.waterfall([b.load.bind(b), b.list.bind(b), function(a, b) {
      log.info("list()", "devices:", a);
      Array.isArray(a) && (console.log(sprintf("%-16s %-16s %-16s %-16s %s", "<DEVICE NAME>", "<PASSWORD>", "<PRIVATE KEY>", "<PASSPHRASE>", "<SSH ADDRESS>")), a.forEach(function(a) {
        console.log(sprintf("%-16s %-16s %-16s %-16s (%s)", a.name, a.password || "'No Password'", a.privateKeyName || "'No Ssh Key'", a.passphrase || "'No passphrase'", a.addr))
      }));
      log.info("list()", "Success");
      b()
    }],
    a)
}

function getkey(a) {
  var b = new novacom.Resolver;
  async.waterfall([b.load.bind(b), b.getSshPrvKey.bind(b, options), function(a, b) {
    if (a) {
      if (argv.passphrase) return b(null, a, argv.passphrase);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      process.stdout.write("input passphrase [default: webos]:");
      process.stdin.on("data", function(c) {
        c = c.toString().trim();
        "" === c && (c = "webos");
        log.info("registed passphrase is ", c);
        b(null, a, c)
      })
    } else return b(Error("Error getting key file from the device"))
  }, function(a, b,
    c) {
    var d = {};
    d.name = options.name;
    d.privateKey = {
      openSsh: a
    };
    d.passphrase = b;
    d.files = "sftp";
    d.port = "9922";
    d.username = "prisoner";
    d.password = "@DELETE@";
    c(null, d)
  }, b.modifyDeviceFile.bind(b, "modify")], function(b) {
    if (b) return a(b);
    a(null, {
      msg: "Success"
    })
  })
}

function put(a) {
  a(Error("Not yet implemented"))
}

function get(a) {
  a(Error("Not yet implemented"))
}

function run(a) {
  var b = new novacom.Session(options, function(e, f) {
    log.verbose("run()", "argv:", argv.run);
    log.verbose("run()", "options:", options);
    e ? a(e) : b.run(argv.run, process.stdin, process.stdout, process.stderr, a)
  })
}

function forward(a) {
  log.info("forward", "ports:", argv.port);
  if (argv.port && "true" !== argv.port.toString()) {
    var b = [function(a) {
      options.session = new novacom.Session(options, a)
    }];
    try {
      argv.port.forEach(function(a) {
        a = a.split(":");
        var c, d;
        c = parseInt(a[0], 10);
        d = parseInt(a[1], 10) || c;
        b.push(function(a) {
          options.session.forward(c, d, a)
        });
        b.push(function(a) {
          log.info("forward", "running...")
        })
      })
    } catch (e) {
      a(e);
      return
    }
    async.series(b, a)
  } else a(Error("forward option needs port value to forward via '--port, -p DEVICE_PORT:HOST_PORT'"))
}

function finish(a, b) {
  log.info("finish():", "err:", a);
  a ? (log.error(processName + ": " + a.toString()), log.verbose(a.stack), cliControl.end(-1)) : (log.info("finish():", b), b && b.msg && console.log(b.msg), cliControl.end())
}
process.on("uncaughtException", function(a) {
  console.log("Caught exception: " + a)
});
