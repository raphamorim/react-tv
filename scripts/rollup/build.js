'use strict';

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

let tasks = [];

function stripEnvVariables(production) {
  return {
    __DEV__: production ? 'false' : 'true',
    'process.env.NODE_ENV': production ? "'production'" : "'development'",
  };
}

function createBundle({ entryPath, bundleType, destName }) {
  entryPath = path.resolve(entryPath);
  const logKey = chalk.white.bold(entryPath) + chalk.dim(` (${REACT_TV_VERSION})`);
  console.log(`${chalk.blue(bundleType)} ${logKey} -> dist/${destName}`);

  let plugins = [
    flow(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      externalHelpers: true,
      presets: [
        [ 'env', { 'modules': false } ],
        'react',
        'stage-2'
      ],
      plugins: [
        'transform-flow-strip-types',
        'external-helpers'
      ]
    })
  ]

  if (bundleType.indexOf('PROD') >= 0)
    plugins = plugins.concat([
      uglify(),
      optimizeJs(),
      replace(stripEnvVariables())
    ])

  plugins = plugins.concat([
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    })
  ]);

  rollup({
    input: entryPath,
    plugins: plugins,
    external: ['react'],
    sourcemap: false,
  }).then(bundle => {
    tasks.push(
      bundle.write({
        format: (bundleType === 'PROD-UMD') ? 'umd' : 'iife',
        name: 'ReactTV',
        file: `dist/${destName}`,
      })
    )
  })
}

createBundle({
  entryPath: 'src/ReactTVEntry.js',
  bundleType: 'DEV',
  destName: 'react-tv.js',
});

if (process.env['NODE_ENV'] === 'PROD') {
  createBundle({
    entryPath: 'src/ReactTVEntry.js',
    bundleType: 'PROD',
    destName: 'react-tv.min.js',
  });

  createBundle({
    entryPath: 'src/ReactTVEntry.js',
    bundleType: 'PROD-UMD',
    destName: 'react-tv.umd.js',
  });
}

Promise.all(tasks).catch(error => {
  Promise.reject(error);
});
