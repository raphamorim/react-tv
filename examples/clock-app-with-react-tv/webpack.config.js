var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/App.js',
  output: { path: __dirname, filename: 'bundle.js' },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env', 'react']
        }
      }
    ]
  },
};
