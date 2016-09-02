var gulp = require('gulp');
var $ = require('gulp-load-plugins')({ lazy: false });

var source = require('vinyl-source-stream2');
var browserify = require('browserify');

var path = require('path');

var pkg = require('./package.json');

var banner = ['/**',
' * <%= pkg.name %> - <%= pkg.description %>',
' * @version v<%= pkg.version %>',
' * @author <%= pkg.author %>',
' * @link <%= pkg.homepage %>',
' * @license <%= pkg.license %>',
' */',
''].join('\n');

gulp.task('test', function() {
    return gulp.src('test/**/*.test.js', { read: false })
      .pipe($.mocha({
          reporter: 'mocha-better-spec-reporter'
      }));
});

gulp.task('script', function () {
    var bundleStream = browserify({
        entries: './lib/should.js',
        builtins: ['util', 'assert']
    })
      .bundle({
          insertGlobals: false,
          detectGlobals: false,
          standalone: 'Should'
      });

    return bundleStream
      .pipe(source('should.js'))
      .pipe($.header(banner, { pkg : pkg } ))
      .pipe(gulp.dest('./'))
      .pipe($.uglify())
      .pipe($.header(banner, { pkg : pkg } ))
      .pipe($.rename('should.min.js'))
      .pipe(gulp.dest('./'));
});