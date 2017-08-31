const path = require('path');
const chalk = require('chalk');
const execSync = require('child_process').execSync;

function defaultCLIEnv() {
  // if darwin
  return '/opt/webOS_TV_SDK/CLI/bin';
}

// ares-package first-app
// Run the webOS TV Emulator
// ares-install com.yourdomain.app.firstapp_0.0.1_all.ipk
// ares-launch com.yourdomain.app.firstapp

// vboxmanage list vms
// virtualbox

module.exports = function _runWebOSDev(paramsPath) {
  const webOS_TV_SDK_ENV = process.env['WEBOS_CLI_TV'] || false;
  if (!webOS_TV_SDK_ENV)
    process.env['WEBOS_CLI_TV'] = defaultCLIEnv();

  process.env['PATH'] = `${process.env['WEBOS_CLI_TV']}:${process.env['PATH']}`

  const webOSAPPPath = path.resolve(paramsPath, 'webos');

  console.log(chalk.dim('Packing...'));

  execSync(`cd ${webOSAPPPath} && ares-package .`);
  console.log(chalk.yellow(` succefull pack from ${webOSAPPPath}`));

  console.log(chalk.dim('Installing...'));
  const config = JSON.parse(execSync(`cat ${webOSAPPPath}/appinfo.json`).toString());

  const latestIPK = config.id + '_' + config.version + '_all.ipk';
  console.log(chalk.blue(` installing ${latestIPK} as IPK`));
  execSync(`cd ${webOSAPPPath} && ares-install ${latestIPK}`);
  console.log(chalk.yellow(` succefull install ${config.title}`));


  console.log(chalk.dim('Launching...'));
  execSync(`cd ${webOSAPPPath} && ares-launch ${config.id}`);
  console.log(chalk.yellow(` launched`));
}
