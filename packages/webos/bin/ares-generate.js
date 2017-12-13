#! /usr/bin/env node
var fs = require("fs"),
  url = require("url"),
  util = require("util"),
  async = require("async"),
  path = require("path"),
  log = require("npmlog"),
  vm = require("vm"),
  shelljs = require("shelljs"),
  mkdirp = require("mkdirp"),
  nopt = require("nopt"),
  inquirer = require("inquirer"),
  table = require("easy-table"),
  sprintf = require("sprintf-js").sprintf,
  chardet = require("chardet"),
  encoding = require("encoding"),
  stripbom = require("strip-bom"),
  generateLib = require("./../lib/generate"),
  commonTools = require("./../lib/common-tools"),
  errMsgHndl = require("./../lib/error-handler");
shelljs.config.fatal = !0;
var cliControl = commonTools.cliControl,
  version = commonTools.version,
  help = commonTools.help,
  errMsg = commonTools.errMsg,
  appdata = commonTools.appdata,
  processName = path.basename(process.argv[1]).replace(/.js/, "");
process.on("uncaughtException", function(c) {
  log.error("*** " + processName + ": " + c.toString());
  log.info("uncaughtException", c.stack);
  cliControl.end(-1)
});
2 === process.argv.length && process.argv.splice(2, 0, "--help");
var TMPL_TYPES = ["Web App", "Native App", "JS Service", "Native Service"],
  TMPL_TYPES_MAP = {
    template: 0,
    "web app": 0,
    webapp: 0,
    "native app": 1,
    nativeapp: 1,
    "js service": 2,
    jsservice: 2,
    webosservice: 2,
    nativeservice: 3,
    "native service": 3
  },
  DEF_BP_VER = "2.6",
  defaultAppInfo = appdata.getConfig(!0).defaultAppInfo,
  update = !0,
  idx;
(-1 !== (idx = process.argv.indexOf("--list")) || -1 !== (idx = process.argv.indexOf("-l"))) && process.argv[idx + 1] && process.argv[idx + 1].toString().match(/^-/) && process.argv.splice(idx + 1, 0, "true");
var knownOpts = {
    help: Boolean,
    version: Boolean,
    list: String,
    overwrite: Boolean,
    servicename: String,
    template: [String, Array],
    property: [String, Array],
    onDevice: String,
    "defult-enyo": String,
    initialize: Boolean,
    "no-query": Boolean,
    "library-version": String,
    tag: String,
    "hidden-help": Boolean,
    level: "silly verbose info http warn error".split(" ")
  },
  shortHands = {
    h: "--help",
    V: "--version",
    l: "--list",
    f: "--overwrite",
    t: "--template",
    p: "--property",
    s: "--servicename",
    D: "--onDevice",
    de: "--default-enyo",
    lv: "--library-version",
    nq: "--no-query",
    hh: ["--hidden-help"],
    v: ["--level", "verbose"]
  },
  argv = nopt(knownOpts, shortHands, process.argv, 2);
log.heading = processName;
log.level = argv.level || "warn";
if (argv.help || argv["hidden-help"]) showUsage(argv["hidden-help"]), cliControl.end();
var op;
argv.close ? op = close : argv.version ? version.showVersionAndExit() : op = argv.list ? list : argv.initialize ? initialize : generate;
var options = {
  overwrite: argv.overwrite,
  tmplNames: argv.template || [],
  listType: argv.list,
  appInfoProps: argv.property || [],
  svcName: argv.servicename,
  version: argv["library-version"],
  bpVer: argv.onDevice,
  defBpVer: argv["default-enyo"],
  tag: argv.tag,
  query: argv.hasOwnProperty("query") ? argv.query : !0,
  dstPath: argv.argv.remain[0]
};
op && version.checkNodeVersion(function(c) {
  async.series([op.bind(this)], finish)
});

function showUsage(c) {
  c ? help.display(processName, appdata.getConfig(!0).profile, c) : help.display(processName, appdata.getConfig(!0).profile)
}

function initialize() {
  log.info("initialize");
  finish(null, {
    msg: "Success"
  })
}

