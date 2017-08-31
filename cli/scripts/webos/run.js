function defaultPlaformEnv() {
  const webOS_TV_SDK_ENV = process.env['WEBOS_CLI_TV'] || false;

  if (webOS_TV_SDK_ENV) {
    return webOS_TV_SDK_ENV;
  }

  // if darwin
  return '/opt/webOS_TV_SDK/CLI/bin';
}

module.exports = function _runWebOSDev(path) {
  console.log(defaultPlaformEnv())
}
