var gulp = require('gulp');
var babel = require('gulp-babel');
var gulpAtom = require('gulp-atom');

gulp.task('6to5', function () {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            comments: false
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('copy', function () {
    return gulp.src(['src/**/*', '!src/**/*.js'])
        .pipe(gulp.dest('dist'));
});

gulp.task('atom', function () {
    return gulpAtom({
        srcPath: './dist',
        releasePath: './build',
        cachePath: './cache',
        version: 'v0.24.0',
        rebuild: false,
        platforms: ['darwin-x64']
    });
});

gulp.task('build', gulp.series(
    gulp.parallel('6to5', 'copy'),
    'atom'
));