function list() {
  log.info("list");
  var c = new table,
    d = TMPL_TYPES,
    e = TMPL_TYPES_MAP,
    b = function(a) {
      var b = a.isDefault ? "(default) " : "";
      c.cell("ID", a.id);
      e.hasOwnProperty(a.type.toLowerCase()) ? c.cell("Project Type", e[a.type.toLowerCase()], function(a, b) {
        return d[a]
      }) : c.cell("Project Type", a.type);
      if (a.version && 0 < a.version.length) {
        var f = "(";
        for (index in a.version) f = 0 != index ? f + ", " + a.version[index] : f + "[" + a.version[index] + "]";
        c.cell("Version", f + ")")
      } else c.cell("Version", "-");
      c.cell("Description", b + a.description);
      c.newRow()
    };
  async.waterfall([generateLib.setTemplatesList.bind(generateLib), generateLib.getTemplatesList.bind(generateLib), function(a, g) {
    var f = options.listType,
      h = {
        true: "web app;native app;js service;native service;icon;appinfo".split(";"),
        template: ["web app"],
        webapp: ["web app"],
        nativeapp: ["native app"],
        webosservice: ["JS service"],
        jsservice: ["JS service"],
        nativeservice: ["native service"],
        web: ["web app", "JS service"],
        native: ["native app", "native service"],
        app: ["web app", "native app"],
        service: ["JS service",
          "native service"
        ],
        image: ["icon"]
      },
      f = f.toLowerCase();
    h.hasOwnProperty(f) && (f = h[f]);
    a.forEach(function(a) {
      if (a.hasOwnProperty("type")) {
        var c = e.hasOwnProperty(a.type.toLowerCase()) ? d[e[a.type.toLowerCase()]].toLowerCase() : a.type.toLowerCase();
        if (Array.isArray(f))
          for (index in f) {
            if (c === f[index].toLowerCase()) {
              b(a);
              break
            }
          } else -1 !== c.indexOf(f.toLowerCase()) && b(a)
      }
    });
    commonTools.appdata.compareProfileSync("signage") ? c.sort(["Project Type", "Description", "ID"]) : c.sort(["Project Type", "ID"]);
    console.log(c.print());
    setImmediate(g)
  }.bind(this)], function(a) {
    finish(a)
  })
}

