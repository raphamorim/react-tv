var async=require("async"),path=require("path"),npmlog=require("npmlog"),fs=require("fs"),childprocess=require("child_process"),novacom=require("./novacom"),errMsgHndl=require("./error-handler"),novacomusb=require("./novacom-usb");
(function(){var b=npmlog;b.heading="logger";b.level="warn";var k={log:b,remoteRun:function(c,d,g){b.info("shell#remoteRun()");var h=new novacom.Session(c,function(a,l){b.verbose("run()","run:",d);b.verbose("run()","options:",c);a?g(a):h.run(d,process.stdin,process.stdout,process.stderr,g)})},shell:function(c,d){async.waterfall([function(a){new novacom.Session(c,a)},function(a,b){a.target.conn?-1!==a.target.conn.indexOf("ssh")?h(a,b):g(a,b):h(a,b)}],function(a,b){setImmediate(d,a)});var g=function(a,
c){var e=require("child_process").spawn,f=novacomusb.getNovacomPath(),e=e(f,["-t","open","tty://","-d",a.target.id]);process.stdout.write(">>> Start "+a.getDevice().name+" shell.\n");process.stdout.write(">>> Type `exit` to quit.\n\n");e.stdout.pipe(process.stdout);process.stdin.pipe(e.stdin);e.on("exit",function(a,e){process.stdout.write("\n>>> Terminate the shell, bye.\n\n");b.silly("Stream :: exit :: code: "+a+", signal: "+e);c()})},h=function(a,d){b.info("shell#shell()");async.series([function(e){a?
setImmediate(e):a=new novacom.Session(c,e)},function(e){var f={term:"screen"};a.ssh.shell(f,function(c,d){if(c)return setImmediate(e,errMsgHndl.changeErrMsg(c));(function(){function c(a){if(f.rows!==process.stdout.rows||f.columns!==process.stdout.columns)a.setWindow(process.stdout.rows,process.stdout.columns),f.rows=process.stdout.rows,f.columns=process.stdout.columns}d.on("exit",function(c,d){process.stdout.write("\n>>> Terminate the shell, bye.\n\n");b.silly("Stream :: exit :: code: "+c+", signal: "+
d);a.ssh.end();e()});d.on("data",function(a,e){c(d)});process.stdout.on("resize",function(){c(d)});process.stdout.write(">>> Start "+a.getDevice().name+" shell.\n");process.stdout.write(">>> Type `exit` to quit.\n\n");process.stdin.setRawMode(!0);process.stdin.pipe(d);d.pipe(process.stdout)})()})}],function(a,c){var b=!1;0<c.indexOf("id")&&(b=!0);d(a,b)})}}};"undefined"!==typeof module&&module.exports&&(module.exports=k)})();