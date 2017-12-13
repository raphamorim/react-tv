var util=require("util"),async=require("async"),path=require("path"),npmlog=require("npmlog"),request=require("request"),luna=require("./luna"),streamBuffers=require("stream-buffers"),spawn=require("child_process").spawn,fs=require("fs"),novacom=require("./novacom"),server=require("./server"),sdkenv=require("./sdkenv"),installer=require("./install"),launcher=require("./launch"),platformOpen={win32:["cmd","/c","start"],darwin:["open"],linux:["xdg-open"]},defaultAppInsptPort="9998",defaultNodeInsptPort=
"8080",defaultServiceDebugPort="5885";
(function(){var f=npmlog;f.heading="inspector";f.level="warn";var m={log:f,inspect:function(a,m,k){function l(b,d){var c=util.format("netstat -ltn 2>/dev/null | grep :%s | wc -l",b);async.series([a.session.run.bind(a.session,c,process.stdin,function(a){a=Buffer.isBuffer(a)?a.toString().trim():a.trim();if("0"===a)d(null,b);else if("1"===a)b=Number(b)+1,l(b,d);else return d(Error("Failed to get Debug Port"))},process.stderr)],function(a,c){a&&d(a)})}if("function"!==typeof k)throw Error("Missing completion callback (next="+
util.inspect(k)+")");a.svcDbgInfo={};a&&a.hasOwnProperty("serviceId")&&(a.serviceId instanceof Array?a.serviceId.forEach(function(b){a.svcDbgInfo[b]={}}):a.svcDbgInfo[a.serviceId]={});async.series([function(b){(new sdkenv.Env).getEnvValue("BROWSER",function(d,c){a.bundledBrowserPath=c;b()})},function(b){if(!a.serviceId)return b();installer.list(a,function(d,c){c instanceof Array&&(a.instPkgs=c);b(d)})},function(b){a.nReplies=1;a.session=new novacom.Session(a.device,b)},function(b){f.verbose("inspector#inspect()#_runApp");
if(!a.appId||a.running)return b();launcher.listRunningApp(a,null,function(d,c){c=[].concat(c);var g=c.map(function(a){return a.id});f.verbose("inspector#inspect()#_runApp#runAppIds",g.join(","));-1===g.indexOf(a.appId)?(f.verbose("inspector#inspect()#_runApp#launch",a.appId),launcher.launch(a,a.appId,{},b)):b()})},function(b){a.appId?a.session.forward(defaultAppInsptPort,a.hostPort||0,a.appId,b):b()},function(b){if(a.appId){var d="http://localhost:"+a.session.getLocalPortByName(a.appId),c;a.session.target.noPortForwarding&&
(f.verbose("inspector#inspect()","noPortForwarding"),d="http://"+a.session.ssh._host+":9998");var g=[{reqPath:"/pagelist.json",propName:"inspectorUrl"},{reqPath:"/json/list",propName:"devtoolsFrontendUrl"}],h=function(a,e){"@@ARES_CLOSE@@"===a?(e.status(200).send(),c=setTimeout(function(){process.exit(0)},2E3)):"@@GET_URL@@"===a&&(clearTimeout(c),e.status(200).send(d))},e=function(c,e){c?process.exit(1):e&&e.msg&&a.open&&server.openBrowser("http://localhost:"+e.port+"/ares_cli/ares.html",a.bundledBrowserPath)};
async.whilst(function(){return 0<g.length},function(e){listFile=g.pop();if(!listFile)return e();request.get(d+listFile.reqPath,function(c,b,f){if(c||200!==b.statusCode)return e();c=JSON.parse(f);for(var h in c)if(-1!=c[h].url.indexOf(a.appId)||-1!=c[h].url.indexOf(a.localIP))d+=c[h][listFile.propName],g=[];e()})}.bind(this),function(a){console.log("Application Debugging - "+d);server.runServer(__dirname,0,h,e)})}b()},function(b){var d=Object.keys(a.svcDbgInfo).filter(function(a){return"undefined"!==
a});async.forEachSeries(d,function(c,b){if(!c)return b();var d=defaultServiceDebugPort;async.waterfall([function(e){a.instPkgs&&a.instPkgs.every(function(e){return-1!==c.indexOf(e.id)?(a.svcDbgInfo[c].path=path.join(path.dirname(e.folderPath),"..","services",c).replace(/\\/g,"/"),!1):!0});if(!a.svcDbgInfo[c].path)return e(Error("Failed to get service installation path '"+c+"'"));e()},function(e){var b="cat "+path.join(a.svcDbgInfo[c].path,"services.json").replace(/\\/g,"/"),d;async.series([a.session.run.bind(a.session,
b,process.stdin,function(a){d=Buffer.isBuffer(a)?a.toString().trim():a.trim();e(null,d)},process.stderr)],function(a,b){if(a)return e(Error("Failed to find an installed service '"+c+"'"))})},function(a,b){try{if("native"===JSON.parse(a).engine)return b(Error(c+" is a native service, please use ares-gdbserver to debug it."));b()}catch(d){b(d)}},function(e){a.nReplies=1;luna.send(a,{service:c,method:"quit"},{},function(a,c){e()},e)},function(e){a.session.runNoHangup("mkdir -p "+a.svcDbgInfo[c].path+
"/_ares",e)},l.bind(this,d),function(e,b){d=e;a.session.runNoHangup("echo "+d+" > "+a.svcDbgInfo[c].path+"/_ares/debugger-port",b)},function(a){setTimeout(function(){a()},1E3)}.bind(this),function(b){a.svcDbgInfo[c].port=d;a.nReplies=1;luna.send(a,{service:c,method:"info"},{},function(a,c){b()},b)}.bind(this),function(a){setTimeout(function(){a()},1E3)}.bind(this),a.session.forward.bind(a.session,defaultNodeInsptPort,a.hostPort||0,c),function(b){a.session.runNoHangup("rm -rf "+a.svcDbgInfo[c].path+
"/_ares",b)},function(b,c){if(!a.svcDbgInfo[b].port)return c();var d,f=a.session.getLocalPortByName(b),g;d=util.format("http://%s:%s/debug?port=%s","localhost",f,a.svcDbgInfo[b].port);request.get(d,function(b,e,f){b||200!=e.statusCode||(console.log("nodeInsptUrl:",d),server.runServer(__dirname,0,function(a,b){"@@ARES_CLOSE@@"===a?(b.status(200).send(),g=setTimeout(function(){process.exit(0)},2E3)):"@@GET_URL@@"===a&&(clearTimeout(g),b.status(200).send(d))},function(b,c){b?process.exit(1):c&&c.msg&&
a.open&&server.openBrowser("http://localhost:"+c.port+"/ares_cli/ares.html",a.bundledBrowserPath)}),c())})}.bind(this,c)],function(a,c){f.verbose("inspector#inspect()","err: ",a,"results:",c);b(a,c)})},function(a){b(a)})},function(a){f.verbose("inspector#inspect()","running...");setImmediate(a)}],function(a,d){f.verbose("inspector#inspect()","err: ",a,"results:",d);setImmediate(k,a)})}};"undefined"!==typeof module&&module.exports&&(module.exports=m)})();
