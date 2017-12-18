#! /usr/bin/env node
module.exports = function(pathToPack) {
  var fs = require("fs"),
    util = require("util"),
    path = require("path"),
    async = require("async"),
    log = require("npmlog"),
    mkdir = require("mkdirp"),
    packageLib = require("./../lib/package"),
    commonTools = require("./../lib/common-tools"),
    cliControl = commonTools.cliControl,
    version = commonTools.version,
    help = commonTools.help,
    errMsg = commonTools.errMsg,
    appdata = commonTools.appdata,
    processName = path.basename(pathToPack).replace(/.js/, "");
  process.on("uncaughtException", function(a) {
    log.error("*** " + processName + ": " + a.toString());
    log.info("uncaughtException", a.stack);
    cliControl.end(-1)
  });
  2 === process.argv.length && process.argv.splice(2, 0, "--help");

  function PalmPackage() {
    this.destination = ".";
    this.options = {};
    var a = {
      help: Boolean,
      "hidden-help": Boolean,
      version: Boolean,
      level: "silly verbose info http warn error".split(" "),
      outdir: path,
      check: Boolean,
      "no-minify": Boolean,
      "app-exclude": [String, Array],
      rom: Boolean,
      deployscript: String,
      "deploy-lib": String,
      "deploy-srcroot": String,
      "override-appinfo": String,
      force: Boolean,
      pkgname: String,
      pkgversion: String
    };
    this.argv = require("nopt")(a, {
      h: "--help",
      hh: "--hidden-help",
      V: "--version",
      o: "--outdir",
      c: "--check",
      n: "--no-minify",
      e: "--app-exclude",
      r: "--rom",
      d: "--deployscript",
      de: "--deploy-enyo",
      dl: "--deploy-lib",
      ds: "--deploy-srcroot",
      oi: "--override-appinfo",
      f: "--force",
      pn: "--pkgname",
      pv: "--pkgversion",
      v: ["--level", "verbose"]
    }, process.argv, 2);
    this.hiddenhelpString = ["", "EXTRA-OPTION", help.format("-f, --force", "Make .ipk package forcibly with same file structure in APP_DIR"), help.format("", "If file/directories in APP_DIR consists of the following structure"), help.format("\t (ex) APP_DIR/"), help.format("\t           +-- usr/"),
      help.format("\t           +-- usr/bin"), help.format("\t           +-- usr/bin/foo"), help.format("\t           +-- etc/"), help.format("\t           +-- etc/boo.conf"), help.format("", "'-f, --force' option will keep this structure in .ipk"), "", help.format("-pn, --pkgname <NAME>", "Set package name"), help.format("-pv, --pkgversion <VERSION>", "Set package version"), "EXAMPLES", "", "# Create a package although directory has no appinfo.json and no services.json", "  make a ipk file which of package name is 'foopkg' and package version is '1.0.1'",
      "  the following command should generate a foopkg_1.0.1.ipk", processName + " APP_DIR -f -pn foopkg -pv 1.0.1", ""
    ];
    log.heading = processName;
    log.level = this.argv.level || "warn"
  }
  PalmPackage.prototype = {
    unsupportedOptions: {
      noclean: 1,
      force: 1,
      pkgname: 1,
      pkgversion: 1
    },
    showUsage: function(a, b) {
      void 0 === b && (b = 0);
      a ? help.display(processName, appdata.getConfig(!0).profile, a) : help.display(processName, appdata.getConfig(!0).profile);
      cliControl.end(b)
    },
    checkAndShowHelp: function() {
      this.argv.help ? this.showUsage(!1, 0) : this.argv["hidden-help"] && this.showUsage(!0, 0)
    },
    handleOptions: function() {
      this.options.level = log.level;
      for (var a in this.argv) this.unsupportedOptions[a] && (this.options[a] = this.argv[a]);
      this.argv.hasOwnProperty("minify") ? this.options.minify = this.argv.minify : this.options.minify = !0;
      if (this.argv.hasOwnProperty("app-exclude")) {
        for (var b in this.argv) "appinfo.json" == this.argv[b] && (console.log("You cannot exclude appinfo.json file"), cliControl.end());
        this.options.excludefiles = this.argv["app-exclude"]
      }
      this.argv.hasOwnProperty("rom") ? this.options.rom = this.argv.rom : this.options.rom = !1;
      this.argv.hasOwnProperty("deployscript") && (this.options.deployscript = this.argv.deployscript);
      this.argv.hasOwnProperty("deploy-enyo") &&
        (this.options["deploy-enyo"] = this.argv["deploy-enyo"]);
      this.argv.hasOwnProperty("deploy-lib") && (this.options["deploy-lib"] = this.argv["deploy-lib"]);
      this.argv.hasOwnProperty("deploy-srcroot") && (this.options["deploy-srcroot"] = this.argv["deploy-srcroot"]);
      this.argv.hasOwnProperty("override-appinfo") && (this.options["override-appinfo"] = this.argv["override-appinfo"])
    },
    exitOnError: function(a) {
      log.error("*** " + processName + ": " + a);
      cliControl.end(-1)
    },
    packageReady: function(a, b) {
      log.info("projectReady");
      a ? (log.error("*** " +
        processName + ": " + a.toString()), log.verbose(a.stack), cliControl.end(-1)) : (b && b[b.length - 1] && b[b.length - 1].msg && console.log(b[b.length - 1].msg), cliControl.end())
    },
    appOk: function(a, b) {
      log.info("appOk");
      a ? (log.error("*** " + processName + ": " + a.toString()), cliControl.end(-1)) : (console.log("no problems detected"), cliControl.end())
    },
    setOutputDir: function(a) {
      log.info("setOutputDir");
      this.argv.outdir && (this.destination = this.argv.outdir);
      "." === this.destination && (this.destination = process.cwd());
      fs.existsSync(this.destination) ?
        fs.statSync(this.destination).isDirectory() || this.exitOnError("'" + this.destination + "' is not a directory") : (log.verbose("creating directory '" + this.destination + "' ..."), mkdirp.sync(this.destination));
      this.destination = fs.realpathSync(this.destination);
      a()
    },
    checkInputDir: function(a) {
      log.info("checkInputDir");
      (new packageLib.Packager(this.options)).checkInputDirectories(this.argv.argv.remain, this.options, a)
    },
    packageApp: function(a) {
      log.info("packageApp");
      (new packageLib.Packager(this.options)).generatePackage(this.argv.argv.remain,
        this.destination, this.options, a)
    },
    packageProject: function() {
      async.series([version.checkNodeVersion, this.setOutputDir.bind(this), this.checkInputDir.bind(this), this.packageApp.bind(this)], this.packageReady.bind(this))
    },
    checkApplication: function() {
      async.series([version.checkNodeVersion, this.checkInputDir.bind(this)], this.appOk.bind(this))
    },
    exec: function() {
      this.handleOptions();
      this.checkAndShowHelp();
      this.argv.check ? this.checkApplication() : this.argv.version ? version.showVersionAndExit() : this.packageProject()
    }
  };
  var cmd = new PalmPackage;
  cmd.exec();
}
