const path = require('path');
const fs = require('fs');

function getCLIEnv() {
  const darwin = '/opt/webOS_TV_SDK/CLI/bin';
  const linux = '/usr/local/share/webOS_TV_SDK';
  const win = 'C:/webOS_TV_SDK/CLI/';

  if (process.platform === 'darwin') {
    return darwin;
  }
  if (process.platform === 'linux') {
    return linux;
  }
  if (process.platform === 'win32') {
    return win;
  }

  return darwin;
}

function isReactTVWebOSProject(root) {
  const appinfo = path.resolve(root, 'react-tv/webos/appinfo.json');
  if (fs.existsSync(appinfo)) {
    return true;
  }
  return false;
}

module.exports = {
  getCLIEnv: getCLIEnv,
  isReactTVWebOSProject: isReactTVWebOSProject,
};
