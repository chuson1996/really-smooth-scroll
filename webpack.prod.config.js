'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

var webpack = require('webpack');
var path = require('path');

// currently, this is for bower
var config = {
  devtool: 'sourcemap',
  entry: {
    index: './src/really-smooth-scroll.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: 'build/',
    filename: 'really-smooth-scroll.js',
    sourceMapFilename: 'really-smooth-scroll.map',
    library: 'ReallySmoothScroll',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)/,
      loader: 'babel'
    }]
  },
  plugins: [],
  resolve: {
    extensions: ['', '.js']
  },
};

module.exports = config;
