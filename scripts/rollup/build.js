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

const REACT_TV_VERSION = require('../../lerna.json').version;
const packagePath = 'packages/react-tv';
// const navigationPackagePath = 'packages/react-tv-navigation';

let tasks = [];

function stripEnvVariables(env) {
  return {
    __DEV__: env === 'production' ? 'false' : 'true',
    'process.env.NODE_ENV': "'" + env + "'",
  };
}

function createBundle({entryPath, bundleType, destName, dirPath, external}) {
  entryPath = path.resolve(dirPath, entryPath);
  const logKey =
    chalk.white.bold(entryPath) + chalk.dim(` (${REACT_TV_VERSION})`);
  console.log(
    `${chalk.blue(bundleType)} ${logKey} -> ${dirPath}/dist/${destName}`
  );

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
    external: external,
  }).then(bundle => {
    tasks.push(
      bundle.write({
        format: 'umd',
        name: 'ReactTV',
        file: `${dirPath}/dist/${destName}`,
      })
    );
  });
}

createBundle({
  entryPath: 'ReactTVEntry.js',
  bundleType: 'production',
  destName: 'react-tv.production.js',
  dirPath: packagePath,
});

createBundle({
  entryPath: 'ReactTVEntry.js',
  bundleType: 'development',
  destName: 'react-tv.development.js',
  dirPath: packagePath,
});

// createBundle({
//   entryPath: 'src/index.js',
//   bundleType: 'development',
//   destName: 'react-tv-navigation.development.js',
//   dirPath: navigationPackagePath,
//   external: ['react', 'react-tv']
// });

Promise.all(tasks).catch(error => {
  Promise.reject(error);
});
