'use strict'

var webpack = require('webpack')
var precss = require('precss')
var cssnano = require('cssnano')
var atImport = require('postcss-import')
var partialImport = require('postcss-partial-import')
var path = require('path')
var vendor_dir = path.resolve(__dirname, '../vendors');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin')
var argv = require('yargs').argv

var currentBrand = argv.brand || process.env.currentBrand
var options = {
  cache: false,
  debug: true,
  devtool: 'eval',
  addVendor: function (name, path) {
   this.resolve.alias[name] = path;
   this.module.noParse.push(new RegExp('^' + name + '$'));
  },
  entry: {
    app: [
      'webpack-dev-server/client?http://127.0.0.1:8080',
      'webpack/hot/only-dev-server',
      './Frontend/src/js/' + currentBrand + '.js',
      './Frontend/src/styles/' + currentBrand + '.css'
    ],
    vendors: ['react', 'react-dom', 'jquery', 'modernizr', 'jquery.validate', 'respond']
  },
  resolve: { alias: {} },
  output: {
    path: path.join(__dirname, '../.tmp/Assets/' + currentBrand + '/'),
    publicPath: '/Assets/' + currentBrand,
    filename: './' + currentBrand + '/js/[name].js'
  },
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader!postcss-loader' },
      {
        test: /\.jsx$/,
        loaders: ['react-hot', 'jsx?harmony', 'babel'],
        exclude: /node_modules/
      },
      { test: require.resolve('react'), loader: 'expose?React' },
      { test: require.resolve('react-dom'), loader: 'expose?ReactDOM' }
    ],
    noParse: []
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendors', currentBrand + '/js/vendors.js'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      proxy: 'http://localhost:8080/'
    },
    {
      reload: false
    })
  ]
}

options.addVendor('jquery', vendor_dir + '/jquery.js')
options.addVendor('modernizr', vendor_dir + '/modernizr.js')
options.addVendor('jquery.validate', vendor_dir + '/jquery.validate.js')
options.addVendor('respond', vendor_dir + '/respond.js')

module.exports = options
