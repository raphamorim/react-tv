var fs = require("fs"),
  path = require("path"),
  util = require("util"),
  stream = require("stream"),
  net = require("net"),
  mkdirp = require("mkdirp"),
  async = require("async"),
  log = require("npmlog"),
  ssh2 = require("ssh2"),
  shelljs = require("shelljs"),
  express = require("express"),
  http = require("http"),
  mkdirp = require("mkdirp"),
  request = require("request"),
  streamBuffers = require("stream-buffers"),
  Validator = require("jsonschema").Validator,
  server = require("./server"),
  errMsgHndl = require("./error-handler"),
  appdata = require("./cli-appdata"),
  novacomusb = require("./novacom-usb");
(function() {
  function p(a, b, c) {
    var d = null;
    if (0 !== b || c) d = Error("Command '" + a + "' exited with code=" + b + " (signal: " + c + ")"), d.code = b, d.signal = c;
    return d
  }

  function r() {
    this.devices = [];
    this.deviceFileContent = null;
    m = new appdata;
    q = m.getPath()
  }
  var n = {};
  "undefined" !== typeof module && module.exports && (module.exports = n);
  log.heading = "novacom";
  log.level = "warn";
  n.log = log;
  var l = path.resolve(process.env.HOME || process.env.USERPROFILE, ".ssh"),
    q, m;
  n.Resolver = r;
  n.Resolver.prototype = {
    load: function(a) {
      var b = this;
      log.verbose("Resolver#load()");
      async.waterfall([function(a) {
          log.verbose("Resolver#load#_replaceBuiltinSshKey()");
          var b = path.join(__dirname, "webos_emul"),
            e = path.join(l, "webos_emul");
          fs.stat(b, function(g, k) {
            g ? "ENOENT" === g.code ? setImmediate(a) : setImmediate(a, g) : fs.stat(e, function(g, h) {
              g ? "ENOENT" === g.code ? mkdirp(l, function(g) {
                shelljs.cp("-rf", b, l);
                fs.chmodSync(e, "0600");
                setImmediate(a)
              }) : setImmediate(a, g) : (k.mtime.getTime() > h.mtime.getTime() && (shelljs.cp("-rf", b, l), fs.chmodSync(e, "0600")), setImmediate(a))
            }.bind(this))
          }.bind(this))
        }.bind(b),
        function(a) {
          var d = m.getDeviceList(!0);
          Array.isArray(d) ? (log.silly("Resolver#load#_loadString()", "inDevices:", d), async.forEach(d, function(a, d) {
            async.series([b._loadOne.bind(b, a), b._addOne.bind(b, a)], d)
          }, function(d, g) {
            d ? setImmdiate(a, d) : (log.verbose("Resolver#load#_loadString()", "devices:", b.devices), setImmediate(a))
          })) : setImmediate(a, Error("Incorrect file format'"))
        }.bind(b),
        function(a) {
          log.silly("Resolver#load#_loadUSBDevice()");
          async.waterfall([novacomusb.getDeviceList.bind(novacomusb, {
              appdir: q
            }),
            function(a, c) {
              async.forEach(a, function(a, d) {
                async.series([b._loadOne.bind(b, a), b._addOne.bind(b, a)], d)
              }, c)
            }
          ], function(b, e) {
            setImmediate(a, b)
          })
        }.bind(b)
      ], function(c) {
        c ? setImmediate(a, c) : (log.info("Resolver#load()", "devices:", b.devices), setImmediate(a))
      })
    },
    _loadOne: function(a, b) {
      log.silly("Resolver#_loadOne()", "device:", a);
      "string" === typeof a.privateKey ? (a.privateKeyName = a.privateKey, a.privateKey = new Buffer(a.privateKey, "base64"), setImmediate(b)) : "object" === typeof a.privateKey && "string" === typeof a.privateKey.openSsh ?
        (a.privateKeyName = a.privateKey.openSsh, async.waterfall([fs.readFile.bind(this, path.join(l, a.privateKey.openSsh), b), function(b, d) {
          a.privateKey = b;
          setImmediate(d)
        }], function(c) {
          c && (log.verbose("Resolver#_loadOne()", "Unable to find SSH private key named '" + a.privateKey.openSsh + "' from '" + l + " for '" + a.name + "'"), a.privateKey = void 0);
          setImmediate(b)
        })) : "webospro" === typeof a.type ? setImmediate(b, Error("Not implemented: go & grab the webOS Pro private key here")) : (a.password || log.verbose("Resolver#_loadOne()",
          "Regist privateKey : need to set a SSH private key in " + l + " for'" + a.name + "'"), a.privateKeyName = void 0, a.privateKey = void 0, setImmediate(b))
    },
    _addOne: function(a, b) {
      if (!a.profile || !m.compareProfileSync(a.profile)) return setImmediate(b);
      a.display = {
        name: a.name,
        type: a.type,
        privateKeyName: a.privateKeyName,
        passphase: a.passphase,
        description: a.description,
        conn: a.conn || ["ssh"],
        devId: a.id || null
      };
      a.username && a.host && a.port && (a.display.addr = "ssh://" + a.username + "@" + a.host + ":" + a.port);
      for (var c in a) "display" !==
        c && (a.display[c] = a[c]);
      log.silly("Resolver#_addOne()", "device:", a);
      this.devices = this.devices.filter(function(b) {
        return b.name !== a.name
      });
      c = m.getCommandService();
      a.lunaSend = c[a.type].lunaSend;
      a.lunaAddr = c[a.type].lunaAddr;
      this.devices.push(a);
      setImmediate(b)
    },
    save: function(a, b) {
      function c(a, b) {
        log.verbose("Resolver#save()#_checkValidNovacomDevices()", "devices:", a);
        var d = {
            id: "test",
            type: "array",
            items: {
              $ref: "/deviceSchema"
            }
          },
          c = path.join(__dirname, "schema/NovacomDevices.schema");
        if (fs.statSync(c).isFile()) {
          var c =
            fs.readFileSync(c, "utf8"),
            h = new Validator;
          try {
            var s = JSON.parse(c);
            h.addSchema(s, "/deviceSchema");
            b(null, h.validate(a, d))
          } catch (t) {
            b(Error("Invalid JSON Schema"))
          }
        } else log.verbose("Resolver#save()#_checkValidNovacomDevices()", "No schema for novacom-devices.json"), b()
      }
      log.verbose("Resolver#save()", "devicesData:", a);
      var d = path.join(q, "novacom-devices.json");
      fs.exists(d, function(e) {
        e || (d = path.join(__dirname, "json/novacom-devices.json"));
        async.waterfall([c.bind(this, a)], function(c, e) {
          if (c) return b(c);
          if (e && 0 < e.errors.length) {
            var f;
            f = "".concat("Invalid device info.");
            for (idx in e.errors) {
              f = f.concat("\n");
              var h = e.errors[idx].property + " " + e.errors[idx].message;
              null != (e = /instance\[*.*\]*\./g.exec(h)) && (h = h.substring(e[0].length));
              f = f.concat(h)
            }
            return setImmediate(b, Error(f))
          }
          log.verbose("Device Info is valid");
          fs.writeFile(d, JSON.stringify(a, null, "\t"), b)
        })
      })
    },
    list: function(a) {
      log.verbose("Resolver#list()");
      setImmediate(a, null, this.devices.map(function(a) {
        return a.display
      }))
    },
    setDefaultName: function(a,
      b) {
      var c = "string" === typeof a ? a : a && a.name;
      if (!c) {
        c = this.devices.filter(function(a) {
          return a.conn && -1 !== a.conn.indexOf("novacom")
        });
        if (1 < c.length) return b(Error("multiple devices are connected by novacom, please specify target name."));
        c = 0 < c.length && c[0].name ? c[0].name : "emulator"
      }
      b(null, "name", c)
    },
    getDeviceBy: function(a, b, c) {
      log.verbose("Resolver#getDeviceBy()", "key:", a, "value:", b);
      var d = this.devices.filter(function(c) {
        return c[a] && c[a] === b
      });
      if (1 > d.length) setImmediate(c, Error("No device matching '" +
        a + "'='" + b + "'"));
      else if (log.verbose("Resolver#getDeviceBy()", "devices:", d), "function" === typeof c) log.silly("Resolver#getDeviceBy()", "async"), setImmediate(c, null, d[0]);
      else return log.silly("Resolver#getDeviceBy()", "sync"), d[0]
    },
    getSshPrvKey: function(a, b) {
      var c = "string" === typeof a ? a : a && a.name;
      c ? async.waterfall([this.getDeviceBy.bind(this, "name", c), function(a, b) {
        log.info("Resolver#getSshPrvKey()", "target.host:", a.host);
        var c = "http://" + a.host + ":9991/webos_rsa",
          k = a.name.replace(/(\s+)/gi, "_") + "_webos",
          f = path.join(l, k);
        request.head(c, function(a, d, t) {
          if (a || d && 200 !== d.statusCode) return setImmediate(b, Error("Failed to get ssh private key"));
          log.info("Resolver#getSshPrvKey()#head", "content-type:", d.headers["content-type"]);
          log.info("Resolver#getSshPrvKey()#head", "content-length:", d.headers["content-length"]);
          request(c).pipe(fs.createWriteStream(f)).on("close", function(a) {
            if (a) return setImmediate(b, Error("Failed to get ssh private key"));
            setImmediate(b, a, f, k)
          })
        })
      }, function(a, b, c) {
        log.info("Resolver#getSshPrvKey()",
          "SSH Private Key:", a);
        console.log("SSH Private Key:", a);
        fs.chmodSync(a, "0600");
        setImmediate(c, null, b)
      }], b) : setImmediate(b, Error("Need to select a device name to get Ssh Private Key"))
    },
    modifyDeviceFile: function(a, b, c) {
      if (b.name) {
        var d = m.getDeviceList(!0);
        if (Array.isArray(d)) {
          if ("add" == a) {
            a = -1;
            for (idx in d) {
              if (d[idx].name === b.name) {
                setImmediate(c, Error("Existing Target Name"));
                return
              }
              d[idx].order > a && (a = d[idx].order)
            } - 1 != a && (b.order = ++a);
            for (key in b) "@DELETE@" === b[key] && delete b[key];
            d = d.concat(b)
          } else if ("remove" ==
            a) {
            a = -1;
            for (idx in d)
              if (d[idx].name === b.name) {
                a = d[idx].order || -1;
                break
              }
            if (-1 !== idx) {
              if (d[idx].name !== b.name) return setImmediate(c, Error("Please enter a correct device name!!"));
              if (d[idx].indelible && !0 === d[idx].indelible) return setImmediate(c, Error("this device should not be removed!!"));
              d.splice(idx, 1);
              for (idx in d) d[idx].order > a && d[idx].order--
            }
          } else if ("modify" == a) {
            var e = !1;
            d.forEach(function(a) {
              a.name === b.name && (e = !0, Object.keys(b).forEach(function(c) {
                "@DELETE@" === b[c] ? delete a[c] : a[c] = b[c]
              }))
            });
            if (!1 === e) return setImmediate(c, Error("Could not find a device named " + b.name))
          } else return setImmediate(c, Error("Unknown operator"));
          this.save(d, c)
        } else setImmediate(c, Error("Incorrect file format'"))
      } else setImmediate(c, Error("Incorrect target name"))
    }
  };
  n.Session = function(a, b) {
    if ("function" !== typeof b) throw Error("novacom.Session(): BUG next must be a common-js callback");
    log.info("novacom.Session()", "opening session to '" + ("string" === typeof a ? a : a && a.name) + "'");
    this.resolver = new r;
    async.waterfall([this.resolver.load.bind(this.resolver),
      this.resolver.setDefaultName.bind(this.resolver, a), this.resolver.getDeviceBy.bind(this.resolver), this.checkConnection.bind(this), this.begin.bind(this)
    ], b)
  };
  n.Session.prototype = {
    checkConnection: function(a, b) {
      var c = !1;
      if (a && a.host && a.port) {
        var d = new net.Socket;
        d.setTimeout(2E3);
        var e = d.connect({
          host: a.host,
          port: a.port
        });
        e.on("connect", function() {
          c = !0;
          e.end();
          setImmediate(b, null, a)
        });
        e.on("error", function(a) {
          e.destroy();
          setImmediate(b, errMsgHndl.changeErrMsg(a))
        });
        e.on("timeout", function(a) {
          e.destroy();
          c || setImmediate(b, errMsgHndl.changeErrMsg("Time out"))
        })
      } else setImmediate(b, null, a)
    },
    begin: function(a, b) {
      function c(a) {
        setImmediate(b, errMsgHndl.changeErrMsg(a), this)
      }

      function d() {
        log.verbose("Clear Session");
        e.end();
        setTimeout(function() {
          process.exit()
        }, 500)
      }
      log.verbose("Session#begin()", "target:", a);
      var e = this;
      this.target = a || this.target;
      if (this.target.conn && -1 === this.target.conn.indexOf("ssh")) return setImmediate(b, null, this), this;
      if (!typeof this.target.privateKey && !typeof this.target.password) return setImmediate(b,
        Error("Private Key File or Password does not exist!!"));
      this.ssh || (this.forwardedPorts = [], this.ssh = new ssh2, this.ssh.on("connect", function() {
          log.verbose("Session#begin()", "ssh session event: connected")
        }), this.ssh.on("ready", c.bind(this)), this.ssh.on("error", c.bind(this)), this.ssh.on("end", function() {
          log.verbose("Session#begin()", "ssh session event: end")
        }), this.ssh.on("close", function(a) {
          log.verbose("Session#begin()", "ssh session event: close  (had_error:", a, ")")
        }), this.target.readyTimeout = 3E4, this.ssh.connect(this.target),
        process.on("SIGHUP", d), process.on("SIGINT", d), process.on("SIGQUIT", d), process.on("SIGTERM", d), process.on("exit", function(a) {
          d()
        }));
      return this
    },
    getDevice: function() {
      return this.target
    },
    end: function() {
      log.verbose("Session#end()", "user-requested termination");
      this.ssh && this.ssh.end();
      return this
    },
    _checkSftp: function(a) {
      this.ssh.subsys("sftp", function(b, c) {
        if (b) return setImmediate(a, b);
        c.once("data", function(b) {
          if (b.toString().match(/sftp-server(.| )+not found/gi)) return b = Error("Unable to use sftp"),
            b.code = 4, setImmediate(a, b)
        })
      })
    },
    put: function(a, b, c) {
      log.verbose("Session#put()", "streaming into device:", b, "from host:", a);
      var d = this;
      d.sftpPut(a, b, function(e) {
        e ? (log.verbose(e), 4 === e.code || 127 === e.code ? (log.verbose("Session#put()", "sftp is not available, attempt transfering file via streamPut"), is = new streamBuffers.ReadableStreamBuffer, is.pause(), fs.readFile(a, function(a, e) {
          if (a) return c(a);
          is.put(e);
          d.streamPut(b, is, c)
        })) : (14 === e.code && (e = errMsgHndl.changeErrMsg("insufficient free space")), setImmediate(c,
          e))) : setImmediate(c)
      })
    },
    streamPut: function(a, b, c) {
      log.verbose("Session#streamPut()", "streaming into device:" + a);
      this.run('/bin/cat > "' + a + '"', b, null, process.stderr, c)
    },
    sftpPut: function(a, b, c) {
      log.verbose("Session#sftpPut()", "streaming into device:", b, "from host:", a);
      var d = this;
      d._checkSftp(c);
      async.series({
        transfer: function(c) {
          d.ssh.sftp(function(d, k) {
            if (d) return setImmediate(c, d);
            var f = fs.createReadStream(a),
              h = k.createWriteStream(b);
            h.on("close", function() {
              k.end();
              setImmediate(c)
            });
            h.on("exit", function(a,
              b) {
              d = p("sftpPut", a, b);
              setImmediate(c, d)
            });
            h.on("error", function(a) {
              log.verbose("Session#sftpPut()", "error:", a);
              setImmediate(c, a)
            });
            f.pipe(h)
          })
        }
      }, function(a) {
        setImmediate(c, a)
      })
    },
    get: function(a, b, c) {
      log.verbose("Session#get()", "streaming into host:", b, "from target:", a);
      var d = this;
      d.sftpGet(a, b, function(e) {
        e ? (log.verbose(e), 4 === e.code || 127 === e.code ? (log.verbose("Session#get()", "sftp is not available, attempt transfering file via streamPut"), os = fs.createWriteStream(b), d.streamGet(a, os, c)) : setImmediate(c,
          e)) : setImmediate(c)
      })
    },
    streamGet: function(a, b, c) {
      log.verbose("Session#streamGet()", "streaming from device:" + a);
      this.run("/bin/cat " + a, null, b, process.stderr, c)
    },
    sftpGet: function(a, b, c) {
      log.verbose("Session#sftpGet()", "streaming into host:", b, "from target:", a);
      var d = this;
      d._checkSftp(c);
      async.series({
        transfer: function(c) {
          d.ssh.sftp(function(d, k) {
            if (d) setImmediate(c, d);
            else {
              var f = k.createReadStream(a),
                h = fs.createWriteStream(b);
              f.on("close", function() {
                k.end();
                setImmediate(c)
              });
              f.on("exit", function(a,
                b) {
                d = p("sftpGet", a, b);
                setImmediate(c, d)
              });
              f.pipe(h)
            }
          })
        }
      }, function(a) {
        setImmediate(c, a)
      })
    },
    run: function(a, b, c, d, e) {
      this.ssh ? this.run_ssh(a, b, c, d, e) : novacomusb.runDeviceCommand(this.target.id, a, b, c, d, e)
    },
    run_ssh: function(a, b, c, d, e) {
      log.verbose("Session#run()", "cmd=" + a);
      if ("function" !== typeof e) throw Error("BUG: 'next' is not a callback");
      var g = {},
        k = {};
      c ? c instanceof stream.Stream ? (log.silly("Session#run()", "stdout: stream"), g.stdout = c.write, k.stdout = c) : c instanceof Function ? (log.silly("Session#run()",
        "stdout: function"), g.stdout = c) : setImmediate(e, Error("Invalid novacom stdout: " + util.inspect(c))) : (log.silly("Session#run()", "stdout: none"), g.stdout = function() {});
      d ? d instanceof stream.Stream ? (log.silly("Session#run()", "stderr: stream"), g.stderr = d.write, k.stderr = d) : d instanceof Function ? (log.silly("Session#run()", "stderr: function"), g.stderr = d) : setImmediate(e, Error("Invalid novacom stderr: " + util.inspect(d))) : (log.silly("Session#run()", "stderr: none"), g.stderr = function() {});
      this.ssh.exec(a, function(f,
        h) {
        log.verbose("Session#run()", "exec cmd: " + a + ", err:" + f);
        if (f) return setImmediate(e, f);
        h.on("data", function(a, b) {
          b = b || "stdout";
          log.verbose("Session#run()", "on data (" + b + ")");
          g[b].bind(k[b])(a)
        }).stderr.on("data", function(a) {
          log.verbose("Session#run()", "on data (stderr)");
          g.stderr.bind(k.stderr)(a)
        });
        h.on("end", function() {
          log.verbose("Session#run()", "event EOF from (cmd: " + a + ")");
          c !== process.stdout && c instanceof stream.Stream && c.end();
          d !== process.stderr && d instanceof stream.Stream && d.end()
        });
        h.on("exit",
          function(b, c) {
            log.verbose("Session#run()", "event exit code=" + b + ", signal=" + c + " (cmd: " + a + ")");
            f = p(a, b, c);
            setImmediate(e, f)
          });
        h.on("close", function() {
          log.verbose("Session#run()", "event close  (cmd: " + a + ")");
          void 0 === f && setImmediate(e)
        });
        b && (b.pipe(h), log.verbose("Session#run()", "resuming input"), b.resume())
      }.bind(this))
    },
    runNoHangup: function(a, b, c, d) {
      this.ssh ? this.runNoHangup_ssh(a, b, c, d) : novacomusb.runDeviceCommand(this.target.id, a, null, null, null, d)
    },
    runNoHangup_ssh: function(a, b, c, d) {
      log.verbose("Session#runNoHangup()",
        "cmd=" + a);
      if (2 > arguments.length) throw Error("BUG: 'next' is not a callback");
      for (arg in arguments) "undefined" === typeof arguments[arg] && (delete arguments[arg], arguments.length--);
      switch (arguments.length) {
        case 2:
          d = b;
          b = c = null;
          break;
        case 3:
          d = c, c = b, b = null
      }
      if ("function" !== typeof d) throw Error("BUG: 'next' is not a callback");
      this.ssh.exec(a, function(e, g) {
        log.verbose("Session#run()", "exec cmd: " + a + ", err:" + e);
        if (e) return setImmediate(d, e);
        g.on("data", function(a, c) {
          var d = Buffer.isBuffer(a) ? a.toString() : a;
          log.verbose("[Session#runNoHangup()#onData]", d);
          b && b(a)
        }).stderr.on("data", function(a) {
          var c = Buffer.isBuffer(a) ? a.toString() : a;
          log.verbose("Session#runNoHangup()#onData#stderr#", c);
          b && b(a)
        });
        if (c) g.on("exit", function(b, d) {
          log.verbose("Session#runNoHangup()", "event exit code=" + b + ", signal=" + d + " (cmd: " + a + ")");
          e = p(a, b, d);
          c(e)
        });
        setImmediate(d)
      }.bind(this))
    },
    forward: function(a, b, c, d) {
      log.verbose("Session#forward()", "devicePort:", a, "localPort:", b);
      var e = this,
        g = !1,
        k = null;
      "function" === typeof c ? d = c : c && (k =
        c);
      0 !== b ? 0 < e.forwardedPorts.indexOf({
        name: k,
        local: b,
        device: a
      }) && (g = !0) : 0 < e.forwardedPorts.filter(function(b) {
        return b.device === a && b.name === k
      }).length && (g = !0);
      if (g) return setImmediate(d);
      var f = net.createServer(function(c) {
        log.info("Session#forward()", "new client, localPort:", b);
        log.verbose("Session#forward()", "new client, from: " + c.remoteAddress + ":" + c.remotePort);
        c.on("error", function(a) {
          log.verbose("Session#forward()", "inCnx::error, err:: " + a)
        });
        e.ssh.forwardOut("127.0.0.1", c.remotePort, "127.0.0.1",
          a,
          function(d, e) {
            d ? (console.log("Session#forward()", "failed forwarding client localPort:", b, "(inCnx.remotePort:", c.remotePort, ")=> devicePort:", a), log.warn("Session#forward()", "failed forwarding client localPort:", b, "=> devicePort:", a), c.destroy()) : (log.info("Session#forward()", "connected, devicePort:", a), c.on("data", function(a) {
                e.writable && !0 === e.writable && !1 === e.write(a) && c.pause()
              }), c.on("close", function(a) {
                log.verbose("Session#forward()", "inCnx::close, had_err:", a);
                e.destroy()
              }), e.on("drain", function() {
                c.resume()
              }),
              e.on("data", function(a) {
                c.write(a)
              }), e.on("close", function(a) {
                log.verbose("Session#forward()", "outCnx::close, had_err:", a)
              }))
          })
      });
      e.ssh.on("close", function() {
        f.close()
      });
      try {
        var h;
        f.listen(b, null, function() {
          h = f.address().port;
          e.forwardedPorts.push({
            name: k,
            local: h,
            device: a
          });
          setImmediate(d)
        }.bind(this))
      } catch (l) {
        setImmediate(d, l)
      }
    },
    getLocalPortByDevicePort: function(a) {
      var b = null;
      this.forwardedPorts.forEach(function(c) {
        c.device === a && (b = c.local)
      });
      return b
    },
    getLocalPortByName: function(a) {
      var b = null;
      this.forwardedPorts.forEach(function(c) {
        c.name === a && (b = c.local)
      });
      return b
    },
    runHostedAppServer: function(a, b) {
      server.runServer(a, 0, function(a, d) {
        d && d.port && this.setHostedAppServerPort(d.port);
        b(a)
      }.bind(this))
    },
    setHostedAppServerPort: function(a) {
      this.hostedAppServerPort = a
    },
    getHostedAppServerPort: function() {
      return this.hostedAppServerPort
    }
  }
})();
