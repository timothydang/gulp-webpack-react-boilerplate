'use strict'

var webpack = require('webpack')
var precss = require('precss')
var cssnano = require('cssnano')
var atImport = require('postcss-import')
var partialImport = require('postcss-partial-import')
var path = require('path')

var options = {
  debug: false,
  entry: [
    './Frontend/src/js/main.js',
    './Frontend/src/styles/main.css'
  ],
  output: {
    path: path.join(__dirname, '../.tmp/assets/'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
      { test: /\.jsx$/, loader: 'jsx?harmony', exclude: /node_modules/ }
    ]
  },
  postcss: [
    atImport,
    cssnano({
      sourcemap: true,
      autoprefixer: {
        add: true,
        remove: true,
        browsers: ['last 2 versions']
      },
      safe: true,
      discardComments: {
        removeAll: true
      }
    }),
    precss
  ],
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.CommonsChunkPlugin('init.js'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
}

module.exports = options