function generate() {
  log.info("generate");
  var c = this;
  c.tmpls = [];
  c.svcs = [];
  async.waterfall([generateLib.setTemplatesList.bind(generateLib), generateLib.getTemplatesList.bind(generateLib), function(d, e) {
    var b = options.dstPath ? path.resolve(options.dstPath) : "";
    async.series([function(a) {
      if (0 === options.tmplNames.length)
        for (index in d)
          if (d[index].isDefault) {
            options.tmplNames.push(d[index].id);
            break
          }
      options.tmplNames && options.tmplNames.forEach(function(b) {
        var f = generateLib.getTemplatesBy("id", b)[0];
        if (!f) return a(Error("Please check the template name"));
        f.hasOwnProperty("type") && (f.type.match(/app$|appinfo$/gi) ? c.tmpls.push(b) : f.type.match(/service$/gi) && c.svcs.push(b), f.type.match(/appinfo/i) || f.type.match(/icon/i)) && (options.overwrite = !0)
      });
      setImmediate(a)
    }.bind(c), function(a) {
      if (options.tmplNames && !b) return a(Error("Pleaes specify a directory name or path to generate."));
      if (b && fs.existsSync(b) && !options.overwrite) {
        if (0 < fs.readdirSync(b).length) return a(Error(b + " is not empty, please check the directory."));
        options.overwrite = !0
      }
      options.dstPath =
        b;
      setImmediate(a)
    }.bind(c), function(a) {
      var e = !1;
      0 < svcs.length && (0 < tmpls.length || fs.existsSync(path.join(b, "appinfo.json"))) && (e = !0);
      async.series([function(a) {
        e ? async.forEachSeries(d, function(a, b) {
          -1 !== svcs.indexOf(a.id) && (a.files[0].at = "services/" + a.id);
          b()
        }, function(b) {
          setImmediate(a, b)
        }) : setImmediate(a)
      }.bind(c)], function(b) {
        setImmediate(a, b)
      })
    }.bind(c), function(a) {
      var b = generateLib.getTemplatesBy("id", options.tmplNames[0])[0];
      if (options.version) {
        if (!b.version) return a(Error("The template '" + b.id +
          "' does not support '-lv', '--library-version' option."));
        if (-1 == b.version.indexOf(options.version)) return a(Error("Invalid template version!"))
      } else Array.isArray(b.version) ? options.version = b.version[0] : options.version = b.version;
      setImmediate(a)
    }.bind(c)], function(a) {
      setImmediate(e, a)
    })
  }.bind(c), function(c, e) {
    if (c.overwrite) {
      var b = path.join(c.dstPath, "appinfo.json");
      if (fs.existsSync(b)) {
        var b = fs.readFileSync(b),
          a = chardet.detect(new Buffer(b)); - 1 === ["UTF-8", "ISO-8895-1"].indexOf(a) && (log.verbose("Current Encoding Type>> " +
          a + "<<"), b = encoding.convert(b, "UTF-8", a));
        b = stripbom(b);
        try {
          this.appinfo = JSON.parse(b)
        } catch (g) {
          update = !1
        }
        update && (defaultAppInfo.id = this.appinfo.id || defaultAppInfo.id, defaultAppInfo.version = this.appinfo.version || defaultAppInfo.version, defaultAppInfo.type = this.appinfo.type || defaultAppInfo.type, defaultAppInfo.main[defaultAppInfo.type] = this.appinfo.main || defaultAppInfo.main[defaultAppInfo.type], defaultAppInfo.title = this.appinfo.title || defaultAppInfo.title)
      } else update = !1
    }
    e()
  }.bind(c, options), function(d,
    e) {
    var b;
    if (!d.query) return e();
    for (i = 0; i < c.tmpls.length && !(b = generateLib.getTemplatesBy("id", c.tmpls[i])[0]); i++);
    "undefined" !== typeof b && 0 == d.appInfoProps.length ? inquirer.prompt([{
      type: "input",
      name: "id",
      message: "app id:",
      default: function() {
        return defaultAppInfo.id
      },
      validate: function(a) {
        var b = this.async();
        a.match(/^[a-z0-9.+-]*$/) ? b(!0) : b(errMsgHndl.changeErrMsg("INVALID_APPID"))
      }
    }, {
      type: "input",
      name: "title",
      message: "title:",
      default: function() {
        return defaultAppInfo.title
      }
    }, {
      type: "input",
      name: "main",
      message: "main:",
      default: function(a) {
        a.type = defaultAppInfo.type;
        if (b.type.match(/native/i) || b.id.match(/nativeappinfo/i)) a.type = defaultAppInfo.type = "native";
        return defaultAppInfo.main[defaultAppInfo.type]
      }
    }, {
      type: "input",
      name: "version",
      message: "version:",
      default: function() {
        return defaultAppInfo.version
      }
    }], function(a) {
      d.appInfoProps.push("id=" + a.id);
      d.appInfoProps.push("title=" + a.title);
      d.appInfoProps.push("type=" + a.type);
      d.appInfoProps.push("main=" + a.main);
      d.executable = a.main;
      d.appInfoProps.push("version=" +
        a.version);
      e()
    }) : e()
  }.bind(c, options), function(d, e) {
    var b;
    if (!d.query) return e();
    for (i = 0; i < c.svcs.length; i++)
      if (b = generateLib.getTemplatesBy("id", c.svcs[i])[0]) {
        b.type = b.type.toLowerCase();
        break
      }
      "undefined" === typeof b || d.svcName ? e() : inquirer.prompt([{
        type: "input",
        name: "id",
        message: "service id:",
        default: function() {
          return defaultAppInfo.id + ".service"
        }
      }, {
        type: "input",
        name: "executable",
        message: "executable file name:",
        default: function() {
          return defaultAppInfo.main["native"]
        },
        when: function(a) {
          return b.type.match(/native/i)
        }
      }],
      function(a) {
        d.svcName = a.id;
        d.executable = a.executable;
        e()
      })
  }.bind(c, options), _substParams.bind(c), function(c, e, b) {
    log.silly("_genApp#substitutions:", e);
    console.log("Generating " + c.tmplNames.join(",") + " in " + path.resolve(c.dstPath));
    generateLib.generate(c, e, b)
  }.bind(c, options)], function(c) {
    finish(c, {
      msg: "Success"
    })
  })
}

