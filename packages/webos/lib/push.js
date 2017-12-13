var fs = require("fs"),
  async = require("async"),
  npmlog = require("npmlog"),
  util = require("util"),
  path = require("path"),
  streamBuffers = require("stream-buffers"),
  ssh2 = require("ssh2"),
  novacom = require("./novacom"),
  spawn = require("child_process").spawn,
  commonTools = require("./common-tools"),
  novacomUsb = require("./novacom-usb");
os = require("os");
(function() {
  var r = npmlog;
  r.heading = "push";
  r.level = "warn";
  var F = {
    push: function(l, s) {
      function A(c) {
        for (var a = 0; a < c.length; a++) - 1 < os.platform().indexOf("win") && (c = c.replace("\\", "/"));
        return c
      }

      function C(c) {
        t.run("/bin/mkdir -p " + c, null, null, null, function(a) {
          a && (1 == a.code && (a = Error("Failed creation of directory due to permission error in the destination path")), u(a))
        })
      }

      function u(c, a) {
        r.verbose("Push", "err: ", c, "result:", a);
        if (!c) {
          h = (new Date).getTime();
          var m = (h - D) / 1E3;
          console.log(w + " file(s) pushed");
          console.log(Math.round(e / (1024 * m)) + " KB/s (" + e + " bytes in " + m + "s)")
        }
        setImmediate(s, c, a)
      }
      if ("function" !== typeof s) throw Error("Missing completion callback (next=" + util.inspect(s) + ")");
      path.basename(process.argv[1]).replace(/.js/, "");
      var k, w = 0,
        e = 0,
        D = (new Date).getTime(),
        h = (new Date).getTime(),
        g = l.sourcePath,
        v = l.destinationPath,
        x = !1,
        E = new streamBuffers.WritableStreamBuffer,
        n = novacomUsb.getNovacomPath(),
        t;
      commonTools.appdata.compareProfile("watch", function(c, a) {
        x = a
      });
      String.prototype.replaceAll = function(c,
        a, m) {
        var d = this + "",
          e = -1;
        if ("string" === typeof c)
          if (m)
            for (c.toLowerCase(); - 1 !== (e = d.toLowerCase().indexOf(c, 0 <= e ? e + a.length : 0));) d = d.substring(0, e) + a + d.substring(e + c.length);
          else return this.split(c).join(a);
        return d
      };
      async.waterfall([function(c) {
        var a = new novacom.Resolver;
        async.waterfall([a.load.bind(a)], function() {
          var e = a.devices,
            d;
          for (d in e)
            if (e[d].name == l.device) {
              k = e[d].id;
              break
            }
          setImmediate(c)
        })
      }, function(c) {
        t = new novacom.Session(l.device, c)
      }, function(c) {
        r.info("push#transferFiles():", "sourcePath " +
          g, "destinationPath " + v);
        try {
          if (stats = fs.statSync(g), console.log("Copying data ...."), D = (new Date).getTime(), stats.isDirectory()) {
            var a = path.resolve(g),
              m = a.length,
              d = v,
              d = A(d),
              d = d.replaceAll(" ", "\\ "),
              s = function(a, c, b) {
                var d = fs.readdirSync(a),
                  h = -1;
                if (0 == d.length) return setImmediate(b);
                async.eachSeries(d, function(r, y) {
                  h++;
                  var q = path.join(a, r),
                    p = path.join(g, q.substring(m));
                  stat = fs.statSync(q);
                  if (stat.isDirectory()) stat.isDirectory() && async.waterfall([function(a) {
                    var b = path.join(v, q.substring(m)),
                      b = A(b),
                      b = b.replaceAll(" ", "\\ ");
                    x ? (b = k ? spawn(n, ["run", "file:///bin/mkdir " + b, "-d", k]) : spawn(n, ["run", "file:///bin/mkdir " + b]), b.stdin.end(), b.stderr.on("data", function(b) {
                      setImmediate(a, b)
                    }), b.on("close", function(b) {
                      setImmediate(a, null, q, !0)
                    })) : (C(b), setImmediate(a, null, q, !0))
                  }, s], function(b, a) {
                    b ? u(b, a) : setImmediate(y)
                  });
                  else {
                    var f = path.join(v, q.substring(m)),
                      f = A(f),
                      f = f.replaceAll(" ", "\\ "),
                      z;
                    if (x) {
                      z = k ? spawn(n, ["put", "file://" + f, "-d", k]) : spawn(n, ["put", "file://" + f]);
                      e += stat.size;
                      w++;
                      var B = fs.createReadStream(q);
                      B.on("error", function(a) {
                        setImmediate(b, a)
                      });
                      B.on("data", function(b) {
                        z.stdin.write(b)
                      });
                      B.on("end", function() {
                        z.stdin.end()
                      });
                      z.stderr.on("data", function(a) {
                        setImmediate(b, a)
                      });
                      z.on("close", function(a) {
                        f = f.replaceAll("//", "/");
                        l.ignore || console.log("Push: " + p + " -> " + f);
                        !0 == c ? h >= d.length - 1 ? setImmediate(b) : setImmediate(y) : setImmediate(y)
                      })
                    } else t.put(p, f, function(a) {
                      if (a) return 1 == a.code && (a = Error("File creation in device failed due to permission error in destination path")), setImmediate(b, a);
                      e += stat.size;
                      w++;
                      l.ignore || console.log("Push: " + p + " -> " + f);
                      !0 == c ? h >= d.length - 1 ? setImmediate(b) : setImmediate(y) : setImmediate(y)
                    })
                  }
                }, function(a) {
                  setImmediate(b, a)
                })
              };
            async.waterfall([function(b) {
              t.run("[ -d " + v + " ] && echo 'd' || echo 'nd'", null, E, null, function() {
                if ("d\n" == E.getContentsAsString()) setImmediate(b, null, a, !1);
                else {
                  var c;
                  x ? (c = k ? spawn(n, ["run", "file:///bin/mkdir " + d, "-d", k]) : spawn(n, ["run", "file:///bin/mkdir " + d]), c.stdin.end(), c.stderr.on("data", function(a) {
                    setImmediate(b, a)
                  }), c.on("close", function(c) {
                    setImmediate(b,
                      null, a, !1)
                  })) : (C(d), setImmediate(b, null, a, !1))
                }
              })
            }, s], u)
          } else if (stats.isFile()) {
            var h = new streamBuffers.WritableStreamBuffer,
              a = g,
              b = v,
              b = A(b),
              b = b.replaceAll(" ", "\\ ");
            async.waterfall([function(a) {
              t.run("[ -d " + b + " ] && echo 'd' || echo 'nd'", null, h, null, function() {
                var c;
                "d\n" == h.getContentsAsString() && (b = b + "/" + path.basename(g), b = b.replaceAll(" ", "\\ "));
                if (x) {
                  c = k ? spawn(n, ["put", "file://" + b, "-d", k]) : spawn(n, ["put", "file://" + b]);
                  e += stats.size;
                  w++;
                  var d = fs.createReadStream(g);
                  d.on("error", function(b) {
                    setImmediate(a,
                      b)
                  });
                  d.on("data", function(a) {
                    c.stdin.write(a)
                  });
                  d.on("end", function() {
                    c.stdin.end()
                  });
                  c.stderr.on("data", function(b) {
                    setImmediate(a, b)
                  });
                  c.on("close", function(c) {
                    b = b.replaceAll("//", "/");
                    l.ignore || console.log("Push: " + path.basename(g) + " -> " + b);
                    setImmediate(a)
                  })
                } else t.put(g, b, function(c) {
                  if (c) return 1 == c.code && (c = Error("File creation in device failed due to permission error in destination path")), setImmediate(a, c);
                  e += stats.size;
                  w++;
                  b = b.replaceAll("//", "/");
                  l.ignore || console.log("Push: " + path.basename(g) +
                    " -> " + b);
                  setImmediate(a)
                })
              })
            }], function(a, b) {
              u(a, b)
            })
          }
        } catch (p) {
          1 == p.code && (p = Error("Wrong path: " + p)), u(p)
        }
      }], u)
    }
  };
  "undefined" !== typeof module && module.exports && (module.exports = F)
})();
