'use strict'

var gulp = require('gulp')
var usemin = require('gulp-usemin')
var rev = require('gulp-rev')
var uglify = require('gulp-uglify')
var del = require('del')

var webpack = require('webpack')
var WebpackServer = require('webpack-dev-server')

gulp.task('clean', function(done) {
  del(['Assets/*', '.tmp'], done)
})

gulp.task('assets', function() {
  return gulp.src('app/index.html')
    .pipe(usemin({
      js: [rev(),uglify()]
    }))
    .pipe(gulp.dest('Assets'))
})

gulp.task('watch', ['clean'], function() {
  var compiler = webpack(require('./Frontend/config/webpack.config.js'))

  var server = new WebpackServer(compiler, {
    hot: true,
    contentBase: __dirname + '/Frontend/src/',
    publicPath: '/assets',
    filename: 'main.js'
  })

  server.listen(8080)
})

gulp.task('build', ['clean'], function(done) {
  webpack(require('./Frontend/config/webpack.dist.config.js')).run(function(err, stats) {
    if (err) throw err
    gulp.start(['assets'])
    done()
  })
})

gulp.task('default', ['watch'])
