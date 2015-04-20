'use strict';

var Promise = require('bluebird');
var exec = require('child_process').exec;

function isActive(user) {
    return new Promise(function (resolve, reject) {
        exec("stat -f '%u %Su' /dev/console", function (err, stdout, stdin) {
            if (err) { reject(err); }
            resolve(stdout.replace(/^\s+|\s+$/g, '').indexOf(user) !== -1);
        });
    })
}

var tick = 0;

function doTick() {
    isActive('doup').then(function (isActive) {
        console.log(tick +' - '+ isActive);
        tick++;
    });

    setTimeout(doTick, 1000);
}

doTick();
