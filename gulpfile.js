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

gulp.task('atom', function () {
    return gulpAtom({
        srcPath:     'build',
        releasePath: 'releases',
        cachePath:   'cache',
        version:     'v0.29.0',
        rebuild:     false,
        platforms:   ['darwin-x64']
    });
});

gulp.task('rebrand', function (done) {
    rebrand('./releases/v0.29.0/darwin-x64/Electron.app', {
        name:       'Trackr',
        identifier: 'com.illarra.trackr'
    }, done);
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('transpile', 'copy'),
    'atom',
    'rebrand'
));
