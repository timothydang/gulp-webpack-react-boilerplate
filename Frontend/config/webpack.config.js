'use strict'

var webpack = require('webpack')
var precss = require('precss')
var cssnano = require('cssnano')
var atImport = require('postcss-import')
var partialImport = require('postcss-partial-import')

var options = {
  cache: true,
  debug: true,
  entry: {
    app: [
      'webpack-dev-server/client?http://127.0.0.1:8080',
      'webpack/hot/only-dev-server',
      './Frontend/src/js/main.js',
      './Frontend/src/styles/main.css'
    ],
    vendors: ['react', 'react-dom']
  },
  output: {
    path: __dirname + '/Assets/',
    publicPath: '/assets/',
    filename: './js/[name].js'
  },
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader!postcss-loader' },
      { test: /\.jsx$/, loader: 'react-hot!jsx?harmony', exclude: /node_modules/ },
      { test: require.resolve('react'), loader: 'expose?React' },
      { test: require.resolve('react-dom'), loader: 'expose?ReactDOM' }
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'js/vendors.js')
  ]
}

module.exports = options
