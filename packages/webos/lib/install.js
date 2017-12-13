var fs = require("fs"),
  path = require("path"),
  util = require("util"),
  npmlog = require("npmlog"),
  async = require("async"),
  streamBuffers = require("stream-buffers"),
  crypto = require("crypto"),
  luna = require("./luna"),
  novacom = require("./novacom"),
  appdata = require("./cli-appdata"),
  errMsgHndl = require("./error-handler");
(function() {
  function q(a, b) {
    var c = [{
        idx: 0,
        name: "internal",
        dvid: null,
        drid: null,
        type: "flash",
        uri: "/media/developer"
      }],
      d = a.session.getDevice().lunaAddr.getStorageList;
    if (!d) return b(null, c);
    var e = d.returnValue.split(".");
    luna.send(a, d, {
      subscribe: !1
    }, function(a, d) {
      var b = a;
      for (index = 1; index < e.length; index++) b = b[e[index]];
      !0 === b.returnValue && b.devices && b.devices.filter(function(a) {
        return "usb" === a.deviceType
      }).forEach(function(a) {
        a.subDevices.forEach(function(b) {
          c.push({
            idx: c.length,
            name: "usb" + c.length,
            dvid: a.deviceId,
            drid: b.deviceId,
            type: "usb",
            uri: b.deviceUri
          })
        })
      });
      d(null, c)
    }, b)
  }
  var b = npmlog;
  b.heading = "installer";
  b.level = "warn";
  var t = new appdata,
    u = {
      log: b,
      install: function(a, f, c) {
        if ("function" !== typeof c) throw Error("Missing completion callback (next=" + util.inspect(c) + ")");
        var d = path.basename(f),
          e = {
            tempDirForIpk: "/media/developer/temp",
            changeTempDir: !0,
            removeIpkAfterInst: !0
          },
          n = t.getConfig(!0);
        if (n.install)
          for (prop in n = n.install, n) e.hasOwnProperty(prop) && (e[prop] = n[prop]);
        if (d) {
          var k = path.join(e.tempDirForIpk,
              d).replace(/\\/g, "/"),
            r = new streamBuffers.WritableStreamBuffer,
            s = a.appId,
            g, l, h = 200,
            m;
          b.info("installer#install():", "installing " + f);
          a = a || {};
          async.waterfall([function(p) {
              a.nReplies = 0;
              new novacom.Session(a.device, p)
            }, function(p, b) {
              a.session = p;
              setImmediate(b, null, a)
            }, q, function(b, c) {
              var g = b.map(function(a) {
                return a.name
              });
              if (a.storage && -1 === g.indexOf(a.storage)) return setImmediate(c, Error("invalid storage name"));
              b.forEach(function(b) {
                b.name === a.storage && (m = b)
              });
              m && e.changeTempDir && (e.tempDirForIpk =
                path.join(m.uri, "temp").replace(/\\/g, "/"), k = path.join(e.tempDirForIpk, d).replace(/\\/g, "/"));
              setImmediate(c)
            }, function(b) {
              if (a.opkg && "root" != a.session.getDevice().username) return setImmediate(b, Error("opkg-install is only available for the device allowing root-connection"));
              var c = "/bin/rm -rf " + e.tempDirForIpk + " && /bin/mkdir -p " + e.tempDirForIpk;
              "root" === a.session.getDevice().username && (c += " && /bin/chmod 777 " + e.tempDirForIpk);
              a.op = (a.session.target.files || "stream") + "Put";
              a.session.run(c, null,
                null, null, b)
            }, function(b) {
              console.log("Installing package " + f);
              a.session.put(f, k, b)
            }, function(b) {
              a.session.run('/bin/ls -l "' + k + '"', null, r, null, b)
            }, function(a) {
              b.verbose("installer#install():", "ls -l:", r.getContents().toString());
              a()
            }, function(a) {
              var c = crypto.createHash("md5"),
                d = new Buffer(h),
                e = 0;
              async.waterfall([fs.lstat.bind(fs, f), function(a, b) {
                a.size > h ? e = a.size - h : (e = 0, h = a.size);
                b()
              }, fs.open.bind(fs, f, "r"), function(a, b) {
                fs.read(a, d, 0, h, e, function(a, g) {
                  c.update(d);
                  b()
                })
              }, function() {
                (g = c.digest("hex")) ||
                b.warn("installer#install():", "Failed to get md5sum from the ipk file");
                b.verbose("installer#install():", "srcMd5:", g);
                a()
              }], function(b) {
                a(b)
              })
            }, function(c) {
              function d(a) {
                if (a = Buffer.isBuffer(a) ? a.toString().trim() : a.trim()) l = a.split("-")[0].trim(), b.verbose("installer#install():", "dstMd5:", l);
                l || b.warn("installer#install():", "Failed to get md5sum from the transmitted file");
                c()
              }
              var g = "/usr/bin/tail -c " + h + ' "' + k + '" | /usr/bin/md5sum';
              async.series([function(b) {
                a.session.run(g, null, d, null, b)
              }], function(a) {
                if (a) return c(a)
              })
            },
            function(a) {
              if (g && l) {
                if (b.verbose("installer#install():", "srcMd5:", g, ", dstMd5:", l), g !== l) return a(Error("File transmission error, please try again."))
              } else b.warn("installer#install():", "Cannot verify transmitted file");
              a()
            },
            function(c) {
              function d(b) {
                function c(a) {
                  a = Buffer.isBuffer(a) ? a.toString() : a;
                  console.log(a)
                }
                var g = '/usr/bin/opkg install "' + k + '"',
                  g = g.concat(a.opkg_param ? " " + a.opkg_param : "");
                async.series([a.session.run.bind(a.session, g, null, c, c), a.session.run.bind(a.session, "/usr/sbin/ls-control scan-services ",
                  null, null, c)], function(a) {
                  if (a) return b(a);
                  b(null, null)
                })
              }

              function g(c) {
                var d = a.session.getDevice(),
                  e = d.lunaAddr.install,
                  f = e.returnValue.split("."),
                  h = "webos3" === d.type ? {
                    target: k,
                    subscribe: !0
                  } : {
                    id: s,
                    ipkUrl: k,
                    subscribe: !0
                  };
                "webos3" !== d.type && m && m.dvid && m.drid && (h.target = {
                  deviceId: m.dvid,
                  driveId: m.drid
                });
                luna.send(a, e, h, function(a, c) {
                  b.verbose("installer#install():", "lineObj: %j", a);
                  var d = a;
                  for (index = 1; index < f.length; index++) d = d[f[index]];
                  d.match(/FAILED/i) ? (b.verbose("installer#install():", "failure"),
                    a.details && a.details.errorCode ? c(errMsgHndl.getErrMsg(e.service, a.details.errorCode) || d) : c(d)) : d.match(/installed|^SUCCESS/i) ? (b.verbose("installer#install():", "success"), c(null, d)) : (b.verbose("installer#install():", "waiting"), c(null, null))
                }, c)
              }
              op = a.opkg ? d : g;
              op(c)
            },
            function(b, c) {
              "function" === typeof b && (c = b);
              e.removeIpkAfterInst ? a.session.run('/bin/rm -f "' + k + '"', null, null, null, c) : c()
            },
            function() {
              a.session.end();
              a.session = null;
              c(null, {
                msg: "Success"
              })
            }
          ], function(a) {
            b.verbose("installer#waterfall callback err:",
              a);
            c(a)
          })
        } else c(Error("Invalid package: '" + f + "'"))
      },
      remove: function(a, f, c) {
        if ("function" !== typeof c) throw Error("Missing completion callback (next=" + util.inspect(c) + ")");
        a = a || {};
        async.waterfall([function(b) {
          a.nReplies = void 0;
          a.session = new novacom.Session(a.device, b)
        }, function(b, c) {
          a.session = b;
          if (a.opkg && "root" != a.session.getDevice().username) return setImmediate(c, Error("opkg-remove is only available for the device allowing root-connection"));
          setImmediate(c)
        }, function(c) {
          function e(b) {
            function c(a) {
              a =
                Buffer.isBuffer(a) ? a.toString() : a;
              return b(Error(a))
            }
            var d = "/usr/bin/opkg remove " + f,
              d = d.concat(a.opkg_param ? " " + a.opkg_param : "");
            async.series([a.session.run.bind(a.session, d, null, function(a) {
              a = Buffer.isBuffer(a) ? a.toString() : a;
              console.log(a);
              if (a.match(/No packages removed/g)) return b(Error("[package Name: " + f + "] " + a))
            }, c), a.session.run.bind(a.session, "/usr/sbin/ls-control scan-services ", null, null, c)], function(a) {
              if (a) return b(a);
              b(null, {})
            })
          }

          function n(c) {
            var d = a.session.getDevice(),
              e = d.lunaAddr.remove,
              g = e.returnValue.split("."),
              l = 0;
            luna.send(a, e, "webos3" === d.type ? {
              subscribe: !0,
              packageName: f
            } : {
              id: f,
              subscribe: !0
            }, function(a, c) {
              b.verbose("installer#remove():", "lineObj: %j", a);
              var d = a;
              for (index = 1; index < g.length; index++) d = d[g[index]];
              d.match(/FAILED/i) ? (b.verbose("installer#remove():", "failure"), l++ || c(Error(d))) : d.match(/removed|^SUCCESS/i) ? (b.verbose("installer#remove():", "success"), c(null, {
                status: d
              })) : (b.verbose("installer#remove():", "waiting"), c())
            }, c)
          }
          op = a.opkg ? e : n;
          op(c)
        }], function(a, e) {
          b.verbose("installer#remove():",
            "err:", a, "result:", e);
          a || (e.msg = "Removed package " + f);
          c(a, e)
        })
      },
      list: function(a, f) {
        if ("function" !== typeof f) throw Error("Missing completion callback (next=" + util.inspect(f) + ")");
        a = a || {};
        async.waterfall([function(b) {
          a.nReplies = 1;
          a.session = new novacom.Session(a.device, b)
        }, function(b, d) {
          a.session = b;
          if (a.opkg && "root" != a.session.getDevice().username) return setImmediate(d, Error("opkg-list is only available for the device allowing root-connection"));
          setImmediate(d)
        }, function(c) {
          function d(b) {
            function c(a) {
              a =
                Buffer.isBuffer(a) ? a.toString() : a;
              console.log(a)
            }
            var d;
            d = "/usr/bin/opkg list".concat(a.opkg_param ? " " + a.opkg_param : "");
            async.series([a.session.run.bind(a.session, d, null, c, c)], function(a) {
              if (a) return b(a);
              b(null, {})
            })
          }

          function e(c) {
            var d = a.session.getDevice().lunaAddr.list,
              e = d.returnValue.split(".");
            luna.send(a, d, {
              subscribe: !1
            }, function(a, c) {
              for (var d = a, f = 1; f < e.length; f++) d = d[e[f]];
              if (Array.isArray(d)) {
                for (var f = 0; f < d.length; f++) d[f].visible || (d.splice(f, 1), f--);
                b.verbose("installer#list():", "success");
                c(null, d)
              } else b.verbose("installer#list():", "failure"), c(Error("object format error"))
            }, c)
          }
          op = a.opkg ? d : e;
          op(c)
        }], function(a, d) {
          b.verbose("installer#list():", "err:", a, "results:", d);
          f(a, d)
        })
      },
      listStorage: function(a, f) {
        if ("function" !== typeof f) throw Error("Missing completion callback (next=" + util.inspect(f) + ")");
        a = a || {};
        async.waterfall([function(b) {
          a.nReplies = 1;
          a.session = new novacom.Session(a.device, b)
        }, function(b, d) {
          a.session = b;
          setImmediate(d, null, a)
        }, q], function(a, d) {
          b.verbose("installer#listStorage():",
            "err:", a, "results:", d);
          f(a, d)
        })
      }
    };
  "undefined" !== typeof module && module.exports && (module.exports = u)
})();
