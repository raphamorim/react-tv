#! /usr/bin/env node
module.exports = function aresSetupDevice() {
  var fs = require("fs"),
    path = require("path"),
    log = require("npmlog"),
    nopt = require("nopt"),
    async = require("async"),
    Table = require("easy-table"),
    inquirer = require("inquirer"),
    novacom = require("./../lib/novacom"),
    commonTools = require("./../lib/common-tools"),
    version = commonTools.version,
    cliControl = commonTools.cliControl,
    help = commonTools.help,
    appdata = commonTools.appdata,
    setupDevice = commonTools.setupDevice,
    processName = path.basename(process.argv[1]).replace(/.js/, "");
  process.on("uncaughtException", function(a) {
    log.info("exit", a);
    log.error("exit", a.toString());
    cliControl.end(-1)
  });
  var knownOpts = {
      help: Boolean,
      level: "silly verbose info http warn error".split(" "),
      version: Boolean,
      list: Boolean,
      listfull: Boolean,
      add: [String, null],
      remove: [String, null],
      modify: [String, null],
      info: [String, Array],
      reset: Boolean
    },
    shortHands = {
      h: ["--help"],
      v: ["--level", "verbose"],
      V: ["--version"],
      l: ["--list"],
      F: ["--listfull"],
      i: ["--info"],
      a: ["--add"],
      r: ["--remove"],
      m: ["--modify"],
      R: ["--reset"]
    },
    argv = nopt(knownOpts, shortHands, process.argv, 2);
  log.heading = processName;
  log.level = argv.level || "warn";
  log.verbose("argv", argv);
  var op;
  argv.list ? setupDevice.showDeviceListAndExit() : argv.listfull ? setupDevice.showDeviceListAndExit("full") : argv.reset ? op = reset : argv.add || argv.modify || argv.info ? op = modifyDeviceInfo : argv.remove ? op = removeDeviceInfo : argv.version ? version.showVersionAndExit() : argv.help ? (help.display(processName, appdata.getConfig(!0).profile), cliControl.end()) : op = interactiveInput;
  var options = {
    name: argv.device
  };
  op && version.checkNodeVersion(function(a) {
    async.series([op.bind(this)], finish)
  });
  var defaultDeviceInfo = {
      profile: appdata.getConfig(!0).profile,
      type: "starfish",
      host: "127.0.0.1",
      port: 22,
      username: "root",
      description: "new device description",
      files: "stream"
    },
    requiredKeys = {
      name: !1,
      type: !1,
      host: !0,
      port: !0,
      username: !0,
      description: !0,
      files: !1,
      privateKeyName: !0,
      passphrase: !0,
      password: !0
    },
    questions = [];

  function reset(a) {
    var c = path.join(appdata.getPath(), "novacom-devices.json");
    async.series([function(b) {
      fs.existsSync(c) ? fs.unlink(c, b) : b()
    }, setupDevice.showDeviceList.bind(this)], function(b) {
      a(b)
    })
  }

  function replaceDefaultDeviceInfo(a) {
    a && (a.profile = a.profile || defaultDeviceInfo.profile, a.type = a.type || defaultDeviceInfo.type, a.host = a.host || defaultDeviceInfo.host, a.port = a.port || defaultDeviceInfo.port, a.username = a.username || defaultDeviceInfo.username, a.files = a.files || defaultDeviceInfo.files, a.description = a.description || defaultDeviceInfo.description)
  }

  function refineJsonString(a) {
    var c = a,
      b = /^['|"](.)*['|"]$/;
    b.test(c) && (c = c.substring(1, a.length - 1));
    b = /^{(.)*}$/;
    return b.test(c) ? -1 === c.indexOf('"') ? c.replace(/\s*"/g, "").replace(/\s*'/g, "").replace("{", '{"').replace("}", '"}').replace(/\s*,\s*/g, '","').replace(/\s*:\s*/g, '":"') : c.replace(/\s*'/g, '"') : a
  }

  function interactiveInput(a) {
    var c, b, d = new novacom.Resolver;
    async.waterfall([setupDevice.showDeviceList.bind(this), function(b) {
      console.log("** You can modify the device info in the above list, or add new device.");
      b()
    }, function(a) {
      async.waterfall([d.load.bind(d), d.list.bind(d), function(b, a) {
        a(null, b)
      }, function(a, d) {
        var g = {},
          h = ["add", "modify"],
          n = h.concat(["remove"]),
          m = a.filter(function(a) {
            return -1 === a.conn.indexOf("novacom")
          }).map(function(a) {
            return a.name
          }),
          k = function(a) {
            return function(b) {
              return -1 !==
                b.indexOf(a)
            }
          };
        questions = [{
          type: "list",
          name: "op",
          message: "Select",
          choices: n,
          filter: function(a) {
            return a.toLowerCase()
          }
        }, {
          type: "input",
          name: "device_name",
          message: "Enter Device Name:",
          when: function(a) {
            return "add" == a.op
          },
          validate: function(a) {
            var b = this.async();
            if (1 > a.length) return b("Please enter device name.");
            if (-1 !== m.indexOf(a)) return b("Device name is duplicated. Please use another name.");
            b(!0)
          }
        }, {
          type: "list",
          name: "device_name",
          message: "Select a device",
          choices: m,
          when: function(a) {
            return -1 !== ["modify",
              "remove"
            ].indexOf(a.op)
          }
        }];
        inquirer.prompt(questions, function(l) {
          c = l.op;
          b = l.device_name;
          a.forEach(function(a) {
            l.device_name === a.name && (g = a)
          });
          questions = [{
            type: "input",
            name: "ip",
            message: "Enter Device IP address:",
            default: function() {
              return g.host || "127.0.0.1"
            },
            validate: function(a) {
              var b = this.async();
              a.match(/^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/) ? b(!0) : b("Incorrect ip address!")
            },
            when: function(a) {
              return k(c)(h)
            }
          }, {
            type: "input",
            name: "port",
            message: "Enter Device Port:",
            default: function() {
              return g.port || "22"
            },
            validate: function(a) {
              var b = this.async();
              (new String(a)).match(/^[0-9]+$/) ? b(!0) : b("Incorrect port number!")
            },
            when: function(a) {
              return k(c)(h)
            }
          }, {
            type: "input",
            name: "user",
            message: "Enter ssh user:",
            default: function() {
              return g.username || "root"
            },
            when: function(a) {
              return k(c)(h)
            }
          }, {
            type: "input",
            name: "description",
            message: "Enter description:",
            default: function() {
              return g.description || "new device"
            },
            when: function(a) {
              return k(c)(h)
            }
          }, {
            type: "list",
            name: "auth_type",
            message: "Select authentification",
            choices: ["password", "ssh key"],
            default: function() {
              var a = 0;
              g.privateKeyName && (a = 1);
              return a
            },
            when: function(a) {
              return k(c)(h)
            }
          }, {
            type: "password",
            name: "password",
            message: "Enter password:",
            when: function(a) {
              return k(c)(h) && "password" == a.auth_type
            }
          }, {
            type: "input",
            name: "ssh_key",
            message: "Enter ssh private key file name:",
            default: function() {
              return g.privateKeyName || "webos_emul"
            },
            when: function(a) {
              return k(c)(h) && "ssh key" == a.auth_type
            }
          }, {
            type: "input",
            name: "ssh_passphrase",
            message: "Enter key's passphrase:",
            default: function() {
              return g.passphrase || void 0
            },
            when: function(a) {
              return k(c)(h) && "ssh key" == a.auth_type
            }
          }, {
            type: "confirm",
            name: "confirm",
            message: "Save ?",
            default: !0
          }];
          d()
        })
      }], function(b) {
        a(b)
      })
    }, function(a) {
      inquirer.prompt(questions, function(e) {
        if (e.confirm) log.info("setup-device#interactiveInput()", "Saved!");
        else return log.info("setup-device#interactiveInput()", "Canceled!"), a(null, {
          msg: "Canceled"
        });
        var f = {
          profile: appdata.getConfig(!0).profile,
          name: b,
          host: e.ip,
          port: e.port,
          description: e.description,
          username: e.user
        };
        if ("remove" !== c)
          if (e.auth_type && "password" === e.auth_type) f.password = e.password, f.privateKey = "@DELETE@", f.passphrase = "@DELETE@", f.privateKeyName = "@DELETE@";
          else if (e.auth_type && "ssh key" === e.auth_type) f.password = "@DELETE@", f.privateKey = {
          openSsh: e.ssh_key
        }, f.passphrase = e.ssh_passphrase || "@DELETE@", f.privateKeyName = "@DELETE@";
        else return a(Error("Not supported auth type (" + e.auth_type + ")"));
        replaceDefaultDeviceInfo(f);
        f.port && (f.port =
          Number(f.port));
        async.series([d.load.bind(d), d.modifyDeviceFile.bind(d, c, f), setupDevice.showDeviceList.bind()], function(b) {
          if (b) return a(b);
          a(null, {
            msg: "Success to " + c + " a device!!"
          })
        })
      })
    }], function(b, c) {
      a(b, c)
    })
  }

  function isJson(a) {
    try {
      JSON.parse(a)
    } catch (c) {
      return !1
    }
    return !0
  }

  function insertParams(a, c) {
    var b = c.split("=");
    2 == b.length && (a[b[0]] = b[1], log.info("Inserting params " + b[0] + " = " + b[1]))
  }

  function getParams(a) {
    var c = {};
    argv[a] && [].concat(argv[a]).forEach(function(a) {
      var d;
      d = refineJsonString(a);
      isJson(d) ? c = JSON.parse(d) : insertParams(c, a)
    });
    return c
  }

  function modifyDeviceInfo(a) {
    try {
      var c = argv.add ? "add" : argv.modify ? "modify" : null;
      if (!c) return a(Error("Please specify an option among '--add' and '--modify'"));
      if (argv[c].match(/^-/)) return a(Error("Please specify device name !!"));
      var b = getParams(argv.info ? "info" : c);
      if (!b.name) {
        if ("true" === argv[c]) return a(Error("Please specify device name !!"));
        b.name = argv[c]
      }
      b.privateKey && (b.privatekey = b.privateKey);
      "string" === typeof b.privatekey && (b.privateKey = b.privatekey, b.privateKey = {
          openSsh: b.privateKey
        }, delete b.privatekey,
        b.password = "@DELETE@");
      "undefined" !== typeof b.password && "@DELETE@" !== b.password && (b.privateKey = "@DELETE@", b.passphrase = "@DELETE@");
      "add" === c && (replaceDefaultDeviceInfo(b), b.privateKey || b.password || (b.password = ""));
      if (b.host && !b.host.match(/^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/)) return a(Error("Incorrect ip address!"));
      if (b.port && !(new String(b.port)).match(/^[0-9]+$/)) return a(Error("Incorrect port number!"));
      b.port && (b.port = Number(b.port));
      var d = new novacom.Resolver;
      async.series([d.load.bind(d), d.modifyDeviceFile.bind(d, c, b), setupDevice.showDeviceList.bind(this)], function(d) {
        if (d) return a(d);
        a(null, {
          msg: "Success to " + c + " a device named " + b.name + "!!"
        })
      })
    } catch (g) {
      a(g)
    }
  }

  function removeDeviceInfo(a) {
    try {
      var c = refineJsonString(argv.remove),
        b = new novacom.Resolver,
        c = {
          name: c
        };
      async.series([b.load.bind(b), b.modifyDeviceFile.bind(b, "remove", c), setupDevice.showDeviceList.bind(this)], function(b) {
        if (b) return a(b);
        a(null, {
          msg: "Success to remove a device named " + argv.remove + "!!"
        })
      })
    } catch (d) {
      a(d)
    }
  }

  function finish(a, c) {
    log.info("finish():", "err:", a);
    a ? (log.error(processName + ": " + a.toString()), log.verbose(a.stack), cliControl.end(-1)) : (log.info("finish():", c), c && c.msg && console.log(c.msg), cliControl.end())
  }
  process.on("uncaughtException", function(a) {
    console.log("Caught exception: " + a)
  });
}
