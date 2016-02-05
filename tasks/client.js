'use strict';

var fs = require('fs');
var assign = require('object-assign');

var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var flatten = require('gulp-flatten');
var sourcemaps = require('gulp-sourcemaps');

var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var babelify = require('babelify');
var browserify = require('browserify');

var browserifyOpts = assign({}, watchify.args, { debug: true });

function bundleOpts() {
  return {
    prod: false,
    watch: false,
    src: './src/client/',
    dest: './public/js/',
    babel: {
      stage: 0,
      optional: ['runtime']
    },
    browserify: browserifyOpts
  };
}

/*
 * {  presets: ['es2015', 'react', 'stage-0'],
      plugins: ['transform-runtime'],
   }
 */

/**
 * Gets all .js files, non-recursively and then create separate browserify bundles
 * Or if options has a `files` property then it'll just iterate through that list of files
 */
function bundleFiles(done, options) {
  if (typeof options === 'undefined') options = bundleOpts();

  var reJSExt = new RegExp(/\.js$/i);

  var count = 0;
  var files = (options.files) ? options.files : fs.readdirSync(options.src);

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    if (!reJSExt.test(file)) continue;

    var opts = assign({}, options, { fname: options.src + file });
    if (opts.prod) {
      bundleProd(callbacksDone, opts);
      continue;
    }

    bundle(callbacksDone, opts);
  }

  function callbacksDone() {
    count++;
    if (count == files.length) done();
  }
}

/**
 * Bundles a single js file into a browserify bundle
 */
function bundle(done, options) {
  gutil.log('Browserify bundling ' + options.fname);

  var b = browserify(options.fname, options.browserifyOpts);
  // place all transforms here
  b.transform('babelify', options.babel);

  if (options.watch) {
    var w = watchify(b);
    gutil.log('Watching ' + options.fname);
    w.on('log', gutil.log);
    w.on('update', function() {
      bundle(undefined, options);
    });
  }

  return b.bundle()
    .on('error', gutil.log)
    .pipe(source(options.fname))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(flatten())
    .pipe(gulp.dest(options.dest))
    .on('end', function() {
      gutil.log('Browserify finishined bundling ' + options.fname);
      if (typeof done === 'function') done();
    });
}

function bundleProd(done, options) {
  gutil.log('Browserify bundling ' + options.fname);

  var b = browserify(options.fname, options.browserifyOpts);
  // place all transforms here
  b.transform('babelify', options.babel);

  return b.bundle()
    .on('error', gutil.log)
    .pipe(source(options.fname))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(flatten())
    .pipe(gulp.dest(options.dest))
    .on('end', function() {
      gutil.log('Browserify finishined bundling ' + options.fname);
      if (typeof done === 'function') done();
    });
}

module.exports = {
  bundleFiles: bundleFiles,
  opts: bundleOpts
};

