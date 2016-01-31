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

var plugins  = require("gulp-load-plugins")({
                    pattern: ['gulp-*', 'gulp.*'],
                    replaceString: /\bgulp[\-.]/
                })

gulp.task('set-dev-node-env', function() {
    return process.env.NODE_ENV = 'development'
})

gulp.task('set-prod-node-env', function() {
    return process.env.NODE_ENV = 'production'
})

gulp.task('clean', function(done) {
  del(['Assets/*', '.tmp'], done)
})

// gulp.task('assets', function() {
//   return gulp.src('Frontend/src/index.html')
//     .pipe(usemin({
//       js: [rev(),uglify()]
//     }))
//     .pipe(gulp.dest('Assets'))
// })

gulp.task('jade', function () {
  return gulp.src('./Frontend/views/**/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./Frontend/'))
})

gulp.task('watch-files', function() {
  gulp.watch('./Frontend/views/**/*.jade', ['jade'])
})

gulp.task('watch', ['clean'], function() {
  var compiler = webpack(require('./Frontend/config/webpack.config.js'))

  var server = new WebpackServer(compiler, {
    hot: true,
    contentBase: __dirname + '/Frontend/',
    publicPath: '/Assets/'
  })

  server.listen(8080)
})

gulp.task('copy', function(done) {
  var font = gulp.src('./Frontend/assets/fonts/*.{ttf,woff,woff2,eof,eot,svg}')
              .pipe(gulp.dest('./Assets/fonts/'))

  var images = gulp.src('./Frontend/assets/images/**/*.{jpg,jpeg,png,gif,svg}')
                .pipe(plugins.imagemin({
                  progressive: true,
                  svgoPlugins: [{removeViewBox: false}],
                  use: [pngquant()]
                }))
                .pipe(gulp.dest('./Assets/images/'))

  var staticAssets = gulp.src('./Frontend/assets/static/**/*.*')
                      .pipe(gulp.dest('./Assets/static/'))

  var jsFiles = gulp.src('./Frontend/.tmp/assets/js/**/*.*')
                  .pipe(gulp.dest('./Assets/js/'))

  var cssFiles = gulp.src('./Frontend/.tmp/assets/css/**/*.*')
                  .pipe(gulp.dest('./Assets/css/'))

  return merge2(font, images, staticAssets, jsFiles, cssFiles)
})

gulp.task('webpack-production', function(done) {
  webpack(require('./Frontend/config/webpack.dist.config.js')).run(function(err, stats) {
    if (err) throw err
    gulp.start(['copy'])
    done()
  })
})

gulp.task('build', ['set-prod-node-env', 'clean', 'webpack-production'], function(done) {
  done()
})

gulp.task('default', ['set-dev-node-env', 'watch-files', 'watch'])
