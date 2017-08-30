const webOS_TV_SDK_bin = process.env['WEBOS_CLI_TV'] || defaultPlatformEnv();

function defaultPlaformEnv() {
  // if darwin
  return '/opt/webOS_TV_SDK/CLI/bin';
}
