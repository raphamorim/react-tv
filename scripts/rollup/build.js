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

function stripEnvVariables(production) {
  return {
    __DEV__: production ? 'false' : 'true',
    'process.env.NODE_ENV': production ? "'production'" : "'development'",
  };
}

function createBundle({entryPath, bundleType, destName}) {
  entryPath = path.resolve(entryPath);
  const logKey =
    chalk.white.bold(entryPath) + chalk.dim(` (${REACT_TV_VERSION})`);
  console.log(`${chalk.blue(bundleType)} ${logKey} -> dist/${destName}`);

  let plugins = [
    flow(),
    replace(stripEnvVariables()),
    babel({
      exclude: 'node_modules/**',
      externalHelpers: false,
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
  ];

  if (bundleType.indexOf('PROD') >= 0) {
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
  bundleType: 'PROD',
  destName: 'react-tv.production.js',
});

createBundle({
  entryPath: `${packagePath}/ReactTVEntry.js`,
  bundleType: 'DEV',
  destName: 'react-tv.development.js',
});

Promise.all(tasks).catch(error => {
  Promise.reject(error);
});
