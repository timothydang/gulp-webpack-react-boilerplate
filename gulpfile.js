'use strict'

var gulp = require('gulp')
var usemin = require('gulp-usemin')
var rev = require('gulp-rev')
var uglify = require('gulp-uglify')
var del = require('del')

var webpack = require('webpack')
var WebpackServer = require('webpack-dev-server')
var merge2 = require('merge2')
var pngquant = require('imagemin-pngquant')
var jade = require('gulp-jade')
var runSequence = require('run-sequence')
var argv = require('yargs').argv
var plugins  = require("gulp-load-plugins")({
                    pattern: ['gulp-*', 'gulp.*'],
                    replaceString: /\bgulp[\-.]/
                })
var util = plugins.util

// BRANDS DEFINITION
var BRANDS = ['honda', 'skoda'];
var currentBrand = argv.brand
if(currentBrand === undefined) {
  currentBrand = 'all'
}


gulp.task('set-env-dev', function() {
  process.env.NODE_ENV = 'development'
  return util.log(util.colors.green('Running on', process.env.NODE_ENV, ' mode'));
})

gulp.task('set-env-prod', function() {
  process.env.NODE_ENV = 'production'
  return util.log(util.colors.green('Running on', process.env.NODE_ENV, ' mode'));
})

gulp.task('clean', function(done) {
  del(['Assets/*', '.tmp'], done)
})

gulp.task('jade', function () {
  return gulp.src('./Frontend/views/**/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./Frontend/.tmp/'))
})

gulp.task('watch-files', function() {
  gulp.watch('./Frontend/views/**/*.jade', ['jade'])
})

gulp.task('webpack-local-dev', ['clean'], function() {
  var compiler = webpack(require('./Frontend/config/webpack.config.js'))

  var server = new WebpackServer(compiler, {
    hot: true,
    contentBase: __dirname + '/Frontend/.tmp/',
    publicPath: '/Assets/'
  })

  server.listen(8080)
})

gulp.task('copy', function(done) {
  var assetPath = './Assets/'
  if(process.env.NODE_ENV === 'development') {
    assetPath = './Frontend/.tmp/Assets/'
  }

  var font = gulp.src('./Frontend/assets/' + currentBrand + '/fonts/*.{ttf,woff,woff2,eof,eot,svg}')
              .pipe(gulp.dest(assetPath + currentBrand + '/fonts/'))

  var images = gulp.src('./Frontend/assets/' + currentBrand + '/images/**/*.{jpg,jpeg,png,gif,svg}')
                .pipe(plugins.imagemin({
                  progressive: true,
                  svgoPlugins: [{removeViewBox: false}],
                  use: [pngquant()]
                }))
                .pipe(gulp.dest(assetPath + currentBrand + '/images/'))

  var staticAssets = gulp.src('./Frontend/assets/' + currentBrand + '/static/**/*.*')
                      .pipe(gulp.dest(assetPath + currentBrand + '/static/'))

  var jsFiles = gulp.src('./Frontend/.tmp/Assets/' + currentBrand + '/js/**/*.*')
                  .pipe(gulp.dest(assetPath + currentBrand + '/js/'))

  var cssFiles = gulp.src('./Frontend/.tmp/Assets/' + currentBrand + '/css/**/*.*')
                  .pipe(gulp.dest(assetPath + currentBrand + '/css/'))

  return merge2(font, images, staticAssets, jsFiles, cssFiles)
})

gulp.task('webpack-production', function(done) {
  webpack(require('./Frontend/config/webpack.dist.config.js')).run(function(err, stats) {
    if (err) throw err
    gulp.start(['copy'])
    done()
  })
})

// Prod
gulp.task('build:steps', ['set-env-prod', 'clean', 'webpack-production'])
gulp.task('build', function() {
  if(currentBrand !== 'all') {
    util.log(util.colors.red('BRAND:', currentBrand));
    process.env.currentBrand = currentBrand
    gulp.start(['build:' + currentBrand])
  } else {
    util.log(util.colors.red('BUILDING FOR ALL BRANDS'));
    var tasks = []
    for(var i=0; i < BRANDS.length; i++) {
      tasks.push('build:' + BRANDS[i])
    }
    runSequence(tasks)
  }
})
gulp.task('build:honda', ['build:steps'])
gulp.task('build:skoda', ['build:steps'])

// Dev
gulp.task('dev:steps', ['set-env-dev', 'jade', 'webpack-local-dev', 'copy', 'watch-files'])
gulp.task('dev', function() {
  if(currentBrand && currentBrand !== 'all') {
    util.log(util.colors.red('BRAND:', currentBrand));
    gulp.start(['dev:' + currentBrand])
  }
})
gulp.task('dev:honda', ['dev:steps'])
gulp.task('dev:skoda', ['dev:steps'])

gulp.task('set-brand-as-default', function() {
    process.env.currentBrand = currentBrand = 'honda'
});

// Default
gulp.task('default', ['set-brand-as-default', 'dev'])
