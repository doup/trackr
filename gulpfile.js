var babel    = require('gulp-babel');
var del      = require('del');
var fs       = require('fs');
var gulp     = require('gulp');
var gulpAtom = require('gulp-atom');
var path     = require('path');
var plist    = require('plist');

function updatePlist(path, data) {
    var info = plist.parse(fs.readFileSync(path, 'utf8'));

    for (key in data) {
        info[key] = data[key];
    }

    fs.writeFileSync(path, plist.build(info));
}

function rebrand(appPath, ops, cb) {
    appPath = path.normalize(__dirname +'/'+ appPath);
    var newPath = path.dirname(appPath) +'/'+ ops.name + path.extname(appPath);

    /*
    // NOT WORKING RIGHT NOW
    ['Electron Helper EH.app', 'Electron Helper NP.app', 'Electron Helper.app'].forEach(function (app) {
        var path   = appPath +'/Contents/Frameworks/'+ app;
        var newApp = path.replace('Electron', ops.name);
        console.log(path, newApp);
        fs.renameSync(path, newApp);
    });
    */

    updatePlist(appPath +'/Contents/Info.plist', {
        CFBundleDisplayName: ops.name,
        CFBundleIdentifier:  ops.identifier,
        CFBundleName:        ops.name,
    });

    updatePlist(appPath +'/Contents/Frameworks/Electron Helper.app/Contents/Info.plist', {
        CFBundleIdentifier:  ops.identifier +'.helper',
        CFBundleName:        ops.name +' Helper',
    });

    fs.renameSync(appPath, newPath);

    cb();
}

gulp.task('clean', function (done) {
    del(['build', 'dist'], done);
});

gulp.task('6to5', function () {
    return gulp.src(['src/**/*.js', '!src/components/**/*'])
        .pipe(babel({
            comments: false
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('copy', function () {
    return gulp.src(['src/**/*', '!src/lib/**/*.js'])
        .pipe(gulp.dest('dist'));
});

gulp.task('atom', function () {
    return gulpAtom({
        srcPath:     'dist',
        releasePath: 'build',
        cachePath:   'cache',
        version:     'v0.24.0',
        rebuild:     false,
        platforms:   ['darwin-x64']
    });
});

gulp.task('rebrand', function (done) {
    rebrand('./build/v0.24.0/darwin-x64/Electron.app', {
        name:       'Trackr',
        identifier: 'com.illarra.trackr'
    }, done);
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('6to5', 'copy'),
    'atom',
    'rebrand'
));