function finish(c, d) {
  log.info("finish():", "err:", c);
  c ? (log.error(processName + ": " + c.toString()), log.verbose(c.stack), cliControl.end(-1)) : (d && d.msg && console.log(d.msg), cliControl.end())
}

function _substParams(c) {
  log.info("_substitution");
  var d = [];
  async.series([function(c) {
    var b = {
        fileRegexp: "appinfo.json"
      },
      a = {};
    options.overwrite && update && (a = this.appinfo);
    options.appInfoProps.forEach(function(b) {
      var c;
      c = b;
      var d = /^['|"](.)*['|"]$/;
      d.test(c) && (c = c.substring(1, b.length - 1));
      d = /^{(.)*}$/;
      c = d.test(c) ? -1 === c.indexOf('"') ? c.replace(/\s*"/g, "").replace(/\s*'/g, "").replace("{", '{"').replace("}", '"}').replace(/\s*,\s*/g, '","').replace(/\s*:\s*/g, '":"') : c.replace(/\s*'/g, '"') : b;
      a: {
        try {
          JSON.parse(c)
        } catch (e) {
          d = !1;
          break a
        }
        d = !0
      }
      d ? a = JSON.parse(c) : (c = a, b = b.split("="), 2 == b.length && (c[b[0]] = b[1], log.info("Inserting property " + b[0] + " = " + b[1])))
    });
    for (p in defaultAppInfo) "string" !== typeof defaultAppInfo[p] || a.hasOwnProperty(p) || (a[p] = defaultAppInfo[p], log.verbose("_subAppInfo()", "set default value:", p + " : " + defaultAppInfo[p]));
    if (a.id && !/^[a-z0-9.+-]*$/.test(a.id)) return log.error("Invalid app id: " + a.id), setImmediate(c, errMsgHndl.changeErrMsg("INVALID_APPID"));
    a.main && (options.executable = a.main);
    b.json = a;
    b.add = {};
    for (key in a) b.add[key] = !0;
    d.push(b);
    setImmediate(c)
  }.bind(this), function(c) {
    var b = {
      fileRegexp: "\\.(js|json|c|cpp|cc|css|less|mm|h|hpp|hh|html|htm|md|txt|sh|bat|cmd|xml|dtd|php|java|rb|py)$"
    };
    b.regexp = {
      "@ENYO-VERSION@": options.version || DEF_BP_VER,
      "@SERVICE-NAME@": options.svcName || defaultAppInfo.id + ".service",
      "@EXECUTABLE-NAME@": options.executable || defaultAppInfo.main["native"]
    };
    d.push(b);
    setImmediate(c)
  }.bind(this)], function(e) {
    setImmediate(c, e, d)
  })
}

function _genConfigFile(c, d) {
  var e = c.profile || options.profileConfig,
    b = c.type || options.projectTypeConfig,
    a = c.subtype || "",
    g = -1 != b.indexOf("Native") || -1 != b.indexOf("native") ? "native" : "web",
    b = -1 != b.indexOf("Service") || -1 != b.indexOf("service") ? "service" : "app",
    e = {
      profile: [e.toLowerCase()],
      src_type: g,
      prj_type: b
    };
  "" != a && (e.subtype = a);
  fs.writeFile(path.join(options.dstPath, ".webosproject.json"), JSON.stringify(e, null, "\t"), function(a) {
    if (a) return d(Error("Project Config Creation Error!"));
    d()
  })
};
