'use strict';

var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var tap = require('gulp-tap');
var sourcemaps = require('gulp-sourcemaps');
var neat = require('node-neat');

var babelify = require("babelify");
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var jsSrc = './src/client/';
var jsDist = './public/js/';
var jsBundle = ['popular.js'];

gulp.task('sass', function() {
  return bundleSass();
});

gulp.task('browserify', function(cb) {
  var bcb = (function() {
    var counter = 0;
    return function() {
      counter++;
      if (counter == jsBundle.length) return cb();
    };
  })();

  for (var i = 0; i < jsBundle.length; i++) {
    var fname = jsBundle[i];
    var filePath = jsSrc + fname;
    gulp.src(filePath)
        .pipe(plumber(gutil.log))
        .pipe(tap(bundleJs))
        .pipe(gulp.dest(jsDist))
        .on('end', function() {
          gutil.log('Browserify finished creating: ' + filePath);
          // if (typeof bcb === 'function') bcb();
        });
  }
});

// This gulp task now restarts after each JS error yaaaaay
gulp.task('watch', function() {
  // https://gist.github.com/RnbWd/2456ef5ce71a106addee
  for (var i = 0; i < jsBundle.length; i++) {
    var fname = jsBundle[i];
    gutil.log('Watching ' + fname + ' ...');
    var filePath = jsSrc + fname;
    gulp.watch(filePath, function() {
      return gulp.src(filePath)
        .pipe(plumber(gutil.log))
        .pipe(tap(bundleJs))
        .pipe(gulp.dest(jsDist))
        .on('end', function() {
          gutil.log('Browserify finished creating: ' + filePath);
          // if (typeof bcb === 'function') bcb();
        });
    });
  }

  gutil.log('Watching node modules ...');
  gulp.watch('./src/server/**/*.js', ['babel']);

  gutil.log('Watching scss files ...');
  gulp.watch('./src/scss/**/*.scss', function() {
    return bundleSass();
  });
});

gulp.task('babel', function(done) {
  babelBundle(done);
});

gulp.task('default', ['sass', 'babel', 'browserify']);

// https://gist.github.com/RnbWd/2456ef5ce71a106addee
function bundleJs(file, bcb) {
  if (!fs.existsSync(file.path)) {
    gutil.log('Could not find ' + file.path + ', ignoring')
    return;
  }

  gutil.log('Browserify is compiling ' + file.path);
  var b = browserify(file.path, { debug: true })
    .transform(babelify.configure({ stage: 0, optional: ['runtime'] }));

  // Do the necessary thing for tap/plumber
  var stream = b.bundle();
  file.contents = stream;

  // Source map
  stream
    .pipe(source(file.path))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
      .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(jsDist));
}

function babelBundle(cb) {
  var src = './src/server/**/*.js';
  var dist = './dist';

  gutil.log('Babel is generating ' + src + ' files to ' + dist + ' ...');

  return gulp.src(src)
    .pipe(plumber(gutil.log))
    .pipe(babel({ stage: 0, optional: ['runtime'] }))
    .pipe(gulp.dest(dist))
    .on('end', function() {
      gutil.log('Done babelifying');
      cb();
    });
}

function bundleSass() {
  var cssSrc = './src/scss/';
  var cssDist = './public/css/';
  var cssFiles = cssSrc + '**/*.scss';

  gutil.log('Compiling SASS files ...');

  var paths = ['./node_modules/'];
  paths = paths.concat(neat.includePaths);

  return gulp.src(cssFiles)
    .pipe(plumber(gutil.log))
    .pipe(sass({ includePaths: paths }))
    .pipe(gulp.dest(cssDist))
    .on('end', function() {
      gutil.log('Done compiling SASS files');
    });
}
