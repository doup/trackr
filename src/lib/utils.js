import jsop from 'jsop';
import mkdirp from 'mkdirp';
import path from 'path';

export function getDate(date) {
    var date = date || new Date();

    return date.toISOString().substring(0, 10);
}

export function getDB(dbPath) {
    mkdirp.sync(path.dirname(dbPath));

    return jsop(dbPath);
}

export function getTimeCode(date) {
    var date = date || new Date();

    return date.getHours() +':'+ date.getMinutes();
}

export function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
