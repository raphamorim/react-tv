const path = require('path');
const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const flow = require('rollup-plugin-flow');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const replace = require('rollup-plugin-replace');
const optimizeJs = require('rollup-plugin-optimize-js');
const chalk = require('chalk');

const REACT_TV_VERSION = require('../../package.json').version;
const packagePath = 'packages/react-tv';

let tasks = [];

function stripEnvVariables(env) {
  return {
    __DEV__: env === 'production' ? 'false' : 'true',
    'process.env.NODE_ENV': "'" + env + "'",
  };
}

function createBundle({entryPath, bundleType, destName}) {
  entryPath = path.resolve(entryPath);
  const logKey =
    chalk.white.bold(entryPath) + chalk.dim(` (${REACT_TV_VERSION})`);
  console.log(`${chalk.blue(bundleType)} ${logKey} -> dist/${destName}`);

  let plugins = [
    flow(),
    replace(stripEnvVariables(bundleType)),
    babel({
      exclude: 'node_modules/**',
      externalHelpers: false,
    }),
    commonjs({
      include: 'node_modules/**',
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
  ];

  if (bundleType.indexOf('production') >= 0) {
    plugins = plugins.concat([optimizeJs(), uglify()]);
  }

  rollup({
    input: entryPath,
    plugins: plugins,
    sourcemap: false,
  }).then(bundle => {
    tasks.push(
      bundle.write({
        format: 'umd',
        name: 'ReactTV',
        file: `${packagePath}/dist/${destName}`,
      })
    );
  });
}

createBundle({
  entryPath: `${packagePath}/ReactTVEntry.js`,
  bundleType: 'production',
  destName: 'react-tv.production.js',
});

createBundle({
  entryPath: `${packagePath}/ReactTVEntry.js`,
  bundleType: 'development',
  destName: 'react-tv.development.js',
});

Promise.all(tasks).catch(error => {
  Promise.reject(error);
});
