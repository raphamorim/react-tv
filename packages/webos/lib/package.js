var fs = require("fs"),
  os = require("os"),
  util = require("util"),
  path = require("path"),
  shelljs = require("shelljs"),
  mkdirp = require("mkdirp"),
  temp = require("temp"),
  zlib = require("zlib"),
  tarFilterPack = require("./tar-filter-pack"),
  rimraf = require("rimraf"),
  fstream = require("fstream"),
  spawn = require("child_process").spawn,
  async = require("async"),
  CombinedStream = require("combined-stream"),
  chardet = require("chardet"),
  encoding = require("encoding"),
  stripbom = require("strip-bom"),
  log = require("npmlog"),
  Validator = require("jsonschema").Validator,
  ElfParser = require("elfy").Parser,
  commonTools = require("./common-tools"),
  errMsgHndl = require("./error-handler");
(function() {
  function x(a) {
    this.objectId = H++;
    this.verbose = !1;
    this.silent = !0;
    a && a.level && (log.level = a.level, -1 !== ["warn", "error"].indexOf(a.level) && (this.silent = !1));
    this.noclean = !1;
    a && !0 === a.noclean && (this.noclean = !0);
    this.nativecmd = !1;
    a && !0 === a.nativecmd && (this.nativecmd = !0);
    this.minify = !0;
    a && a.hasOwnProperty("minify") && (this.minify = a.minify);
    a && a.hasOwnProperty("deployscript") && (this.deployscript = a.deployscript);
    a && a.hasOwnProperty("deploy-enyo") && (this["deploy-enyo"] = a["deploy-enyo"]);
    a && a.hasOwnProperty("deploy-lib") &&
      (this["deploy-lib"] = a["deploy-lib"]);
    a && a.hasOwnProperty("deploy-srcroot") && (this["deploy-srcroot"] = a["deploy-srcroot"]);
    this.excludeFiles = [];
    a && a.hasOwnProperty("excludefiles") && (a.excludefiles instanceof Array ? this.excludeFiles = a.excludefiles : this.excludeFiles.push(a.excludefiles));
    this.rom = !1;
    a && a.hasOwnProperty("rom") && (this.rom = a.rom);
    a && a.hasOwnProperty("override-appinfo") && (this.appInfoOverrides = JSON.parse(a["override-appinfo"]));
    log.verbose("Xtor Packager id=" + this.objectId);
    this.appCount =
      0;
    this.services = [];
    this.pkgServiceNames = []
  }

  function I() {
    this.srcDir = "";
    this.dstDirs = [];
    this.valid = !1;
    this.dirName = this.serviceInfo = ""
  }

  function J(a) {
    log.verbose("loadAppInfo");
    if (0 === this.appCount) return setImmediate(a);
    var b = path.join(this.appDir, "appinfo.json"),
      b = y(b, !0);
    try {
      log.verbose("APPINFO >>" + b + "<<");
      this.appinfo = JSON.parse(b);
      if (this.appinfo.onDeviceSource)
        for (var c in this.appinfo.onDeviceSource) {
          var d = this.appinfo.onDeviceSource[c],
            f;
          for (f in z) d = d.replace(f, z[f]);
          this.appinfo.onDeviceSource[c] =
            d
        }
      setImmediate(a)
    } catch (e) {
      setImmediate(a, e)
    }
  }

  function K(a) {
    log.verbose("overrideAppInfo");
    var b = this.appInfoOverrides;
    if (b)
      for (var c in b) this.appinfo[c] = b[c];
    setImmediate(a)
  }

  function L(a) {
    log.verbose("checkAppInfo");
    if (0 === this.appCount) return setImmediate(a);
    log.verbose("checkAppInfo: id: " + this.appinfo.id);
    if (1 > this.appinfo.id.length || !/^[a-z0-9.+-]*$/.test(this.appinfo.id)) return log.error("Invalid app id: " + this.appinfo.id), setImmediate(a, errMsgHndl.changeErrMsg("INVALID_APPID"));
    var b = path.join(__dirname,
      "schema/ApplicationDescription.schema");
    if (this.appinfo.type && this.appinfo.type.match(/clock/gi)) return setImmediate(a);
    async.waterfall([fs.readFile.bind(this, b, "utf-8"), function(a, b) {
        try {
          var f = JSON.parse(a),
            e = f.required;
          if (e)
            for (key in f.properties) - 1 != e.indexOf(key) && (f.properties[key].required = !0);
          b(null, f)
        } catch (g) {
          b(Error("Invalid JSON Schema for appinfo"))
        }
      }, function(a, b) {
        try {
          b(null, (new Validator).validate(this.appinfo, a))
        } catch (f) {
          log.error(f), b(Error("Invalid JSON Schema"))
        }
      }.bind(this)],
      function(b, d) {
        if (b) setImmediate(a, b);
        else {
          if (d && 0 < d.errors.length) {
            var f;
            f = "".concat("Invalid appinfo.json");
            for (idx in d.errors) {
              f = f.concat("\n");
              var e = d.errors[idx].property + " " + d.errors[idx].message; - 1 < e.indexOf("instance.") && (e = e.substring(9));
              f = f.concat(e)
            }
            return setImmediate(a, Error(f))
          }
          log.verbose("APPINFO is valid");
          setImmediate(a)
        }
      })
  }

  function M(a) {
    log.verbose("fillAssetsField");
    if (0 === this.appCount) return setImmediate(a);
    this.appinfo.assets = this.appinfo.assets || [];
    for (var b in this.appinfo) this.appinfo.hasOwnProperty(b) &&
      r[b] && -1 === this.appinfo.assets.indexOf(this.appinfo[b]) && this.appinfo[b] && this.appinfo.assets.push(this.appinfo[b]);
    var c = this.originAppDir;
    b = path.join(this.originAppDir, "resources");
    var d = [],
      f = [];
    try {
      if (!fs.lstatSync(b).isDirectory()) return setImmediate(a, null)
    } catch (e) {
      if ("ENOENT" === e.code) return setImmediate(a, null)
    }
    async.series([s.bind(null, b, "appinfo.json", d), function(a) {
      async.forEach(d, function(a, b) {
        y(a, !0, function(d, e) {
          try {
            var g = JSON.parse(e),
              t = path.dirname(a),
              n;
            for (n in g)
              if (g.hasOwnProperty(n) &&
                r[n] && g[n]) {
                var N = path.join(t, g[n]),
                  A = path.relative(c, N); - 1 === f.indexOf(A) && f.push(A)
              }
            setImmediate(b, null)
          } catch (q) {
            setImmediate(b, Error("JSON parsing error for " + a))
          }
        })
      }, function(b) {
        setImmediate(a, b)
      })
    }, function(a) {
      this.appinfo.assets = this.appinfo.assets.concat(f);
      setImmediate(a, null)
    }.bind(this)], function(b) {
      setImmediate(a, b)
    })
  }

  function O(a) {
    log.verbose("createTmpDir");
    this.tempDir = temp.path({
      prefix: "com.palm.ares.hermes.bdOpenwebOS"
    }) + ".d";
    log.verbose("temp dir = " + this.tempDir);
    mkdirp(this.tempDir,
      a)
  }

  function P(a) {
    log.verbose("createAppDir");
    if (0 === this.appCount) return setImmediate(a);
    this.applicationDir = path.join(this.tempDir, "data/usr/palm/applications", this.appinfo.id);
    log.verbose("application dir = " + this.applicationDir);
    mkdirp(this.applicationDir, a)
  }

  function Q(a, b, c) {
    this.cwd = process.cwd();
    process.chdir(a);
    b && "function" == typeof b && b(c)
  }

  function u(a, b) {
    this.cwd && process.chdir(this.cwd);
    a && "function" == typeof a && a(b)
  }

  function R(a) {
    if (fs.existsSync(path.join(this.appDir, "lib/enyo"))) try {
      var b =
        require(path.join(this.appDir, "lib/enyo"));
      if (b.version && "2.6.0" <= b.version) {
        Q(this.appDir);
        var c = {
            package: this.appDir,
            devmode: !this.minify,
            outfile: this.appinfo.main
          },
          d = path.join(this.appDir, ".enyoconfig"),
          f = this;
      } else setImmediate(a)
    } catch (e) {
      u(a, e)
    } else setImmediate(a)
  }

  function S(a) {
    log.verbose("minifyApp");
    if (0 === this.appCount) return setImmediate(a);
    var b;
    if (!0 === this.minify) {
      var c = !1;
      this.deployscript && (b = this.deployscript);
      if (fs.existsSync(path.join(this.appDir, "package.js")) &&
        this.appinfo.main && this.appinfo.main.match(/(\.html|\.htm)$/gi)) {
        regex = /(<script[^>]*src[ \t]*=[ \t]*['"])[^'"]*\/enyo.js(['"])/;
        var d = path.join(this.appDir, this.appinfo.main);
        if (!fs.existsSync(d)) return setImmediate(a, Error(this.appinfo.main + " does not exist. please check the file path"));
        fs.readFileSync(d).toString().match(regex) && (c = !0, b || (b = path.join(__dirname, "../enyo/tools/deploy.js")))
      }
      if (!c && b) return console.log("Ignore deploy-script because minifying is only for enyo app"), setImmediate(a);
      log.verbose("minifying tool:", b);
      if (fs.existsSync(b)) {
        if (!fs.lstatSync(b).isFile()) {
          setImmediate(a, "ERROR: '" + b + "' is not a valid file path");
          return
        }
        b = [path.resolve(b)];
        var f, e;
        this["deploy-srcroot"] || fs.existsSync(path.join(this.appDir, "deploy.json")) || fs.existsSync(path.join(this.appDir, "index.html")) || (c = path.dirname(path.resolve(path.join(this.appDir, this.appinfo.main))), c !== path.basename(path.resolve(this.appDir)) && (console.log("Set source code root directory :", c), this["deploy-srcroot"] = c));
        d = {};
        c = this["deploy-srcroot"] ? path.join(this["deploy-srcroot"], "deploy.json") : path.join(this.appDir, "deploy.json");
        if (fs.existsSync(c)) {
          var g = fs.readFileSync(c);
          try {
            d = JSON.parse(g), d.enyo && !this["deploy-lib"] && (this["deploy-lib"] = path.join(this.appDir, path.join(d.enyo, "../lib")))
          } catch (m) {
            setImmediate(a, "ERROR: invalid deploy.json (" + path.resolve(c) + ")");
            return
          }
        }
        this["deploy-srcroot"] && (f = path.relative(path.resolve(this.appDir), path.resolve(this["deploy-srcroot"])), b.push("-s", f), b.push("-o", path.join("deploy",
          path.basename(this.appDir), f)));
        this["deploy-enyo"] && (e = path.relative(path.resolve(this.appDir), path.resolve(this["deploy-enyo"])), b.push("-e", e));
        this["deploy-lib"] && b.push("-l", "lib");
        var l = !1,
          k = e ? e : d.enyo ? this["deploy-srcroot"] ? path.join(f, d.enyo) : d.enyo : "enyo",
          k = path.resolve(this.appDir, k);
        this.appinfo.onDeviceSource && -1 !== Object.keys(this.appinfo.onDeviceSource).indexOf("enyo") || !fs.existsSync(k) || fs.existsSync(path.join(k, "minify", "package.js")) || (log.verbose("Enyo is already minified..."),
          l = !0, b.push("-f", "enyo", "-t", "enyo"));
        if (this.appinfo.onDeviceSource)
          for (var h in this.appinfo.onDeviceSource) f = this.appinfo.onDeviceSource[h], h = h.replace(/[/|\\]/g, path.sep), f = f.replace(/[\\]/g, "/"), b.push("-f", h, "-t", f);
        this.appinfo.resolutionIndependent && (log.verbose("Enabling resolution-independence..."), b.push("-ri"));
        console.log("Minifying command...\n", "node " + b.join(" ") + "\n");
        h = spawn("node", b, {
          cwd: this.appDir
        });
        f = function(a) {
          console.log(a.toString())
        };
        h.stderr.on("data", f);
        h.stdout.on("data",
          f);
        h.on("exit", function(b) {
          if (0 !== b) setImmediate(a, "ERROR: minification failed");
          else {
            b = path.join(this.appDir, "deploy", path.basename(this.appDir));
            var c = {},
              d;
            for (d in this.appinfo) this.appinfo.hasOwnProperty(d) && !B[d] && (c[d] = this.appinfo[d]);
            fs.writeFileSync(path.join(b, "appinfo.json"), JSON.stringify(c, null, "\t"));
            fs.existsSync(path.join(this.appDir, "framework_config.json")) && shelljs.cp(path.join(this.appDir, "framework_config.json"), b);
            l && fs.existsSync(k) && shelljs.cp("-rf", path.join(k, "*"), path.join(b,
              "build"));
            console.log("Packaging minified output: " + b);
            this.appDir = b;
            setImmediate(a)
          }
        }.bind(this));
        return
      }
      this.deployscript && setImmediate(a, "Deploy script '" + this.deployscript + "' not found.")
    }
    setImmediate(a)
  }

  function q(a, b, c) {
    function d(a, b, c, d, f, g) {
      e[b] && a.push({
        type: b,
        basePath: c,
        relPath: d,
        isSubPath: f,
        indRelPath: g
      })
    }

    function f(a, b, c, e) {
      async.waterfall([fs.readdir.bind(null, a), function(e, g) {
        if (0 === e.length) return d(c, "dir", b, path.relative(b, a), !0, null), setImmediate(g);
        async.forEachSeries(e, function(e,
          g) {
          var h = path.join(a, e),
            p = path.relative(b, h);
          async.waterfall([fs.lstat.bind(null, h), function(a, e) {
            if (a.isSymbolicLink()) {
              try {
                var g = fs.realpathSync(h)
              } catch (m) {
                return "ENOENT" === m.code ? (log.warn("The file for symbolic link (" + h + ") is missing..."), setImmediate(e)) : setImmediate(e, m)
              }
              var n = fs.readlinkSync(h);
              if (-1 !== g.indexOf(b)) d(c, "symlink", b, p, !0, n);
              else {
                g = fs.statSync(h);
                if (g.isDirectory()) return f(h, b, c, e);
                g.isFile() && d(c, "file", b, p, !0, null)
              }
            } else {
              if (a.isDirectory()) return f(h, b, c, e);
              a.isFile() && d(c,
                "file", b, p, !0, null)
            }
            setImmediate(e)
          }], g)
        }, g)
      }], function(a) {
        return setImmediate(e, a)
      })
    }
    var e = {
        file: "file",
        dir: "dir",
        symlink: "symlink"
      },
      g = [];
    a = path.normalize(path.resolve(a));
    b = path.normalize(path.resolve(b));
    async.series([function(b) {
      fs.statSync(a).isFile() ? (d(g, "file", path.dirname(a), path.basename(a), !0, null), setImmediate(b)) : f(a, a, g, b)
    }, function(a, b, c) {
      try {
        async.forEachSeries(a, function(a, c) {
          if (e[a.type]) {
            if (!a.relPath) return log.verbose("copySrcToDst#_copySrcToDst#ignore 'unknown path'"), setImmediate(c);
            if (a.type === e.dir) return mkdirp.sync(path.join(b, a.relPath)), setImmediate(c);
            var d = path.dirname(path.join(b, a.relPath));
            fs.existsSync(d) || mkdirp.sync(d);
            a.type === e.symlink ? a.isSubPath && a.indRelPath && (d = path.join(b, a.relPath), fs.existsSync(d) && fs.lstatSync(d).isSymbolicLink() && fs.unlinkSync(d), fs.symlinkSync(a.indRelPath, d, null)) : fs.existsSync(path.join(a.basePath, a.relPath)) ? shelljs.cp("-Rf", path.join(a.basePath, a.relPath), path.join(b, a.relPath, "..")) : log.verbose("copySrcToDst#_copySrcToDst#ignore '" +
              a.relPath + "'");
            setImmediate(c)
          } else log.verbose("copySrcToDst#_copySrcToDst#ignore 'unknown file type'(" + a.type + ")")
        }, function(a) {
          setImmediate(c, a)
        })
      } catch (d) {
        setImmediate(c, d)
      }
    }.bind(null, g, b)], function(a) {
      c(a)
    })
  }

  function T(a) {
    log.verbose("checkELFHeader");
    var b = this,
      c = new Buffer(62),
      d = path.resolve(path.join(this.appDir, this.appinfo.main)),
      f = fs.openSync(d, "r"),
      e = fs.fstatSync(f),
      g = new ElfParser;
    if (62 > e.size) return log.verbose("checkELFHeader():", "file size is smaller than ELF Header size"), setImmediate(a);
    fs.read(f, c, 0, 62, 0, function(c, e, k) {
      if (62 > e || c) return log.verbose("checkELFHeader():", "err:", c, ", bytesRead:", byteRead), log.verbose("checkELFHeader():", "readBuf to parse ELF header is small or error occurred during reading file."), setImmediate(a);
      c = "\u007fELF" !== k.slice(0, 4).toString() ? !1 : !0;
      if (c) {
        log.verbose("checkELFHeader():", d + " is ELF format");
        try {
          var h = g.parseHeader(k);
          log.verbose("checkELFHeader():", "elfHeader:", h);
          h.machine && h.machine.match(/86$/) ? b.architecture = "i586" : b.architecture = h.machine
        } catch (p) {
          log.verbose("checkELFHeader():",
            "exception:", p)
        }
      } else log.verbose("checkELFHeader():", d + " is not ELF format");
      fs.close(f);
      setImmediate(a)
    })
  }

  function U(a) {
    log.verbose("copyApp");
    if (0 === this.appCount) return setImmediate(a);
    this.dataCopyCount++;
    q(this.appDir, this.applicationDir, a)
  }

  function V(a) {
    function b(a, b) {
      log.verbose("copyAssets():", "_handleAssets()");
      path.resolve(this.originAppDir) === path.resolve(this.appDir) ? c.call(this, a, b) : async.series([c.bind(this, a), d.bind(this, a)], b)
    }

    function c(a, b) {
      log.verbose("copyAssets():", "_checkAppinfo()");
      var c;
      if (path.resolve(a) == path.normalize(a)) return b(Error("In appinfo.json, '" + a + "'' path must be relative to the appinfo.json."));
      c = path.join(this.originAppDir, a);
      if (0 != path.resolve(c).indexOf(this.originAppDir)) return b(Error("In appinfo.json, '" + a + "'' path must be located under app diectory."));
      if (!fs.existsSync(c)) {
        var d = "'" + a + "'' does not exist. please check the file path.";
        return 0 === path.basename(c).indexOf("$") ? setImmediate(b) : setImmediate(b, Error(d))
      }
      setImmediate(b)
    }

    function d(a, b) {
      log.verbose("copyAssets():",
        "_copyAssets()");
      log.verbose("copyAssets # '" + a + "' will be located in app directory");
      var c = path.join(this.originAppDir, a),
        d = this.appDir;
      async.series([function(a) {
        fs.existsSync(d) ? setImmediate(a) : mkdirp(d, a)
      }], function(a) {
        if (a) return setImmediate(b, a);
        shelljs.cp("-Rf", c, d);
        setImmediate(b)
      })
    }
    log.verbose("copyAssets");
    if (0 === this.appCount) return setImmediate(a);
    try {
      async.forEachSeries(this.appinfo.assets, b.bind(this), a)
    } catch (f) {
      return setImmediate(a, f)
    }
  }

  function W(a) {
    log.verbose("excludeIpkFileFromApp");
    this.excludeFiles = this.excludeFiles.concat(["[.]*[.]ipk", ".DS_Store"]);
    setImmediate(a)
  }

  function C(a, b, c, d) {
    async.waterfall([fs.readdir.bind(null, c), function(d, e) {
      async.forEach(d, function(d, f) {
        var e = path.join(c, d);
        async.waterfall([fs.lstat.bind(null, e), function(c, f) {
          var m = !1;
          b.test(d) && (m = !0, a.push(e));
          !m && c.isDirectory() ? C(a, b, e, f) : setImmediate(f)
        }], f)
      }, e)
    }], function(a) {
      setImmediate(d, a)
    })
  }

  function X(a) {
    log.verbose("excludeFromApp");
    var b = [],
      c = (0 === this.appCount ? this.excludeFiles : this.excludeFiles.concat(this.appinfo.exclude ||
        [])).map(function(a) {
        return a.replace(/^\./g, "^\\.").replace(/^\*/g, "").replace(/$/g, "$")
      }, this).join("|");
    async.series([C.bind(this, b, new RegExp(c, "i"), this.tempDir), function(a) {
      try {
        b.forEach(function(a) {
          shelljs.rm("-rf", a)
        }), setImmediate(a)
      } catch (c) {
        setImmediate(a, c)
      }
    }], function(b, c) {
      if (b) return setImmediate(a, b);
      setImmediate(a)
    })
  }

  function Y(a) {
    log.verbose("rewriteAppInfo");
    if (0 === this.appCount) return setImmediate(a);
    if (!0 !== this.minify) {
      var b = {},
        c;
      for (c in this.appinfo) !this.appinfo.hasOwnProperty(c) ||
        B[c] || Z[c] || (b[c] = this.appinfo[c]);
      fs.writeFileSync(path.join(this.applicationDir, "appinfo.json"), JSON.stringify(b, null, "\t"))
    }
    setImmediate(a)
  }

  function $(a) {
    log.verbose("rewriteAppJS");
    if (0 === this.appCount) return setImmediate(a);
    if (!0 === this.minify && this.appinfo.onDeviceSource) try {
      var b = path.join(this.applicationDir, "build");
      fs.existsSync(b) && fs.readdirSync(b).forEach(function(a) {
        a = path.join(b, a);
        if (fs.statSync(a).isFile()) {
          for (var c = fs.readFileSync(a, "utf8"), e = /enyo.path.addPath\(.*\)|enyo.depends\(.*[\s\S]*\)/g; null !=
            (result = e.exec(c));) c = c.replace(result[0], result[0].replace(/[\\]/g, "/"));
          fs.writeFileSync(a, c, "utf8")
        }
      })
    } catch (c) {
      setImmediate(a, c)
    }
    setImmediate(a)
  }

  function aa(a) {
    log.verbose("rewriteSourcePaths");
    if (0 === this.appCount) return setImmediate(a);
    if (!0 === this.minify) {
      if (this.appinfo.onDeviceSource) {
        var b = (this.appinfo.additionalHtmlFiles || []).concat(this.appinfo.main),
          c;
        for (c in b) {
          var d = b[c];
          try {
            var f = path.join(this.applicationDir, d),
              e = fs.readFileSync(f, "utf8"),
              g;
            for (g in this.appinfo.onDeviceSource) {
              var m =
                this.appinfo.onDeviceSource[g],
                l = new RegExp("(<link[^>]*href[ \t]*=[ \t]*['\"][ \t]*)" + g),
                e = e.replace(l, "$1" + m),
                l = new RegExp("(<script[^>]*src[ \t]*=[ \t]*['\"][ \t]*)" + g),
                e = e.replace(l, "$1" + m);
              "enyo" == g && (l = /(<link[^>]*href[ \t]*=[ \t]*['"])[^'"]*build\/enyo.css(['"])/, e = e.replace(l, "$1" + m + "/enyo.css$2"), l = /(<script[^>]*src[ \t]*=[ \t]*['"])[^'"]*build\/enyo.js(['"])/, e = e.replace(l, "$1" + m + "/enyo.js$2"))
            }
            fs.writeFileSync(f, e, "utf8")
          } catch (k) {
            setImmediate(a, k)
          }
        }
      }
    } else
      for (c in b = (this.appinfo.additionalHtmlFiles ||
          []).concat(this.appinfo.main), b) {
        d = b[c];
        try {
          f = path.join(this.applicationDir, d), e = fs.readFileSync(f, "utf8"), l = /(<link[^>]*href[ \t]*=[ \t]*['"])[^'"]*build\/enyo.css(['"]).*(\/>|<\/link>)/, e = e.replace(l, ""), l = /(<script[^>]*src[ \t]*=[ \t]*['"])[^'"]*build\/enyo.js(['"]).*(\/>|<\/script>)/, e = e.replace(l, ""), fs.writeFileSync(f, e, "utf8")
        } catch (h) {
          setImmediate(a, h)
        }
      }
    setImmediate(a)
  }

  function ba(a) {
    log.verbose("createPackageDir");
    if (0 === this.appCount) return setImmediate(a);
    this.rom ? setImmediate(a) : (this.packageDir =
      path.join(this.tempDir, "data/usr/palm/packages", this.appinfo.id), log.verbose("package dir = " + this.packageDir), mkdirp(this.packageDir, a))
  }

  function ca(a) {
    log.verbose("fillPackageDir");
    if (0 === this.appCount) return setImmediate(a);
    if (this.rom) setImmediate(a);
    else if (this.pkgDir) shelljs.cp("-Rf", path.join(this.pkgDir, "packageinfo.json"), this.packageDir), setImmediate(a);
    else {
      var b = JSON.stringify({
        app: this.appinfo.id,
        id: this.appinfo.id,
        loc_name: this.appinfo.title,
        package_format_version: this.appinfo.uiRevision,
        vendor: this.appinfo.vendor,
        version: this.appinfo.version || "1.0.0"
      }, null, 2) + "\n";
      log.verbose("Generating package.json: " + b);
      fs.writeFile(path.join(this.packageDir, "packageinfo.json"), b, a)
    }
  }

  function da(a, b) {
    log.verbose("loadPackageProperties");
    var c = this;
    c.packageProperties = {};
    async.forEach(a, function(a, b) {
      var e = path.join(a, "package.properties");
      fs.existsSync(e) ? fs.readFile(e, function(a, d) {
        try {
          log.verbose("PACKAGE PROPERTIES >>" + d + "<<");
          var e = d.toString().split("\n"),
            k, h;
          for (h in e)
            if (0 == e[h].indexOf("filemode.")) {
              k =
                e[h].indexOf("=");
              var p = e[h].substr(k + 1).trim(),
                t = e[h].slice(9, k).trim();
              p.split(",").forEach(function(a) {
                a = a.replace(/\\/g, "/").trim();
                var b = a.lastIndexOf("/");
                a = -1 !== b ? a.substr(b + 1) : a;
                c.packageProperties[a] = t
              }.bind(this))
            }
          setImmediate(b)
        } catch (n) {
          setImmediate(b, n)
        }
      }) : setImmediate(b)
    }, function(a) {
      c.excludeFiles = c.excludeFiles.concat(["package.properties"]);
      setImmediate(b, a)
    })
  }

  function ea(a, b, c, d) {
    this.rom ? q(path.join(this.tempDir, "data"), a, d) : async.series([fa.bind(this, b, c), ga.bind(this, "data"),
      D.bind(this, "data", "data.tar.gz"), ha.bind(this), ia.bind(this), D.bind(this, "ctrl", "control.tar.gz"), ja.bind(this), ka.bind(this), la.bind(this, a), ma.bind(this, a)
    ], function(a, b) {
      a ? setImmediate(d, a) : setImmediate(d)
    })
  }

  function fa(a, b, c) {
    log.verbose("decidePkgName");
    this.pkg = 0 !== this.appCount ? {
      name: a || this.appinfo.id,
      version: b || this.appinfo.version
    } : 0 < this.services.length ? {
      name: a || this.services[0].serviceInfo.id || this.services[0].serviceInfo.services[0].name,
      version: b || "1.0.0"
    } : {
      name: a || "unknown",
      version: b ||
        "1.0.0"
    };
    setImmediate(c)
  }

  function ga(a, b) {
    function c(a, b) {
      fs.lstat(a, function(d, f) {
        var k = f.size;
        !d && f.isDirectory() ? fs.readdir(a, function(d, f) {
          if (d) return b(d);
          async.forEach(f, function(b, d) {
            c(path.join(a, b), function(a, b) {
              k += b;
              d(a)
            })
          }, function(a) {
            b(a, k)
          })
        }) : b(d, k)
      })
    }
    log.verbose("getFileSize");
    var d = this,
      f = path.join(this.tempDir, a);
    async.waterfall([c.bind(this, f)], function(a, c) {
      !a && c && (log.verbose("getFileSize#Installed-Size:", c), d.size = c);
      setImmediate(b, a)
    })
  }

  function ha(a) {
    log.verbose("createCtrlDir");
    this.ctrlDir = path.join(this.tempDir, "ctrl");
    log.verbose("ctrl dir = " + this.ctrlDir);
    mkdirp(this.ctrlDir, a)
  }

  function ia(a) {
    log.verbose("createControlFile");
    var b = ["Package: " + this.pkg.name, "Version: " + this.pkg.version, "Section: misc", "Priority: optional", "Architecture: " + (this.architecture || "all"), "Installed-Size: " + (this.size || 1234), "Maintainer: N/A <nobody@example.com>", "Description: This is a webOS application.", "webOS-Package-Format-Version: 2", "webOS-Packager-Version: x.y.x", ""];
    fs.writeFile(path.join(this.ctrlDir,
      "control"), b.join("\n"), a)
  }

  function ja(a) {
    log.verbose("createDebianBinary");
    fs.writeFile(path.join(this.tempDir, "debian-binary"), "2.0\n", a)
  }

  function D(a, b, c) {
    a = path.join(this.tempDir, a);
    log.verbose("makeTgz " + b + " from " + a);
    var d = String(a).length,
      f = this.pkgServiceNames;
    fstream.Reader({
      path: a,
      type: "Directory",
      filter: function(a) {
        "Directory" === a.props.type && (maskingBits = 201, -1 !== f.indexOf(a.props.basename) && (maskingBits = 219), a.props.mode |= a.props.mode >>> 2 & maskingBits);
        return !0
      }
    }).pipe(tarFilterPack({
      noProprietary: !0,
      pathFilter: function(a) {
        return "." + a.slice(d)
      },
      permission: this.packageProperties
    })).pipe(zlib.createGzip()).pipe(fstream.Writer(path.join(this.tempDir, b))).on("close", c).on("error", c)
  }

  function ka(a) {
    var b = this.pkg.name;
    this.ipkFileName = b = this.pkg.version ? b.concat("_" + this.pkg.version + "_" + ("i586" === this.architecture ? "x86" : this.architecture || "all") + ".ipk") : b.concat(".ipk");
    setImmediate(a)
  }

  function la(a, b) {
    log.verbose("removeExistingIpk");
    if (0 === this.appCount) return setImmediate(b);
    var c = path.join(a, this.ipkFileName);
    fs.exists(c, function(a) {
      a ? fs.unlink(c, b) : setImmediate(b)
    })
  }

  function v(a, b) {
    return String(a + "                                     ").slice(0, b)
  }

  function E(a, b) {
    var c = Math.floor(Date.now() / 1E3);
    return v(a, 16) + v(c, 12) + "0     0     100644  " + v(b, 10) + "`\n"
  }

  function ma(a, b) {
    var c = this;
    this.ipk = path.join(a, this.ipkFileName);
    log.verbose("makeIpk in dir " + a + " file " + this.ipkFileName);
    if (this.nativecmd) shelljs.cd(this.tempDir), shelljs.exec("ar -q " + this.ipk + " debian-binary control.tar.gz data.tar.gz", {
        silent: this.silent
      }),
      console.log("Creating package " + filename + " in " + a), setImmediate(b);
    else {
      var d = CombinedStream.create(),
        f = E("debian-binary", 4) + "2.0\n",
        e = this;
      d.append("!<arch>\n" + f);
      f = fstream.Writer(this.ipk);
      ["control.tar.gz", "data.tar.gz"].forEach(function(a) {
        var b = path.join(e.tempDir, a),
          c = fstream.Reader({
            path: b,
            type: "File"
          }),
          b = fs.statSync(b);
        d.append(E(a, b.size));
        d.append(c);
        0 !== b.size % 2 && (log.verbose("Adding a filler for file " + a), d.append("\n"))
      }, this);
      d.pipe(f);
      f.on("close", function() {
        console.log("Creating package " +
          c.ipkFileName + " in " + a);
        setImmediate(b)
      });
      f.on("error", b)
    }
  }

  function na(a) {
    log.verbose("cleanupTmpDir");
    this.noclean ? (console.log("Skipping removal of  " + this.tempDir), setImmediate(a)) : rimraf(this.tempDir, function(b) {
      log.verbose("cleanup(): removed " + this.tempDir);
      setImmediate(a, b)
    }.bind(this))
  }

  function oa(a, b, c) {
    log.verbose("checkDirectory: " + b);
    if (fs.existsSync(b))
      if (fs.statSync(b).isDirectory()) {
        b = fs.realpathSync(b);
        if (a.force) return c();
        if (fs.existsSync(path.join(b, "appinfo.json"))) this.appCount++,
          log.verbose("FOUND appinfo.json, appCount " + this.appCount), 1 < this.appCount ? c("ERROR: only one application is supported") : (this.originAppDir = this.appDir = b, c());
        else if (fs.existsSync(path.join(b, "packageinfo.json"))) this.pkgDir = b, c();
        else if (fs.existsSync(path.join(b, "services.json"))) this.svcDir = this.svcDir || [], this.svcDir = this.svcDir.concat(b), c();
        else if (fs.existsSync(path.join(b, "account-templates.json"))) c("ERROR: account directory support is not yet implemented");
        else {
          var d = [];
          this.svcDir = this.svcDir ||
            [];
          this.svcDir = this.svcDir.concat(b);
          F.call(this, d, function(a) {
            0 < d.length ? c() : c("ERROR: '" + b + "' has no meta files such as appinfo.json")
          })
        }
      } else c("ERROR: '" + b + "' is not a directory");
    else c("ERROR: directory '" + b + "' does not exist")
  }

  function F(a, b) {
    var c = [].concat(this.svcDir || this.originAppDir || []),
      d = [];
    if (0 === c.length) return setImmediate(b);
    async.forEach(c, function(b, c) {
      s(b, "services.json", d, function(b) {
        if (b) return setImmediate(c, b);
        d.forEach(function(b) {
          var c = new I;
          c.srcDir = path.dirname(b);
          c.dirName =
            path.basename(c.srcDir);
          a.push(c)
        });
        setImmediate(c, b)
      })
    }, function(a) {
      setImmediate(b, a)
    })
  }

  function s(a, b, c, d) {
    async.waterfall([fs.readdir.bind(null, a), function(d, e) {
      async.forEach(d, function(d, f) {
        var e = path.join(a, d);
        async.waterfall([fs.lstat.bind(null, e), function(a, f) {
          a.isFile() ? (d === b && c.push(e), f()) : a.isDirectory() ? s(e, b, c, f) : f()
        }], f)
      }, e)
    }], function(a) {
      d(a)
    })
  }

  function pa(a) {
    log.verbose("loadServiceInfo");
    for (idx in this.services) {
      var b = path.join(this.services[idx].srcDir, "services.json");
      try {
        var c =
          fs.readFileSync(b);
        this.services[idx].serviceInfo = JSON.parse(c);
        this.services[idx].valid = !0
      } catch (d) {
        return setImmediate(a, d)
      }
    }
    log.verbose("num of serviceInfo: " + this.services.length);
    setImmediate(a)
  }

  function qa(a) {
    log.verbose("checkServiceInfo");
    if (0 === this.appCount) return setImmediate(a);
    var b = this.appinfo.id;
    this.services.forEach(function(c) {
      !1 !== c.valid && w(c.serviceInfo).forEach(function(c) {
        if (-1 === c.indexOf(b + ".")) return setImmediate(a, Error('service name "' + c + '" must be subdomain of app id "' +
          b + '"'))
      }.bind(this))
    }.bind(this));
    setImmediate(a)
  }

  function ra(a) {
    log.verbose("createServiceDir");
    this.services.forEach(function(b) {
      !1 !== b.valid && w(b.serviceInfo).forEach(function(c) {
        c = path.join(this.tempDir, "data/usr/palm/services", c);
        b.dstDirs.push(c);
        try {
          mkdirp.sync(c)
        } catch (d) {
          return setImmediate(a, d)
        }
      }.bind(this))
    }.bind(this));
    setImmediate(a)
  }

  function sa(a) {
    log.verbose("copyService");
    var b = this.services.filter(function(a) {
      return a.valid
    });
    try {
      async.forEachSeries(b, function(a, b) {
        async.forEach(a.dstDirs,
          function(b, c) {
            this.dataCopyCount++;
            q(a.srcDir, b, c)
          }, b)
      }, a)
    } catch (c) {
      setImmediate(a, c)
    }
  }

  function ta(a) {
    log.verbose("addServiceInPkgInfo");
    if (0 === this.appCount) return setImmediate(a);
    if (this.rom) setImmediate(a);
    else {
      var b = path.join(this.packageDir, "packageinfo.json"),
        c;
      try {
        var d = fs.readFileSync(b),
          f = 0;
        log.verbose("PACKAGEINFO >>" + d + "<<");
        c = JSON.parse(d)
      } catch (e) {
        console.error(e), setImmediate(a, e)
      }
      this.services.filter(function(a) {
        return a.valid
      }).forEach(function(a) {
        w(a.serviceInfo).forEach(function(a) {
          this.pkgServiceNames.push(a);
          f++
        }.bind(this))
      }.bind(this));
      0 < f ? (c.services = this.pkgServiceNames, d = JSON.stringify(c, null, 2) + "\n", log.verbose("Modified package.json: " + d), fs.writeFile(path.join(this.packageDir, "packageinfo.json"), d, a)) : setImmediate(a)
    }
  }

  function ua(a) {
    log.verbose("removeServiceFromAppDir");
    if (0 === this.appCount) return setImmediate(a);
    var b = this.applicationDir,
      c = !1,
      d = fs.readdirSync(b); - 1 !== d.indexOf("services") && (b = path.join(this.applicationDir, "services"), fs.statSync(b).isDirectory() && (c = !0));
    if (!0 === c) try {
      shelljs.rm("-rf",
        b)
    } catch (f) {
      console.log("ERROR:" + f)
    } else
      for (var e in this.services) {
        var g = this.services[e].dirName;
        d.forEach(function(a) {
          if (g === a) try {
            var b = path.join(this.applicationDir, this.services[e].dirName);
            shelljs.rm("-rf", b)
          } catch (c) {
            console.log("ERROR:" + c)
          }
        }, this)
      }
    setImmediate(a)
  }

  function va(a, b, c) {
    log.verbose("copyData ** Only run when force packaging");
    if (b && 0 === this.dataCopyCount) {
      var d = path.join(this.tempDir, "data");
      async.forEachSeries(a, function(a, b) {
        q(a, d, b)
      }, function(a, b) {
        setImmediate(c, a)
      }.bind(this))
    } else return setImmediate(c)
  }

  function w(a) {
    var b = [];
    "id" === wa ? b = [a.id] : a.services && (b = (a.services instanceof Array ? a.services : [a.services]).map(function(a) {
      return a.name
    }));
    return b
  }

  function xa(a, b) {
    this.oldmask = process.umask(a);
    setImmediate(b)
  }

  function ya(a) {
    this.oldmask && process.umask(this.oldmask);
    setImmediate(a)
  }

  function y(a, b, c) {
    var d = fs.readFileSync(a),
      f = chardet.detect(new Buffer(d)); - 1 === ["UTF-8", "ISO-8895-1"].indexOf(f) && (log.verbose("Current Encoding Type>> " + f + "<<"), d = encoding.convert(d, "UTF-8", f));
    d = stripbom(d);
    b &&
      fs.writeFileSync(a, d, {
        encoding: "utf8"
      });
    "undefined" !== c && "function" === typeof c && setImmediate(c, null, d);
    return d
  }
  log.heading = "packager";
  log.level = "warn";
  var wa = "id",
    z = {
      $frameworks: "/usr/palm/frameworks",
      "$enyo-framework": "/usr/palm/frameworks/enyo"
    },
    B = {
      onDeviceSource: !0,
      additionalHtmlFiles: !0,
      assets: !0,
      exclude: !0
    },
    Z = {
      containerJS: !0,
      containerCSS: !0
    },
    r = {
      main: !0,
      icon: !0,
      largeIcon: !0,
      bgImage: !0,
      splashBackground: !0,
      imageForRecents: !0,
      sysAssetsBasePath: !0
    },
    G = {};
  "undefined" !== typeof module && module.exports &&
    (module.exports = G);
  var H = 0;
  G.Packager = x;
  x.prototype = {
    checkInputDirectories: function(a, b, c) {
      log.verbose("checkInputDirectories: " + a);
      var d = this;
      async.forEachSeries(a, oa.bind(this, b), function(a, e) {
        a ? setImmediate(c, a) : b.force || 0 !== this.appCount ? commonTools.appdata.compareProfile("signage", function(a, b) {
          if (b && d.appDir && fs.existsSync(path.join(d.appDir, "content"))) return setImmediate(c, "ERROR: APP_DIR should not contain 'content' folder or file");
          setImmediate(c)
        }) : setImmediate(c, "ERROR: At least an APP_DIR must be specified")
      }.bind(this))
    },
    generatePackage: function(a, b, c, d) {
      log.verbose("generatePackage: from " + a);
      this.dataCopyCount = 0;
      async.series([this.checkInputDirectories.bind(this, a, c), xa.bind(this, 0), J.bind(this), K.bind(this), L.bind(this), O.bind(this), P.bind(this), S.bind(this), R.bind(this), T.bind(this), M.bind(this), V.bind(this), U.bind(this), W.bind(this), Y.bind(this), $.bind(this), aa.bind(this), ba.bind(this), ca.bind(this), F.bind(this, this.services), pa.bind(this), qa.bind(this), ra.bind(this), sa.bind(this), ta.bind(this), ua.bind(this),
        va.bind(this, a, c.force), da.bind(this, a), X.bind(this), ea.bind(this, b, c.pkgname, c.pkgversion), ya.bind(this), na.bind(this)
      ], function(a, b) {
        a ? setImmediate(d, a) : setImmediate(d, null, {
          ipk: this.ipk,
          msg: "Success"
        })
      }.bind(this))
    }
  }
})();
