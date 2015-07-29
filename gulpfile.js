'use strict';

var babel    = require('gulp-babel');
var del      = require('del');
var gulp     = require('gulp');
var packager = require('electron-packager');
var electron = require('electron-connect').server.create();
var useref   = require('gulp-useref');

gulp.task('clean', function (done) {
    del(['releases', 'build'], done);
});

gulp.task('transpile', function () {
    return gulp.src(['app/**/*.js', '!app/components/**/*', '!app/node_modules/**/*'])
        .pipe(babel({
            comments: false
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('copy', function () {
    return gulp.src(['app/**/*', '!app/src/**/*.js'])
        .pipe(gulp.dest('build'));
});

gulp.task('clean-ref', function () {
    return gulp.src('build/**/*.html')
        .pipe(useref())
        .pipe(gulp.dest('build'));
});

gulp.task('package', function (done) {
    packager({
        dir: 'build',
        out: 'releases',
        name: 'Trackr',
        platform: 'darwin',
        arch: 'x64',
        version: '0.28.3',
        overwrite: true,
        icon: 'design/trackr.icns'
    }, done);
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('transpile', 'copy'),
    'clean-ref',
    'package'
));

gulp.task('serve', function () {
    // Start browser process
    electron.start();

    // Restart browser process
    gulp.watch('app/src/main.js', gulp.series(gulp.parallel('transpile', 'copy'), electron.restart));

    // Reload renderer process
    gulp.watch([
        'app/**/*',
        '!app/components/**/*',
        '!app/node_modules/**/*',
        '!app/src/main.js'
    ], gulp.series(gulp.parallel('transpile', 'copy'), electron.reload));
});

gulp.task('default', gulp.series('clean', gulp.parallel('transpile', 'copy'), 'serve'));
