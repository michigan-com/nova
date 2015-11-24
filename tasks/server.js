'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');

function bundleOpts() {
  return {
    src: './src/server/**/*.js',
    dest: './dist/'
  };
};

function bundleFiles(done, opts) {
  gutil.log('Babel bundling server js');

  return gulp.src(opts.src)
    .pipe(plumber())
    .pipe(babel(opts.babel))
    .pipe(gulp.dest(opts.dest))
    .on('end', function() {
      gutil.log('Babel finished compiling server bundles');
      done();
    });
}

module.exports = {
  bundleFiles: bundleFiles,
  opts: bundleOpts
};
