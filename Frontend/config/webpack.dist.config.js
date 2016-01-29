'use strict'

var webpack = require('webpack')
var precss = require('precss')
var cssnano = require('cssnano')
var atImport = require('postcss-import')
var path = require('path')
var ExtractTextPlugin = require("extract-text-webpack-plugin")

var options = {
  debug: false,
  entry: {
    app: [
      './Frontend/src/js/main.js'
    ],
    vendors: ['react', 'react-dom']
  },
  output: {
    path: path.join(__dirname, '../.tmp/Assets/'),
    filename: './js/[name].js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader') },
      {
        test: /\.jsx$/,
        loaders: ['jsx?harmony', 'babel'],
        exclude: /node_modules/
      },
      { test: require.resolve('react'), loader: 'expose?React' },
      { test: require.resolve('react-dom'), loader: 'expose?ReactDOM' }
    ]
  },
  postcss: [
    atImport,
    precss,
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
    })
  ],
  plugins: [
    new ExtractTextPlugin("css/app.css", {
      publicPath: '/styles/',
      allChunks: true
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'js/vendors.js'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
}

module.exports = options