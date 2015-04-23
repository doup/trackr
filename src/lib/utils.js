import jsop from 'jsop';
import mkdirp from 'mkdirp';
import path from 'path';

export function pad(str, tpl) {
    // http://stackoverflow.com/questions/2686855
    return (tpl + str).slice(-tpl.length);
}

export function getDate(date) {
    var date = date || new Date();

    return [date.getFullYear(), pad(date.getMonth() + 1, '00'), pad(date.getDate(), '00')].join('-');
}

export function getDB(dbPath) {
    mkdirp.sync(path.dirname(dbPath));

    return jsop(dbPath);
}

export function getTimeCode(date) {
    var date = date || new Date();

    return pad(date.getHours(), '00') +':'+ pad(date.getMinutes(), '00');
}

export function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
