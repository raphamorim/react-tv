const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const execSync = require('child_process').execSync;

function defaultCLIEnv() {
  // default is Darwin
  return '/opt/webOS_TV_SDK/CLI/bin';
}

function isReactTVWebOSProject(root) {
  const appinfo = path.resolve(root, 'webos/appinfo.json');
  if (fs.existsSync(appinfo)) {
    return true;
  }
  return false;
}

function runWebOS(root, entry) {
  let webOS_TV_SDK_ENV = process.env['WEBOS_CLI_TV'] || false;
  if (!webOS_TV_SDK_ENV) {
    webOS_TV_SDK_ENV = defaultCLIEnv();
  }

  process.env['PATH'] = `${webOS_TV_SDK_ENV}:${process.env['PATH']}`;

  if (!isReactTVWebOSProject(root)) {
    const msg = `This project isn\'t a React-TV WebOS Project\n
    Just run "react-tv init"`;
    return console.log(chalk.dim('[react-tv]'), msg);
  }

  console.log('');
  console.log(chalk.dim('Up Emulator...'));
  execSync(
    `open ${
      webOS_TV_SDK_ENV
    }/../../Emulator/v3.0.0/LG_webOS_TV_Emulator_RCU.app`
  );
  console.log(chalk.yellow(' LG WebOS Emulator 3.0.0 succefull running'));

  let attemps = 0;
  const task = setInterval(function() {
    const runningVMS = execSync(`vboxmanage list runningvms`).toString();
    if (attemps > 15) {
      console.log('FAILED TO UP virtualbox emulator');
      clearInterval(task);
    }

    if (runningVMS.indexOf('webOS') < 0) {
      attemps += 1;
      return false;
    }

    clearInterval(task);

    console.log(runningVMS);
    console.log(chalk.dim('Packing...'));

    execSync(`cd ${root} && ares-package .`);
    console.log(chalk.yellow(` succefull pack from ${root}`));

    console.log(chalk.dim('Installing...'));
    const config = JSON.parse(
      execSync(`cat ${root}/appinfo.json`).toString()
    );

    const latestIPK = config.id + '_' + config.version + '_all.ipk';
    console.log(chalk.blue(` installing ${latestIPK} as IPK`));
    execSync(`cd ${root} && ares-install ${latestIPK}`);
    console.log(chalk.yellow(` succefull install ${config.title}`));

    console.log(chalk.dim('Launching...'));
    execSync(`cd ${root} && ares-launch ${config.id}`);
    console.log(chalk.yellow(` launched`));
  }, 500);
};

module.exports = runWebOS;
