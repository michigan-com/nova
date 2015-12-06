'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

// Postcss + plugins
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var nested = require('postcss-nested');
var vars = require('postcss-simple-vars');
var cssImport = require('postcss-import');
var calc = require('postcss-calc');
var extend = require('postcss-extend');

var processors = [
  cssImport,
  autoprefixer({ browsers: ['last 2 versions']}),
  nested,
  vars,
  calc,
  extend
];

function bundleOpts() {
  return {
    prod: false,
    src: './src/css/**/*.css',
    dest: './public/css'
  };
}

function bundleFiles(done, opts) {
  if (typeof opts === 'undefined') opts = bundleOpts();

  if (opts.prod) {
    bundleProd(done, opts);
  } else {
    bundleProd(done, opts);
  }
}

function bundle(done, opts) {
 return gulp.src(opts.src)
    .pipe(postcss(processors, {
      maps: { inline: true }
    }))
    .pipe(gulp.dest(opts.dest))
    .on('end', function() {
      gutil.log('PostCSS finished compiling CSS files');
      done();
    });
}

function bundleProd(done, opts) {
  return gulp.src(opts.src)
    .pipe(postcss(processors))
    .pipe(gulp.dest(opts.dest))
    .on('end', function() {
      gutil.log('Sass finished compiling CSS files');
      done();
    });
}

module.exports = {
  bundleFiles: bundleFiles,
  opts: bundleOpts
};
