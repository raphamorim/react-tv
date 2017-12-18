var async=require("async"),path=require("path"),npmlog=require("npmlog"),fs=require("fs"),childprocess=require("child_process"),commonTools=require("./common-tools"),novacom=require("./novacom"),novacomusb=require("./novacom-usb");
(function(){var c=npmlog;c.heading="logger";c.level="warn";var b={log:c,novacom_path:null,deviceId:null,enableRoot:function(e,a){console.log("Enable Root ....");b.options=e;b.novacom_path=novacomusb.getNovacomPath();async.waterfall([this._getdeviceInfo,function(d){function a(d){b._copyFile(path.join(h,"novacom-usb-auth-root.json"),k,function(a){if(a)return setImmediate(d,a);fs.chmod(c,384,d)})}var e=process.env.HOME||process.env.USERPROFILE,g=commonTools.appdata.getPath();!e&&process.env.HOMEPATH&&
process.env.HOMEDRIVE&&(e=path.join(process.env.HOMEDRIVE,process.env.HOMEPATH));var h=path.join(__dirname,"setting-files"),c=path.join(e,".ssh","webos_w2-linux-root"),l=path.join(e,".ssh","webos_w2-linux-root.ppk"),k=path.join(g,"novacom-usb-auth.json");b._copyFile(path.join(h,"keys","webos_w2-linux-root"),c,function(e){if(e)return setImmediate(d,e);-1<process.platform.indexOf("win")?b._copyFile(path.join(h,"keys","webos_w2-linux-root.ppk"),l,function(b){if(b)return setImmediate(d,b);a(d)}):a(d)})},
function(d){d(null,"checksum_root")},this._checkPrefFile,this._removeOldPref,this._putPref,function(d){var a=childprocess.spawn;novacomusb.getNovacomPath();a=b.deviceId?a(b.novacom_path,["run","file:///usr/bin/killall novacomd","-d",b.deviceId]):a(b.novacom_path,["run","file:///usr/bin/killall novacomd"]);a.on("error",function(a){c.silly("_killNovacomd error :: ",a)});a.stdin.end();a.on("close",function(a){setTimeout(d,4E3)})},this._reboot],a)},disableRoot:function(e,a){console.log("Disable Root ....");
b.options=e;b.novacom_path=novacomusb.getNovacomPath();async.waterfall([this._getdeviceInfo,function(a){function e(a){b._copyFile(path.join(c,"novacom-usb-auth-dev.json"),k,function(b){if(b)return setImmediate(a,b);fs.chmod(m,384,a)})}var f=process.env.HOME||process.env.USERPROFILE,g=process.env.APPDATA||process.env.HOME||process.env.USERPROFILE;!f&&process.env.HOMEPATH&&process.env.HOMEDRIVE&&(f=path.join(process.env.HOMEDRIVE,process.env.HOMEPATH));var c=path.join(__dirname,"setting-files"),m=path.join(f,
".ssh","webos_w2-linux-dev"),l=path.join(f,".ssh","webos_w2-linux-dev.ppk"),k=path.join(g,"novacom-usb-auth.json");b._copyFile(path.join(c,"keys","webos_w2-linux-dev"),m,function(g){if(g)return setImmediate(a,g);-1<process.platform.indexOf("win")?b._copyFile(path.join(c,"keys","webos_w2-linux-dev.ppk"),l,function(b){if(b)return setImmediate(a,b);e(a)}):e(a)})},function(a){a(null,"checksum_dev")},this._checkPrefFile,this._removeOldPref,this._putPref,this._reboot],a)},_checkPrefFile:function(b,a){fs.exists(path.join(__dirname,
"setting-files",b),function(d){d?a(null,b):setImmediate(a,"checksum file is not found")})},_removeOldPref:function(e,a){var d=childprocess.spawn,d=b.deviceId?d(b.novacom_path,["run","file:///bin/rm /var/luna/preferences/developer_key","-d",b.deviceId]):d(b.novacom_path,["run","file:///bin/rm /var/luna/preferences/developer_key"]);d.stderr.on("data",function(a){c.silly("_removeOldPref error :: ",a)});d.stdin.end();d.on("close",function(b){a(null,e)})},_putPref:function(e,a){var d=childprocess.spawn,
c;c=b.deviceId?d(b.novacom_path,["put","file:///var/luna/preferences/developer_key","-d",b.deviceId]):d(b.novacom_path,["put","file:///var/luna/preferences/developer_key"]);fs.readFile(path.join(__dirname,"setting-files",e),function(a,b){c.stdin.write(b);c.stdin.end()});c.stderr.on("data",function(b){setImmediate(a,b)});c.on("close",function(b){a(null)})},_reboot:function(e){console.log("Device will reboot");var a=childprocess.spawn,a=b.deviceId?a(b.novacom_path,["run","file:///sbin/reboot -f","-d",
b.deviceId]):a(b.novacom_path,["run","file:///sbin/reboot -f"]);a.stdin.end();a.on("error",function(a){c.silly("_reboot error :: ",a)});a.on("close",function(a){e(null)})},_copyFile:function(b,a,d){function c(a){f||(d(a),f=!0)}var f=!1;b=fs.createReadStream(b);b.on("error",function(a){c(a)});a=fs.createWriteStream(a);a.on("error",function(a){c(a)});a.on("close",function(a){c()});b.pipe(a)},_getdeviceInfo:function(c){var a=new novacom.Resolver;async.series([a.load.bind(a),function(d){for(var c in a.devices)if(a.devices[c].name==
b.options.device){b.deviceId=a.devices[c].id;break}d()}],function(){c()})}};"undefined"!==typeof module&&module.exports&&(module.exports=b)})();
